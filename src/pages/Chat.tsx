/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatService } from "../services/ChatService";
import ChatHistory from "../components/ChatHistory";
import '../style/Chat.css'
import { ConversationsRepository } from "../repositories/ConversationsRepository";
import FollowUpQuestions from "../components/FollowUpQuestions";
import { AgentLibrary } from "../services/AgentLibrary";
import useFetchModelsList from "../hooks/useFetchModelsList";
import CustomTextarea, { ImperativeHandle } from "../components/CustomTextarea";
import { ActionType, useConversationReducer } from "../hooks/useConversationReducer";
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
import useFetchPromptsList from "../hooks/useFetchPromptsList";

function Chat() {

    useEffect(() => console.log("chat render"))
    
    // {"name":"defaultAssistantPrompt","prompt":"You are an helpful assistant.","meta":{"revision":0,"created":1727917753940,"version":0},"$loki":2}
    const {promptsList, setPromptsList} = useFetchPromptsList()

    const [activeConversationId, setActiveConversationId] = useState<number>(0)
    // contains all the logic used to update the conversation history and its context
    const { conversationState, dispatch, conversationStateRef } = useConversationReducer({name : "First Conversation", history : [], lastModelUsed  : ""})

    const historyContainerRef = useRef<HTMLDivElement>(null)

    const [currentAgent, setCurrentAgent] = useState(ChatService.getActiveAgent())

    // keep textarea value at this level for the moment being
    const [textareaValue, _setTextareaValue] = useState("")
    const textareaValueRef = useRef<string>("")
    // forwarded to the textarea to retrieve its focus method
    const customTextareaRef = useRef<ImperativeHandle>(null)

    function setTextareaValue(value: string) {
        textareaValueRef.current = value
        _setTextareaValue(value)
    }

    const {isStreaming, isStreamingRef, setIsStreaming} = useStreamingState()
    const {isWebSearchActivated, isWebSearchActivatedRef, setWebSearchActivated} = useWebSearchState()
    const [isFollowUpQuestionsClosed, setIsFollowUpQuestionsClosed] = useState<boolean>(false)

    const {modalVisibility, modalContentId, setModalVisibility, setModalContentId} = useModalManager({initialVisibility : false, initialModalContentId : "formAgentSettings"})
    const memoizedSetModalStatus = useCallback(({visibility, contentId} : {visibility : boolean, contentId? : string}) => {
        setModalVisibility(visibility)
        if(contentId) setModalContentId(contentId)
    }, [])

    // used by the left panel to communicate to the page which prompt should be opened within a modal
    const selectedPromptRef = useRef("")

    const modelsList = useFetchModelsList()

    // initializing the conversation history with an empty element  & the scrollbar behavior
    const htmlRef = useRef(document.documentElement)
    useEffect(() => {
        ConversationsRepository.pushNewConversation(conversationStateRef.current.name, conversationStateRef.current.history, ChatService.getActiveAgentName())

        if (htmlRef.current && htmlRef.current.style.overflowY != "scroll") {
            htmlRef.current.style.overflow = "-moz-scrollbars-vertical";
            htmlRef.current.style.overflowY = "scroll";
        }

        return () => {
            ConversationsRepository.clearAll()
        }
    }, [])

    // triggered when switching between conversations
    useEffect(() => {
        if (isStreaming) ChatService.abortAgentLastRequest()
        setIsStreaming(false)
        setTextareaValue("")
        dispatch({ type: ActionType.SET_CONVERSATION, payload: ConversationsRepository.getConversation(activeConversationId) })
    }, [activeConversationId])

    // request a streaming response from the active chatService agent
    async function askMainAgent_Streaming(message: string): Promise<void> {
        try {
            if (message == "" || isStreamingRef.current) return
            // initiate context & a blank conversation QA pair
            const currentContext = conversationStateRef.current.history[conversationStateRef.current.history.length - 1]?.context || []
            setIsStreaming(true)
            dispatch({ type: ActionType.NEW_BLANK_HISTORY_ELEMENT, payload: { message, modelUsed : ChatService.getActiveAgent().getModelName()}})
            let newContext = []

            // two branches : webscrapping / internal knowledge
            if (isWebSearchActivatedRef.current) {
                const scrapedPages = await WebSearchService.scrapeRelatedDatas(message, 3, false)
                if(scrapedPages == null) return // !!! should display an error to the user
                console.log("**LLM Loading**")
                newContext = await ChatService.askTheActiveAgentForAStreamedResponse(message, pushStreamedChunkToHistory_Callback, currentContext, scrapedPages)
                if(isStreamingRef.current == false) return
                dispatch({ type: ActionType.ADD_SOURCES_TO_LAST_ANSWER, payload: scrapedPages })
            } else {
                console.log("**LLM Loading**")
                newContext = await ChatService.askTheActiveAgentForAStreamedResponse(message, pushStreamedChunkToHistory_Callback, currentContext)
            }

            // if the stream has been aborted, the following block of code isn't executed
            if(isStreamingRef.current == false) return
            dispatch({ type: ActionType.UPDATE_LAST_HISTORY_CONTEXT, payload: newContext })
            // the textarea is emptied only if the user has made no modifications to its content during the streaming process
            if(textareaValueRef.current == conversationStateRef.current.history.slice(-1)[0].question) setTextareaValue("")
            // temporary : to simulate persistence
            ConversationsRepository.replaceConversationHistoryById(activeConversationId, conversationStateRef.current.history)
            setIsStreaming(false)
        }
        catch (error: unknown) {
            console.log(error)
        }
    }

    /*async function askMainAgent(message: string, context : number[] = []){
        if (message == "" || isStreamingRef.current) return
        return await ChatService.askTheActiveAgent(message, context)
    }*/

    // callback passed to the chatservice to display the streamed answer
    function pushStreamedChunkToHistory_Callback({markdown , html} : {markdown : string, html : string}): void {
        dispatch({ type: ActionType.UPDATE_LAST_HISTORY_ANSWER, payload: { html, markdown } })
    }


    /***
    //
    // Click & Focus Events Handlers
    //
    ***/

    function handleAbortStreamingClick() {
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

    function regenerateLastAnswer() {
        if(isStreamingRef.current) return
        const retrievedQuestion = conversationStateRef.current.history[conversationStateRef.current.history.length-1].question
        ConversationsRepository.replaceConversationHistoryById(activeConversationId, conversationStateRef.current.history.slice(0, -1))
        dispatch({ type: ActionType.DELETE_LAST_HISTORY_ELEMENT })
        askMainAgent_Streaming(retrievedQuestion)
    }

    return (
    <div id="globalContainer" className="globalContainer">
        <LeftPanel conversationStateRef={conversationStateRef} activeConversation={activeConversationId} setActiveConversation={setActiveConversationId} memoizedSetModalStatus={memoizedSetModalStatus} promptsList={promptsList} selectedPromptRef={selectedPromptRef}/>
        <main>
            <LoadedModelInfosBar refreshSignal={!isStreaming}/>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} ref={historyContainerRef}> {/* element needed for scrolling*/}
                {<ChatHistory history={conversationState.history || []} setTextareaValue={setTextareaValue} regenerateLastAnswer={regenerateLastAnswer}/>} {/*isARequestBeingProcessed_Background={isARequestBeingProcessed_Background}*/}
            </div>
            <div className="stickyBottomContainer">
                {<CustomTextarea ref={customTextareaRef} 
                    setTextareaValue={setTextareaValue} textareaValue={textareaValue} 
                    currentContext={conversationStateRef.current.history[conversationStateRef.current.history.length - 1]?.context || []} 
                    askMainAgent_Streaming={askMainAgent_Streaming} activeConversationId={activeConversationId} />}
                {!isFollowUpQuestionsClosed && <FollowUpQuestions historyElement={conversationState.history[conversationState.history.length - 1]}
                    setTextareaValue={setTextareaValue} focusTextarea={handleCustomTextareaFocus} isStreaming={isStreaming} selfClose={setIsFollowUpQuestionsClosed}/>}
                <div className="sendButtonContainer">
                    <div className={isWebSearchActivated ? "searchWebCheck activated" : "searchWebCheck"} role="button" onClick={handleSearchWebClick}>
                        <span className="label">Search the Web</span>
                        <div className='switchContainer'>
                            <div className={isWebSearchActivated ? 'switch active' : 'switch'}></div>
                        </div>
                    </div>
                    <div className="infosBottomContainer">
                        Available Context : {
                            conversationStateRef.current.history[conversationStateRef.current.history.length - 1]?.context.length === 0 ? "N/A" : ChatService.getActiveAgent().getContextSize() - (conversationStateRef.current.history[conversationStateRef.current.history.length - 1]?.context.length || 0)
                        }
                    </div>
                    <button className="goTopButton purpleShadow" onClick={handleScrollToTopClick}>
                        <svg style={{transform:'translateY(1px)'}} height="20" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M27.2975 2.5233C27.2975 3.91688 26.1678 5.04659 24.7742 5.04659H2.5233C1.12972 5.04659 0 3.91688 0 2.5233V2.5233C0 1.12972 1.12972 0 2.5233 0H24.7742C26.1678 0 27.2975 1.12972 27.2975 2.5233V2.5233ZM11.4127 8.16757C12.5843 6.996 14.4838 6.996 15.6554 8.16757L23.6272 16.1394C24.5231 17.0353 24.5231 18.4877 23.6272 19.3835V19.3835C22.7314 20.2793 21.279 20.2793 20.3832 19.3835L15.828 14.8283V29.7061C15.828 30.973 14.8009 32 13.5341 32V32C12.2672 32 11.2401 30.973 11.2401 29.7061V14.8283L6.79963 19.2688C5.9038 20.1646 4.45138 20.1646 3.55556 19.2688V19.2688C2.65973 18.373 2.65973 16.9206 3.55556 16.0247L11.4127 8.16757Z" fill="#6D48C1"/>
                        </svg>
                    </button>
                    {isStreaming ? 
                        <button className="cancelSendButton purpleShadow" onClick={handleAbortStreamingClick}>
                            <svg style={{width:'22px', flexShrink:0}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>
                        </button> : 
                        <button className="sendButton purpleShadow" onClick={() => askMainAgent_Streaming(textareaValue)}>Send</button>
                    }
                </div>
            </div>
            {modalVisibility && 
                <Modal modalVisibility={modalVisibility} memoizedSetModalStatus={memoizedSetModalStatus}>
                    {{
                        'formEditAgent' : <FormAgentSettings agent={AgentLibrary.getAgent(ChatService.getActiveAgentName())} memoizedSetModalStatus={memoizedSetModalStatus} setCurrentAgent={setCurrentAgent}/>,
                        'formNewAgent' : <FormAgentSettings memoizedSetModalStatus={memoizedSetModalStatus}/>,
                        'formEditPrompt' : <FormPromptSettings memoizedSetModalStatus={memoizedSetModalStatus} promptsList={promptsList} selectedPromptRef={selectedPromptRef}/>,
                        'formNewPrompt' : <FormPromptSettings memoizedSetModalStatus={memoizedSetModalStatus} />,
                    } [modalContentId]}
                </Modal>
            }
        </main>
        <RightPanel activeAgent={currentAgent} memoizedSetModalStatus={memoizedSetModalStatus} modelsList={modelsList}/>
    </div>
    )
}

export default Chat

// if closing the only conversation left, then creating a new blank conv
// deleting conv => ask confirmation
// when answer generation and switching conversation, QA pair being generated deleted + abort
// web search (infos)

// !!!!! cancel inference after switching agent issues
// create new agent or modify new agent give the user the possibility to load an existing prompt
// copy code
// main textarea fix limit for height / number of lines so it doesn't go out of screen
// saved new agent should become the current agent
// in the top bar, button to see ALL the models running
// auto calculate context ?
// when switching model with an existing context, should embed the whole conversation to generate a new compatible context : should tell the user about the conv required
// fixing issue with a textblock inside a table
// token/s displayed => conversation
// favorite documents
// delete file
// should handle reply with excel "code"
// when regenerating an asnwer, old context is not flushed
// prompt versioning
// when user ask for an answer online, the search query generator should be able to take into account the previous questions to generate a better query
// !!! fixed? error when canceling a query with websearch : related to sources
// error aborting before first chunk
// hover right panel icon tags style
// context compression when context available < max length per reply
// fix markdown into textblock not being converted
// check if ollama can be pinged in the starting window
// when switching conversations, should restore the last model used & the last agent?

// readme : prompts optimized for mistral nemo
// tell me if you face a formatting issue within an answer

// add as a sidewindow extension to browser


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