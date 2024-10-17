/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatService } from "../services/ChatService";
import ChatHistory from "../components/ChatHistory/ChatHistory";
import '../style/Chat.css'
import { ConversationsRepository } from "../repositories/ConversationsRepository";
import FollowUpQuestions from "../components/FollowUpQuestions";
import CustomTextarea, { ImperativeHandle } from "../components/CustomTextarea";
import { ActionType, useActiveConversationReducer } from "../hooks/useActiveConversationReducer";
import { WebSearchService } from "../services/WebSearchService";
import Modal from "../components/Modal/Modal";
import FormAgentSettings from "../components/Modal/FormAgentSettings";
import LeftPanel from "../components/LeftPanel/LeftPanel";
import RightPanel from "../components/RightPanel";
import LoadedModelInfosBar from "../components/LoadedModelInfosBar";
import useModalManager from "../hooks/useModalManager";
import { useStreamingState } from "../hooks/useStreamingState";
import { useWebSearchState } from "../hooks/useWebSearchState";
import { FormPromptSettings } from "../components/Modal/FormPromptSettings";
import { IConversation, IInferenceStats } from "../interfaces/IConversation";
import ErrorAlert from "../components/Modal/ErrorAlert";
import useFetchAgentsList from "../hooks/useFetchAgentsList";
import { FormUploadFile } from "../components/Modal/FormUploadFile";
import DocService from "../services/API/DocService";
import DocProcessorService from "../services/DocProcessorService";
import IRAGChunkResponse from "../interfaces/responses/IRAGChunkResponse";
// import SpeechRecognitionService from "../services/SpeechRecognitionService";

