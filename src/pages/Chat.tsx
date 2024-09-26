/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
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
import Modal from "../components/Modal";
import FormAgentSettings from "../components/FormAgentSettings";
import useModalVisibility from "../hooks/useModalVisibility";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import LoadedModelInfosBar from "../components/LoadedModelInfosBar";


function Chat() {

    // contains all the logic used to update the conversation history and its context
    const { conversationState, dispatch, conversationStateRef } = useConversationReducer()

    const historyContainerRef = useRef<HTMLDivElement>(null)

    const [textareaValue, _setTextareaValue] = useState("")
    const textareaValueRef = useRef<string>("")
    // forwarded to the textarea to extract it's focus method
    const customTextareaRef = useRef<ImperativeHandle>(null)

    const [agentsList, setAgentsList] = useState<string[]>([])

    const [activeConversationId, setActiveConversationId] = useState<number>(0)

    const [isStreaming, setIsStreaming] = useState<boolean>(false)

    const [isWebSearchActivated, _setWebSearchActivated] = useState(false)
    const isWebSearchActivatedRef = useRef<boolean>(false)

    const {modalVisibility, setModalVisibility} = useModalVisibility()

    function setTextareaValue(value: string) {
        textareaValueRef.current = value
        _setTextareaValue(value)
    }

    function setWebSearchActivated(value: boolean) {
        isWebSearchActivatedRef.current = value
        _setWebSearchActivated(value)
    }

    const modelsList = useFetchModelsList()

    useEffect(() => {
        setAgentsList(AgentLibrary.getAgentsNameList())
        ConversationsRepository.pushNewConversation(conversationStateRef.current.name, conversationStateRef.current.history, ChatService.getActiveAgentName())

        // cleanup
        return () => {
            ConversationsRepository.clearAll()
        }
    }, [])

    // triggered when switching between conversations
    useEffect(() => {
        if (isStreaming) ChatService.abortStreaming()
        setIsStreaming(false)
        setTextareaValue("")
        dispatch({ type: ActionType.SET_CONVERSATION, payload: ConversationsRepository.getConversation(activeConversationId) })
    }, [activeConversationId])

    // asking the model for a streamed response
    async function handleSendMessage_Streaming(message: string): Promise<void> {
        try {
            if (message == "") return
            const currentContext = conversationStateRef.current.history[conversationStateRef.current.history.length - 1]?.context || []
            setIsStreaming(true)
            dispatch({ type: ActionType.NEW_BLANK_HISTORY_ELEMENT, payload: message })
            let newContext
            if (isWebSearchActivatedRef.current) {
                console.log("**WebScraping**")
                const scrapedPages = await WebSearchService.scrapeRelatedDatas(message)
                console.log("**LLM Loading**")
                newContext = await ChatService.askTheActiveAgentForAStreamedResponse(message, pushStreamedAnswerToHistory_Callback, currentContext, scrapedPages)
                dispatch({ type: ActionType.ADD_SOURCES_TO_LAST_ANSWER, payload: scrapedPages })
            } else {
                console.log("**LLM Loading**")
                newContext = await ChatService.askTheActiveAgentForAStreamedResponse(message, pushStreamedAnswerToHistory_Callback, currentContext)
            }
            clearTextAreaIfQuestionReplied(conversationStateRef.current.history[conversationStateRef.current.history.length - 1].question, textareaValueRef.current)
            setIsStreaming(false)
            dispatch({ type: ActionType.UPDATE_LAST_HISTORY_CONTEXT, payload: newContext })
            ConversationsRepository.replaceTargetConversationHistory(activeConversationId, conversationStateRef.current.history)
        }
        catch (error: unknown) {
            console.log(error)
        }
    }

    function clearTextAreaIfQuestionReplied(lastQuestion: string, textareaValue: string): void {
        // only if the textarea hasn't been modified by the user during streaming
        if (lastQuestion == textareaValue) setTextareaValue("")
    }

    // callback passed to the chatservice to display the streamed answer / !!! should be renamed answerSaverCallback
    function pushStreamedAnswerToHistory_Callback(contentAsMarkdown: string, contentAsHTML: string): void {
        dispatch({ type: ActionType.UPDATE_LAST_HISTORY_ANSWER, payload: { html: contentAsHTML, markdown: contentAsMarkdown } })
    }

    function handleAbortStreamingClick() {
        ChatService.abortStreaming()
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

    function handleAgentSettingsClick() {
        setModalVisibility(currentVisibility => !currentVisibility)
    }

    return (
    <div id="globalContainer" className="globalContainer">
        <LeftPanel activeConversation={activeConversationId} setActiveConversation={setActiveConversationId}/>
        <main>
            <LoadedModelInfosBar/>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} ref={historyContainerRef}> {/* element needed for scrolling*/}
                <ChatHistory history={conversationState.history || []} setTextareaValue={setTextareaValue} />
            </div>
            <div className="stickyBottomContainer">
                <CustomTextarea ref={customTextareaRef} 
                    setTextareaValue={setTextareaValue} textareaValue={textareaValue} 
                    currentContext={conversationStateRef.current.history[conversationStateRef.current.history.length - 1]?.context || []} 
                    handleSendMessage_Streaming={handleSendMessage_Streaming} activeConversationId={activeConversationId} />
                <FollowUpQuestions historyElement={conversationState.history[conversationState.history.length - 1]} 
                    setTextareaValue={setTextareaValue} focusTextarea={handleCustomTextareaFocus} />
                <div className="sendButtonContainer">
                    <div className={isWebSearchActivated ? "searchWebCheck activated" : "searchWebCheck"} role="button" onClick={handleSearchWebClick}>
                        <span className="label">Search the Web</span>
                        <div className='switchContainer'>
                            <div className={isWebSearchActivated ? 'switch active' : 'switch'}></div>
                        </div>
                    </div>
                    <button className="infosBottomContainer" onClick={handleScrollToTopClick}>
                        {conversationState.lastAgentUsed /* not always displayed ?! */} / 
                        Filled context : {conversationStateRef.current.history[conversationStateRef.current.history.length - 1]?.context.length} / {ChatService.getActiveAgent().getContextSize()}
                    </button>
                    {isStreaming ? 
                        <button className="cancelSendButton" onClick={handleAbortStreamingClick}>
                            <svg style={{opacity:1, width:'20px', flexShrink:0}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>
                        </button> : 
                        <button className="sendButton purpleShadow" onClick={() => handleSendMessage_Streaming(textareaValue)}>Send</button>
                    }
                </div>
            </div>
            {modalVisibility && <Modal modalVisibility={modalVisibility} setModalVisibility={setModalVisibility}>
                <FormAgentSettings agent={AgentLibrary.getAgent(ChatService.getActiveAgentName())}/>
            </Modal>}
        </main>
        <RightPanel activeAgent={AgentLibrary.getAgent(ChatService.getActiveAgentName())} setModalVisibility={setModalVisibility}/>
    </div>
    )
}

export default Chat

// if closing the only conversation left, then creating a new blank conv
// deleting conv => ask confirmation
// when answer generation and switching conversation, QA pair being generated deleted
// web search (i)

//left drawer one at a time


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


// asking the model for a non streamed response
/*async function handleSendMessage(message : string) : Promise<void>{
    if(textareaValue == null) return
    const response = await ChatService.askTheActiveModel(message, conversationStateRef.current.history[conversationStateRef.current?.history.length-1]?.context || [])
    dispatch({ type: ActionType.PUSHNEWHISTORYELEMENT, payload: {question : message, html : response.response, markdown : response.response, context : response.context} })
    setTextareaValue("")
}*/