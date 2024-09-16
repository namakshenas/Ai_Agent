/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { ChatService } from "../services/ChatService";
import ChatHistory from "../components/ChatHistory";
import '../style/Chat.css'
import { ConversationsService } from "../services/ConversationsService";
import FollowUpQuestions from "../components/FollowUpQuestions";
import { AgentLibrary } from "../services/AgentLibrary";
// import { AIAgent } from "../models/AIAgent";
import useFetchModelsList from "../hooks/useFetchModelsList";
import ChatHistoryTabs from "../components/ChatHistoryTabs";
import CustomTextarea, { ImperativeHandle } from "../components/CustomTextarea";
import { ActionType, useConversationReducer } from "../hooks/useConversationReducer";
import { CustomCheckbox } from "../components/CustomCheckbox/CustomCheckbox";
import internetIcon2 from '../assets/internetIcon2.png';
import { WebSearchService } from "../services/WebSearchService";


function Chat() {
   
    // contains all the logic used to update the conversation history and its context
    const {conversationState, dispatch, conversationStateRef} = useConversationReducer()

    const historyContainerRef = useRef<HTMLDivElement>(null)

    const [textareaValue, _setTextareaValue] = useState("")
    const textareaValueRef = useRef<string>("")
    // forwarded to the textarea to extract it's focus method
    const customTextareaRef = useRef<ImperativeHandle>(null)

    const [agentsList, setAgentsList] = useState<string[]>([])

    const [activeConversationId, setActiveConversationId] = useState<number>(0)

    const [isStreaming, setIsStreaming] = useState<boolean>(false)  

    const [isWebSearchActivated, setWebSearchActivated] =  useState(false)

    function setTextareaValue(value: string) {
        textareaValueRef.current = value
        _setTextareaValue(value)
    }

    const modelsList = useFetchModelsList()

    useEffect(() => {
        setAgentsList(AgentLibrary.getAgentsNameList())
        ConversationsService.pushNewConversation(conversationStateRef.current.name, conversationStateRef.current.history)

        // cleanup
        return () => {
            ConversationsService.clearAll()
        }
    }, [])

    // triggered when switching between conversations
    useEffect(() => {
        if(isStreaming) ChatService.abortStreaming()
        setIsStreaming(false)
        setTextareaValue("")
        dispatch({type : ActionType.SET_CONVERSATION, payload : ConversationsService.getConversation(activeConversationId)})
    },[activeConversationId])

    // asking the model for a streamed response
    async function handleSendMessage_Streaming(message : string) : Promise<void>{
        try{
            if(message == "") return
            const currentContext = conversationStateRef.current.history[conversationStateRef.current.history.length-1]?.context || []
            setIsStreaming(true)
            dispatch({ type: ActionType.NEW_BLANK_HISTORY_ELEMENT, payload: message})
            let newContext
            if(isWebSearchActivated) {
                const webDatas = await WebSearchService.getRelatedWebpagesDatas(message)
                newContext = await ChatService.askTheActiveAgentForAStreamedResponse(message, pushStreamingAnswerToHistoryCallback, currentContext, webDatas)
            }else{
                newContext = await ChatService.askTheActiveAgentForAStreamedResponse(message, pushStreamingAnswerToHistoryCallback, currentContext)
            }
            clearTextAreaIfQuestionReplied(conversationStateRef.current.history[conversationStateRef.current.history.length-1].question, textareaValueRef.current)
            setIsStreaming(false)
            dispatch({ type: ActionType.UPDATE_LAST_HISTORY_CONTEXT, payload : newContext})
            ConversationsService.replaceTargetConversationHistory(activeConversationId, conversationStateRef.current.history)
        }
        catch(error : unknown){
            console.log(error)
        }
    }

    function clearTextAreaIfQuestionReplied(lastQuestion : string, textareaValue : string) : void {
        // only if the textarea hasn't been modified by the user during streaming
        if(lastQuestion == textareaValue) setTextareaValue("")
    }

    // callback passed to the chatservice to display the streamed answer / !!! should be renamed answerSaverCallback
    function pushStreamingAnswerToHistoryCallback(contentAsMarkdown : string, contentAsHTML : string) : void{
        dispatch({type : ActionType.UPDATE_LAST_HISTORY_ANSWER, payload : {html : contentAsHTML, markdown : contentAsMarkdown}})
    }

    function handleAbortStreamingClick(){
        ChatService.abortStreaming()
        setIsStreaming(false)
        dispatch({ type : ActionType.DELETE_LAST_HISTORY_ELEMENT})
    }

    function handleCustomTextareaFocus(){
        customTextareaRef.current?.focusTextarea()
    }

    function handleSearchWebClick(e : React.MouseEvent<HTMLDivElement>){
        e.preventDefault()
        setWebSearchActivated(!isWebSearchActivated)
    }

    return (
        <>
            <div className="modelAgentContainer">
                <label>Select a Model</label>
                <select className="modelDropdown">
                    {modelsList.map((model,id) => <option key={'model'+id}>{model}</option>)}
                </select>
                <label style={{marginLeft:'auto'}}>Select an Agent</label>
                <select className="agentDropdown" onChange={(e) => ChatService.setActiveAgent(e.target.value)}>
                    {agentsList.map((agent,id) => <option key={'agent'+id}>{agent}</option>)}
                </select>
                <button style={{padding:'0 0.85rem'}}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.035 0.809018C12.405 0.543018 12.925 0.419018 13.436 0.606018C14.5223 1.00418 15.5313 1.58784 16.418 2.33102C16.835 2.68102 16.988 3.19202 16.942 3.64402C16.867 4.39702 16.999 5.12402 17.362 5.75002C17.682 6.30702 18.164 6.74702 18.752 7.05702L18.977 7.16702C19.391 7.35402 19.759 7.74302 19.852 8.28002C20.0507 9.41808 20.0507 10.582 19.852 11.72C19.769 12.204 19.462 12.567 19.099 12.771L18.977 12.834C18.287 13.144 17.723 13.624 17.361 14.25C16.999 14.877 16.867 15.603 16.942 16.356C16.987 16.808 16.835 17.32 16.418 17.669C15.5313 18.4122 14.5223 18.9959 13.436 19.394C13.2038 19.4771 12.9548 19.502 12.7108 19.4666C12.4667 19.4312 12.235 19.3366 12.036 19.191C11.42 18.75 10.723 18.5 9.99999 18.5C9.27699 18.5 8.57999 18.749 7.96499 19.191C7.76584 19.3368 7.53399 19.4315 7.28976 19.4669C7.04552 19.5023 6.79633 19.4772 6.56399 19.394C5.47769 18.9959 4.46872 18.4122 3.58199 17.669C3.39414 17.5095 3.24818 17.3065 3.15685 17.0776C3.06551 16.8488 3.03157 16.601 3.05799 16.356C3.13299 15.603 2.99999 14.876 2.63799 14.25C2.3089 13.6906 1.82658 13.2371 1.24799 12.943L1.02299 12.833C0.797289 12.7331 0.59951 12.5795 0.446968 12.3854C0.294426 12.1914 0.191772 11.9629 0.147993 11.72C-0.0507144 10.582 -0.0507144 9.41808 0.147993 8.28002C0.230993 7.79602 0.537993 7.43302 0.900993 7.22902L1.02299 7.16702C1.71299 6.85602 2.27699 6.37702 2.63899 5.75002C2.99999 5.12402 3.13299 4.39702 3.05799 3.64402C3.03157 3.39902 3.06551 3.15128 3.15685 2.92241C3.24818 2.69354 3.39414 2.4905 3.58199 2.33102C4.46872 1.58784 5.47769 1.00418 6.56399 0.606018C6.79619 0.522965 7.04519 0.498042 7.28924 0.533429C7.53328 0.568816 7.76495 0.663436 7.96399 0.809018C8.57899 1.25102 9.27599 1.50002 9.99999 1.50002C10.724 1.50002 11.42 1.25102 12.035 0.809018ZM12.992 2.57802C12.126 3.14802 11.105 3.50002 9.99999 3.50002C8.89499 3.50002 7.87399 3.14702 7.00799 2.57802C6.31188 2.85914 5.65881 3.23684 5.06799 3.70002C5.12799 4.73302 4.92299 5.79302 4.37099 6.75002C3.81799 7.70602 3.00299 8.41302 2.07799 8.87802C1.97275 9.62165 1.97275 10.3764 2.07799 11.12C3.00299 11.585 3.81799 12.292 4.37099 13.25C4.92299 14.205 5.12799 15.265 5.06799 16.298C5.65875 16.7615 6.31183 17.1396 7.00799 17.421C7.87399 16.851 8.89499 16.499 9.99999 16.499C11.105 16.499 12.126 16.852 12.992 17.421C13.6881 17.1399 14.3412 16.7622 14.932 16.299C14.872 15.265 15.077 14.205 15.629 13.249C16.181 12.292 16.997 11.585 17.922 11.119C18.027 10.376 18.027 9.62199 17.922 8.87902C16.997 8.41302 16.182 7.70602 15.629 6.74902C15.077 5.79302 14.872 4.73302 14.932 3.69902C14.3412 3.23584 13.6881 2.85914 12.992 2.57802ZM9.99999 6.00002C11.0609 6.00002 12.0783 6.42145 12.8284 7.17159C13.5786 7.92174 14 8.93915 14 10C14 11.0609 13.5786 12.0783 12.8284 12.8284C12.0783 13.5786 11.0609 14 9.99999 14C8.93913 14 7.92171 13.5786 7.17157 12.8284C6.42142 12.0783 5.99999 11.0609 5.99999 10C5.99999 8.93915 6.42142 7.92174 7.17157 7.17159C7.92171 6.42145 8.93913 6.00002 9.99999 6.00002ZM9.99999 8.00002C9.46956 8.00002 8.96085 8.21073 8.58578 8.5858C8.21071 8.96088 7.99999 9.46959 7.99999 10C7.99999 10.5305 8.21071 11.0392 8.58578 11.4142C8.96085 11.7893 9.46956 12 9.99999 12C10.5304 12 11.0391 11.7893 11.4142 11.4142C11.7893 11.0392 12 10.5305 12 10C12 9.46959 11.7893 8.96088 11.4142 8.5858C11.0391 8.21073 10.5304 8.00002 9.99999 8.00002Z" fill="#000000aa"/>
                    </svg>
                </button>
                <button style={{paddingLeft:'0.75rem', paddingRight:'0.75rem'}}>+ New</button>
            </div>
            <ChatHistoryTabs activeConversation={activeConversationId} setActiveConversation={setActiveConversationId}/>
            <div style={{display:'flex', flexDirection:'column', width:'100%'}} ref={historyContainerRef}>
                <ChatHistory history={conversationState.history || []} setTextareaValue={setTextareaValue}/>
            </div>
            <div className="stickyBottomContainer">
                <CustomTextarea ref={customTextareaRef} setTextareaValue={setTextareaValue} textareaValue={textareaValue} currentContext={conversationStateRef.current.history[conversationStateRef.current.history.length-1]?.context || []} handleSendMessage_Streaming={handleSendMessage_Streaming} activeConversationId={activeConversationId}/>
                <FollowUpQuestions historyElement={conversationState.history[conversationState.history.length - 1]} setTextareaValue={setTextareaValue} focusTextarea={handleCustomTextareaFocus}/>
                <div className="sendButtonContainer">
                    <div className={isWebSearchActivated ? "searchWebCheck activated" : "searchWebCheck"} role="button" onClick={handleSearchWebClick}>
                        <CustomCheckbox checked={isWebSearchActivated}/>
                        Search the web
                        <img src={internetIcon2} width="20px" height="20px"/>
                    </div>
                    <button onClick={() => handleSendMessage_Streaming(textareaValue)}>Send</button>
                    {isStreaming && <button className="cancelSendButton" onClick={handleAbortStreamingClick}>C</button>}
                </div>
            </div>
            {/*<div>Filled context : {conversationStateRef.current.history[conversationStateRef.current.history.length-1]?.context.length}</div>*/}
        </>
      )
}
  
export default Chat

// save conversation by ticking the history pairs you want to keep
// number of characters in textarea
// download model config + agents from other users using a dedicated website & api
// downvoting a reply should get it out of context
// collapse previous history
// when clicking on modify question, jump to textarea
// refresh three questions with a button and close three questions
// stop autoscroll down when streaming if the user scroll up
// since now autoscroll, put the cancel button next to the send button
// deal with ollama request not manually aborted leading to cancel request button not disappearing
// switching conversation shouldnt lead to scrollbottom : check useeffect triggered by history state update
// conversation button blinking when switching conversation
// deal with json failing on some streaming
// issue : switching between conversations when the conversation hasn't been saved in chatconvservice
// edit question sometimes takes two clicks

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