function Chat() {

    // const speechRecognition = useRef<SpeechRecognitionService>(new SpeechRecognitionService())

    useEffect(() => console.log("chat render"))

    const {AIAgentsList, triggerAIAgentsListRefresh} = useFetchAgentsList()
    
    const {isStreaming, isStreamingRef, setIsStreaming} = useStreamingState()

    // Active Conversation Management
    // Manages the state and context of the current active conversation
    // Used for displaying chat history and handling conversation selection
    const { activeConversationId, setActiveConversationId, activeConversationState, dispatch, activeConversationStateRef } = useActiveConversationReducer({name : "First Conversation", history : [], lastAgentUsed  : ""})

    // Auto-scroll Reference
    // Ref used to enable auto-scrolling feature during response streaming
    const historyContainerRef = useRef<HTMLDivElement>(null)

    // Panel Refresh Triggers
    // State variables to force re-renders left panels
    const [forceLeftPanelRefresh, setForceLeftPanelRefresh] = useState(0);
    // const [forceRightPanelRefresh, setForceRightPanelRefresh] = useState(0);

    // Textarea Value Management
    // Maintains the current value of the textarea at the component level
    const [textareaValue, _setTextareaValue] = useState("")
    const textareaValueRef = useRef<string>("")

    // Textarea Focus Control
    // Ref forwarded to the textarea to access its focus method
    // Utilized when a user selects one of the three suggestions
    const customTextareaRef = useRef<ImperativeHandle>(null)

    function setTextareaValue(value: string) {
        textareaValueRef.current = value
        _setTextareaValue(value)
    }

    // Modal management
    // Handles modal visibility and content switching
    const {modalVisibility, modalContentId, setModalVisibility, setModalContentId} = useModalManager({initialVisibility : false, initialModalContentId : "formAgentSettings"})
    
    // Memoized function to update modal status
    // Prevents unnecessary re-renders
    const memoizedSetModalStatus = useCallback(({visibility, contentId} : {visibility : boolean, contentId? : string}) => {
        setModalVisibility(visibility)
        if(contentId) setModalContentId(contentId)
    }, [])

    // Ref to store the name of the selected prompt in the left panel
    // Used by the modal to populate the prompt form
    const selectedPromptNameRef = useRef("")

    const {isWebSearchActivated, isWebSearchActivatedRef, setWebSearchActivated} = useWebSearchState()
    const [isFollowUpQuestionsClosed, setIsFollowUpQuestionsClosed] = useState<boolean>(false)

    // Effect hook for initial setup
    // Initializes conversation repository and sets scrollbar behavior
    const htmlRef = useRef(document.documentElement)
    useEffect(() => {
        // Initialize conversation repository with an empty conversation
        ConversationsRepository.pushNewConversation(activeConversationStateRef.current.name, activeConversationStateRef.current.history, activeConversationStateRef.current.lastAgentUsed)
        // Set scrollbar behavior for better UX
        if (htmlRef.current && htmlRef.current.style.overflowY != "scroll") {
            htmlRef.current.style.overflow = "-moz-scrollbars-vertical";
            htmlRef.current.style.overflowY = "scroll";
        }

        return () => {
            ConversationsRepository.clearAll()
        }
    }, [])

    // Effect hook for handling conversation switches
    // Aborts ongoing streaming, resets UI state, and loads the selected conversation
    useEffect(() => {
        // Abort any ongoing streaming when switching conversations
        if (isStreaming) ChatService.abortAgentLastRequest()
        // Reset UI state
        setIsStreaming(false)
        setTextareaValue("")
        // Load and set the selected conversation
        dispatch({ type: ActionType.SET_CONVERSATION, payload: ConversationsRepository.getConversation(activeConversationId.value) })
    }, [activeConversationId])

    // show an error modal with errorMessageRef as a message
    const errorMessageRef = useRef("")
    function showErrorModal(errorMessage : string){
        errorMessageRef.current = errorMessage
        setModalContentId("error")
        setModalVisibility(true)
    }

    const lastRAGResultsRef = useRef<IRAGChunkResponse[] | null>(null)

    /***
    //
    // LLM Requests
    //
    ***/

    /**
     * Request a streamed response from the active chatService agent
     * @param message The user's input message
     * @returns A Promise that resolves when the streaming is complete
     */
    async function askMainAgent_Streaming(message: string): Promise<void> {
        try {
            // Prevent empty messages or multiple concurrent streams
            if (message == "" || isStreamingRef.current) return
            // Convert context if the model has changed since the last question (temporarly disabled)
            const currentContext = await convertContextOnModelSwitch(activeConversationStateRef.current)
            setIsStreaming(true)
            // Create a new blank conversation Q&A pair in the active conversation state
            dispatch({ type: ActionType.NEW_BLANK_HISTORY_ELEMENT, payload: { message, agentUsed : ChatService.getActiveAgent().asString()}})
            scrollToBottom()
            let newContext = []
            let inferenceStats : IInferenceStats

            // Handle web search if activated, otherwise use internal knowledge
            if (isWebSearchActivatedRef.current == true) {
                // Perform web scraping and process the results
                const scrapedPages = await WebSearchService.scrapeRelatedDatas(message, 3, false)
                if(scrapedPages == null) return
                console.log("**LLM Loading**")
                // format MM/DD/YYYY
                const currentDate = "Current date : " + new Date().getFullYear() + "/" + new Date().getMonth() + "/" + new Date().getUTCDate() + ". "
                const finalDatas = await ChatService.askTheActiveAgentForAStreamedResponse(currentDate + message, /*showErrorModal, */pushStreamedChunkToHistory_Callback, currentContext, scrapedPages) // convert to object and add : showErrorModal : (errorMessage: string) => void
                newContext = finalDatas.newContext
                inferenceStats = finalDatas.inferenceStats
                if(isStreamingRef.current == false) return
                dispatch({ type: ActionType.ADD_SOURCES_TO_LAST_ANSWER, payload: scrapedPages })
            } else {
                // Use internal knowledge without web search
                console.log("**LLM Loading**")
                
                // If any document is selected, extract the relevant datas for RAG
                const ragContext = ChatService.getRAGTargetsFilenames().length > 0 ? await buildRAGContext(message) : ""

                const finalDatas = await ChatService.askTheActiveAgentForAStreamedResponse(ragContext + message, /*showErrorModal, */pushStreamedChunkToHistory_Callback, currentContext)
                newContext = finalDatas.newContext
                inferenceStats = finalDatas.inferenceStats
            }

            // If streaming was aborted, exit early
            if(isStreamingRef.current == false) return
            // Update the conversation history with new context and inference stats
            dispatch({ type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_CONTEXT_NSTATS, payload: {newContext : newContext || [], inferenceStats} })
            // Clear textarea if user hasn't modified it during streaming
            if(textareaValueRef.current == activeConversationStateRef.current.history.slice(-1)[0].question) setTextareaValue("")
            // TODO: Implement proper persistence instead of this temporary solution
            ConversationsRepository.replaceConversationHistoryById(activeConversationId.value, activeConversationStateRef.current.history)
        }
        catch (error : unknown) {
            if(isWebSearchActivatedRef.current) WebSearchService.abortLastRequest()
            console.error(error)

            // Abort requests shouldn't display any error modale
            if((JSON.stringify(error)).includes("abort")) return
            if(error instanceof Error && (error.name === "AbortError" || error.name.includes("abort") || error.message.includes("Signal"))) return

            ChatService.abortAgentLastRequest()
            showErrorModal("Stream failed : " + error)
        }finally{
            setIsStreaming(false)
        }
    }

    // callback passed to the chatService so it can display the streamed answer
    function pushStreamedChunkToHistory_Callback({markdown , html} : {markdown : string, html : string}): void {
        dispatch({ type: ActionType.UPDATE_LAST_HISTORY_ELEMENT_ANSWER, payload: { html, markdown } })
    }

    // retrieve the ragDatas to pour into the context
    async function buildRAGContext(message : string) : Promise<string> {
        const RAGChunks = await DocService.getRAGResults(message, ChatService.getRAGTargetsFilenames())
        lastRAGResultsRef.current = RAGChunks
        if(RAGChunks.length == 0) return ""
        return DocProcessorService.formatRAGDatas(RAGChunks)
    }

    // !!! will have to convert the conv into token using tokenizer and return only last num_ctx tokens
    async function convertContextOnModelSwitch(conversationState : IConversation) : Promise<number[]>{
        return conversationState.history[conversationState.history.length - 1]?.context
        /*if (conversationState?.lastAgentUsed != "" && conversationState?.lastAgentUsed != ChatService.getActiveAgent().asString()) {
            console.log("last used model : " + conversationState?.lastAgentUsed)
            console.log("new model : " + ChatService.getActiveAgent().getModelName())
            const activeAgent = ChatService.getActiveAgent()
            console.log("old context : " + JSON.stringify(conversationState.history[conversationState.history.length - 1]?.context || []))
            const concatenatedConversation = conversationState.history.reduce((acc , conversationQA) => acc + conversationQA.question + "\n\n\n" + conversationQA.answer.asMarkdown + "\n" , "")
            console.log("concat conversation : " + concatenatedConversation)
            console.log(activeAgent.getModelName())
            const newContext = await activeAgent.tokenize(concatenatedConversation)
            console.log("new context : " + JSON.stringify(newContext))
            return newContext
        }
        return conversationState.history[conversationState.history.length - 1]?.context || []*/
    }


    /***
    //
    // Events Handlers
    //
    ***/

    function handleAbortStreamingClick() {
        WebSearchService.abortLastRequest()
        ChatService.abortAgentLastRequest()
        setIsStreaming(false)
        dispatch({ type: ActionType.DELETE_LAST_HISTORY_ELEMENT })
    }

    function handleCustomTextareaFocus() {
        customTextareaRef.current?.focusTextarea()
    }

    function handleSearchWebClick(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault()
        setWebSearchActivated(!isWebSearchActivatedRef.current)
    }

    function handleScrollToTopClick(){
        document.getElementById("globalContainer")?.scrollIntoView({ behavior: "smooth" })
    }

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    function regenerateLastAnswer() {
        if(isStreamingRef.current) return
        const retrievedQuestion = activeConversationStateRef.current.history[activeConversationStateRef.current.history.length-1].question
        ConversationsRepository.replaceConversationHistoryById(activeConversationId.value, activeConversationStateRef.current.history.slice(0, -1))
        dispatch({ type: ActionType.DELETE_LAST_HISTORY_ELEMENT })
        askMainAgent_Streaming(retrievedQuestion)
    }

    function nanosecondsToSeconds(nanoseconds : number) {
        return nanoseconds / 1e9;
    }

    return (
    <div id="globalContainer" className="globalContainer">

        <LeftPanel key={"lp-" + forceLeftPanelRefresh} activeConversationStateRef={activeConversationStateRef} activeConversationId={activeConversationId.value} setActiveConversationId={setActiveConversationId} dispatch={dispatch} memoizedSetModalStatus={memoizedSetModalStatus} selectedPromptNameRef={selectedPromptNameRef}/>
        
        <main>

            <LoadedModelInfosBar hasStreamingEnded={!isStreaming}/>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} ref={historyContainerRef}> {/* element needed for scrolling*/}
                
                {<ChatHistory history={activeConversationState.history || []} isStreaming={isStreaming} setTextareaValue={setTextareaValue} regenerateLastAnswer={regenerateLastAnswer}/>} {/*isARequestBeingProcessed_Background={isARequestBeingProcessed_Background}*/}
            
            </div>
            <div className="stickyBottomContainer">

                {<CustomTextarea ref={customTextareaRef} 
                    setTextareaValue={setTextareaValue} textareaValue={textareaValue} 
                    currentContext={activeConversationStateRef.current.history[activeConversationStateRef.current.history.length - 1]?.context || []} 
                    askMainAgent_Streaming={askMainAgent_Streaming} activeConversationId={activeConversationId.value} />}

                {!isFollowUpQuestionsClosed && <FollowUpQuestions historyElement={activeConversationState.history[activeConversationState.history.length - 1]}
                    setTextareaValue={setTextareaValue} focusTextarea={handleCustomTextareaFocus} isStreaming={isStreaming} selfClose={setIsFollowUpQuestionsClosed}/>}
                
                <div className="sendButtonContainer">
                    <div title="active the web search / context length of 10000 recommended" style={{opacity : '1'}} className={isWebSearchActivated ? "searchWebCheck activated" : "searchWebCheck"} role="button" onClick={handleSearchWebClick}>
                        <span className="label">Web Search</span>
                        <div className='switchContainer'>
                            <div className={isWebSearchActivated ? 'switch active' : 'switch'}></div>
                        </div>
                    </div>
                    <div className="infosBottomContainer" onClick={() => console.log(JSON.stringify(lastRAGResultsRef.current))}>
                        <div>Model Loading : { (nanosecondsToSeconds(activeConversationStateRef.current.inferenceStats?.modelLoadingDuration || 0)).toFixed(2) } s</div>
                        <div>Prompt : { Math.min(100, ((activeConversationStateRef.current.inferenceStats?.promptTokensEval || 0) / nanosecondsToSeconds((activeConversationStateRef.current.inferenceStats?.promptEvalDuration || 1)))).toFixed(2) } tk/s</div>
                        <div>Inference : { ((activeConversationStateRef.current.inferenceStats?.tokensGenerated || 0) / nanosecondsToSeconds((activeConversationStateRef.current.inferenceStats?.inferenceDuration || 1))).toFixed(2) } tk/s</div>
                        <div>Full Process : { (nanosecondsToSeconds(activeConversationStateRef.current.inferenceStats?.wholeProcessDuration || 0)).toFixed(2) } s</div>
                    </div>
                    <button title="top of the page" className="goTopButton purpleShadow" onClick={handleScrollToTopClick}>
                        <svg style={{transform:'translateY(1px)'}} height="20" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M27.2975 2.5233C27.2975 3.91688 26.1678 5.04659 24.7742 5.04659H2.5233C1.12972 5.04659 0 3.91688 0 2.5233V2.5233C0 1.12972 1.12972 0 2.5233 0H24.7742C26.1678 0 27.2975 1.12972 27.2975 2.5233V2.5233ZM11.4127 8.16757C12.5843 6.996 14.4838 6.996 15.6554 8.16757L23.6272 16.1394C24.5231 17.0353 24.5231 18.4877 23.6272 19.3835V19.3835C22.7314 20.2793 21.279 20.2793 20.3832 19.3835L15.828 14.8283V29.7061C15.828 30.973 14.8009 32 13.5341 32V32C12.2672 32 11.2401 30.973 11.2401 29.7061V14.8283L6.79963 19.2688C5.9038 20.1646 4.45138 20.1646 3.55556 19.2688V19.2688C2.65973 18.373 2.65973 16.9206 3.55556 16.0247L11.4127 8.16757Z" fill="#6D48C1"/>
                        </svg>
                    </button>
                    {isStreaming ? 
                        <button title="cancel the request" className="cancelSendButton purpleShadow" onClick={handleAbortStreamingClick}>
                            <svg style={{width:'22px', flexShrink:0}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>
                        </button> : 
                        <button className="sendButton purpleShadow" onClick={() => askMainAgent_Streaming(textareaValue)}>Send</button>
                    }
                </div>

            </div>
        </main>

        <RightPanel memoizedSetModalStatus={memoizedSetModalStatus} AIAgentsList={AIAgentsList}/>
        
        {modalVisibility && 
            <Modal modalVisibility={modalVisibility} memoizedSetModalStatus={memoizedSetModalStatus} width= { modalContentId != "formUploadFile" ? "100%" : "560px"}>
                {{
                    'formEditAgent' : <FormAgentSettings role={"edit"} memoizedSetModalStatus={memoizedSetModalStatus} triggerAIAgentsListRefresh={triggerAIAgentsListRefresh}/>,
                    'formNewAgent' : <FormAgentSettings role={"create"} memoizedSetModalStatus={memoizedSetModalStatus} triggerAIAgentsListRefresh={triggerAIAgentsListRefresh}/>,
                    'formEditPrompt' : <FormPromptSettings role={"edit"} setForceLeftPanelRefresh={setForceLeftPanelRefresh} memoizedSetModalStatus={memoizedSetModalStatus} selectedPromptNameRef={selectedPromptNameRef}/>,
                    'formNewPrompt' : <FormPromptSettings role={"create"} setForceLeftPanelRefresh={setForceLeftPanelRefresh} memoizedSetModalStatus={memoizedSetModalStatus}/>,
                    'formUploadFile' : <FormUploadFile setForceLeftPanelRefresh={setForceLeftPanelRefresh} memoizedSetModalStatus={memoizedSetModalStatus}/>,
                    'error' : <ErrorAlert errorMessage={errorMessageRef.current}/>,
                } [modalContentId]}
            </Modal>
        }

    </div>
    )
}

