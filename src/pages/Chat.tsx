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
import ChatHistoryTabs from "../components/ChatHistoryTabs";
import CustomTextarea, { ImperativeHandle } from "../components/CustomTextarea";
import { ActionType, useConversationReducer } from "../hooks/useConversationReducer";
import { CustomCheckbox } from "../components/CustomCheckbox/CustomCheckbox";
import internetIcon from '../assets/search-engine.png';
import { WebSearchService } from "../services/WebSearchService";
import Select, { IOption } from "../components/CustomSelect/Select";
import Modal from "../components/Modal";
import FormAgentSettings from "../components/FormAgentSettings";
import useModalVisibility from "../hooks/useModalVisibility";


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
        ConversationsRepository.pushNewConversation(conversationStateRef.current.name, conversationStateRef.current.history)

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
        document.getElementById("selectAgentLabel")?.scrollIntoView({ behavior: "smooth" })
    }

    function handleAgentSettingsClick() {
        setModalVisibility(currentVisibility => !currentVisibility)
    }

    return (
        <>
            <div className="modelAgentContainer">
                <label id="selectModalLabel">Select a Model</label>
                <Select labelledBy="selectModalLabel" onValueChange={(activeOption: IOption) => console.log(activeOption.value)} 
                    options={modelsList.map((model) => ({ label: model, value: model }))} id={"selectModel"} 
                    defaultOption={ChatService.getActiveAgent().getModelName()}/>
                <label id="selectAgentLabel" style={{ marginLeft: 'auto' }}>Select an Agent</label>
                <Select labelledBy="selectAgentLabel" onValueChange={(activeOption: IOption) => ChatService.setActiveAgent(activeOption.value)} 
                    options={agentsList.map((agent) => ({ label: agent, value: agent }))} id={"selectAgent"} 
                    width={300} defaultOption={ChatService.getActiveAgentName()}/>
                <button style={{ padding: '0 0.85rem' }} onClick={handleAgentSettingsClick}>
                    <svg style={{width:'18px'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"/></svg>
                </button>
                <button style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>+ New</button>
            </div>
            <ChatHistoryTabs activeConversation={activeConversationId} setActiveConversation={setActiveConversationId} />
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} ref={historyContainerRef}>
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
                        <CustomCheckbox checked={isWebSearchActivated} />
                        Search the web
                        <div className="searchWebSeparator"></div>
                        <img style={{opacity:0.6}} src={internetIcon} width="18px" height="18px" />
                    </div>
                    <button onClick={handleScrollToTopClick}>Filled context : {conversationStateRef.current.history[conversationStateRef.current.history.length - 1]?.context.length}</button>
                    <button onClick={() => handleSendMessage_Streaming(textareaValue)}>Send</button>
                    {isStreaming && <button className="cancelSendButton" onClick={handleAbortStreamingClick}>
                        <svg style={{opacity:1, width:'20px', flexShrink:0}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>
                    </button>}
                </div>
            </div>
            {modalVisibility && <Modal modalVisibility={modalVisibility} setModalVisibility={setModalVisibility}>
                <FormAgentSettings agent={AgentLibrary.getAgent(ChatService.getActiveAgentName())}/>
            </Modal>}
        </>
    )
}

export default Chat

// save conversation by ticking the history pairs you want to keep
// number of characters in textarea
// download model config + agents from other users using a dedicated website & api
// downvoting a reply should get it out of context
// collapse previous history
// refresh three questions with a button and close three questions
// stop autoscroll down when streaming if the user scroll up
// since now autoscroll, put the cancel button next to the send button
// deal with ollama request not manually aborted leading to cancel request button not disappearing
// switching conversation shouldnt lead to scrollbottom : check useeffect triggered by history state update
// conversation button blinking when switching conversation
// deal with json failing on some streaming => incomplete context array
// issue : switching between conversations when the conversation hasn't been saved in chatconvservice
// edit question sometimes takes two clicks
// browse through previous questions / scroll to the question?
// should be able to open a panel under the textarea to tweak the current model settings
// fix issue with ollama last streamed element with sometimes incomplete context
// should summarize the scraped data used to reply the answer
// when switching conversation, it generates new suggestions, if clicking x times on diffrent conversation, i can have x suggestions
// generations in queue, so need to abort
// determine if the request can be without the use of web searching
// in one tab, i should be able to schedule a recurrent data research on a topic to stay informed
// should add pictures too with the reply
// clipboard for code blocks
// regenerate the last answer
// when switching agent, should export the context from agent A to agent B
// when passing with to one select component, both are scaled
// snackbar settings applied
// prevoir une compression de conversation pour libérer du context
// save and load system prompts into settings modal
// save and load full agent settings
// block scroll when modal onscreen

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