export default Chat

/*
Valid Parameters and Values
Parameter	Description	Value Type	Example Usage
mirostat	Enable Mirostat sampling for controlling perplexity. (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)	int	mirostat 0
mirostat_eta	Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive. (Default: 0.1)	float	mirostat_eta 0.1
mirostat_tau	Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text. (Default: 5.0)	float	mirostat_tau 5.0
num_ctx	Sets the size of the context window used to generate the next token. (Default: 2048)	int	num_ctx 4096
repeat_last_n	Sets how far back for the model to look back to prevent repetition. (Default: 64, 0 = disabled, -1 = num_ctx)	int	repeat_last_n 64
repeat_penalty	Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (Default: 1.1)	float	repeat_penalty 1.1
temperature	The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)	float	temperature 0.7
seed	Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt. (Default: 0)	int	seed 42
stop	Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return. Multiple stop patterns may be set by specifying multiple separate stop parameters in a modelfile.	string	stop "AI assistant:"
tfs_z	Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting. (default: 1)	float	tfs_z 1
num_predict	Maximum number of tokens to predict when generating text. (Default: 128, -1 = infinite generation, -2 = fill context)	int	num_predict 42
top_k	Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (Default: 40)	int	top_k 40
top_p	Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)	float	top_p 0.9
min_p	Alternative to the top_p, and aims to ensure a balance of quality and variety. The parameter p represents the minimum probability for a token to be considered, relative to the probability of the most likely token. For example, with p=0.05 and the most likely token having a probability of 0.9, logits with a value less than 0.045 are filtered out. (Default: 0.0)
*/