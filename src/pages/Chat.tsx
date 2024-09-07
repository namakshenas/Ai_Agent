/* eslint-disable @typescript-eslint/no-unused-vars */
import { TextareaHTMLAttributes, useEffect, useRef, useState } from "react";
import { OllamaService } from "../services/OllamaService";
import { ChatService } from "../services/ChatService";
import ChatHistory from "../components/ChatHistory";
import '../style/Chat.css'
import downloadIcon from '../assets/downloadicon2.png';
import { IChatHistoryQAPair } from "../interfaces/IChatHistoryQAPair";
import { ChatConversationsService } from "../services/ChatConversationsService";
import FollowUpQuestions from "../components/FollowUpQuestions";
import { AgentLibraryService } from "../services/AgentLibraryService";
import { AIAgent } from "../models/AIAgent";
import useFetchModelsList from "../hooks/useFetchModelsList";
import CustomTextarea from "../components/CustomTextarea";

function Chat() {
   
    const [lastContext, setLastContext] = useState<number[]>([])

    /*const fakeTextareaRef = useRef<HTMLDivElement | null>(null)
    const editableSpanRef = useRef<HTMLSpanElement | null>(null)*/
    const [textareaValue, setTextareaValue] = useState("")
    const textareaRef = useRef()
    const [history, _setHistory] = useState<IChatHistoryQAPair[]>([])
    const recentHistory = useRef<IChatHistoryQAPair[]>([])
    // const [modelsList, setModelsList] = useState<string[]>([])
    const [agentsList, setAgentsList] = useState<string[]>([])
    const [activeConversation, setActiveConversation] = useState<number>(0)
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
    const [suggestion, setSuggestion] = useState<string>("")

    function setHistory(history: IChatHistoryQAPair[]) {
        recentHistory.current = history
        _setHistory(history)
    }

    const modelsList = useFetchModelsList()

    useEffect(() => {

        AgentLibraryService.addAgent(new AIAgent("helpfulAssistant"))
        setAgentsList(AgentLibraryService.getAgentsNameList())
        ChatConversationsService.pushConversation([])
        setActiveConversation(0)

        // autocomplete on tab press
        // window.addEventListener('keydown', applyAutoCompleteOnTabPress)

        // Cleanup
        return () => {
            ChatConversationsService.clearAll()
            AgentLibraryService.removeAllAgents()
            setActiveConversation(0)
            // cleanup autocomplete listener
            // window.removeEventListener('keydown', applyAutoCompleteOnTabPress)
        };
    }, [])

    // asking the model for a one block response
    async function handleSendMessage() : Promise<void>{
        if(textareaValue == null) return
        const response = await ChatService.askTheActiveModel(textareaValue, lastContext)
        setHistory([...history, { question: textareaValue, answer: response.response }])
        setLastContext(response.context);
        setTextareaValue("")
        setSuggestion("")
    }

    // asking the model for a streamed response
    async function handleSendMessageStreaming() : Promise<string | void>{
        if(textareaValue == null) return
        setHistory([...history, {question : textareaValue, answer : ""}])
        
        const reader : ReadableStreamDefaultReader<Uint8Array> = await ChatService.askTheActiveModelForAStreamedResponse(textareaValue, lastContext)
        let content = ""
        // keep reading the streamed response until the stream is closed
        while(true){
            const { done, value } = await reader.read()
            if (done) {
                break;
            }
            const json = JSON.parse(new TextDecoder().decode(value))

            if(json.done && json?.context) setLastContext(json.context)
        
            if (!json.done) {
                content += json.response
                if(json?.context?.length > 0) console.log("falsedone : " + json?.context)
                const newHistory = [...recentHistory.current]
                newHistory[newHistory.length-1].answer = content
                // recentHistory.current = newHistory
                setHistory(newHistory)
            }
        }
        
        // ask the model for 3 follow up questions related to it's last answer
        generateFollowUpQuestions(textareaValue);
        setTextareaValue("")
        setSuggestion("")
        return content
    }

    // adding a new conversation tab
    function handleNewTabClick(){
        ChatConversationsService.pushConversation([])
        setActiveConversation(ChatConversationsService.getNumberOfConversations() - 1)
    }

    // generate three follow up questions
    async function generateFollowUpQuestions(question : string, iter : number = 0){
        const prompt = "Use the following question to generate three related follow up questions, with a maximum 50 words each, that would lead your reader to discover great and related knowledge : \n\n" + question + `\n\nFormat those three questions as an array of strings such as : ["question1", "question2", "question3"]. Don't add any commentary or any annotation. Just output a simple and unique array.`
        let response = []
        const threeQuestions = await ChatService.askTheActiveModel(prompt, lastContext || [])
        try{
            response = JSON.parse(threeQuestions.response)
        }catch(error){
            if(iter + 1 > 4) return setFollowUpQuestions([])
            generateFollowUpQuestions(question, iter + 1)
        }
        if(response.length == 3) setFollowUpQuestions(response)
    }

    // asking the model to autocomplete the currently written prompt
    /*async function askAutoComplete(sentence : string){
        console.log('sentence to complete : ' + sentence)
        const response = await ChatService.askTheActiveModelForAutoComplete(sentence, lastContext || [])
        setSuggestion(response.response)
    }

    // apply autocomplete on tab press
    function applyAutoCompleteOnTabPress(e : KeyboardEvent) {
        if (e.key === 'Tab') {
            e.preventDefault();
            if(editableSpanRef.current) {
                editableSpanRef.current.innerText = editableSpanRef.current.innerText + suggestion
                // place the cursor at the end of the text
                const range = document.createRange();
                const selection = window.getSelection();
                if(!selection) return
                range.selectNodeContents(editableSpanRef.current); // select the whole text
                range.collapse(false); // collapse the range to the end point
                selection.removeAllRanges(); // clear all existing selections
                selection.addRange(range); // add the range as a selection
            }
            setSuggestion("")
        }
    }*/

    return (
        <>
            <div className="modelAgentContainer">
                <label>Active Model</label><select className="modelDropdown">
                    {modelsList.map((model,id) => <option key={'model'+id}>{model}</option>)}
                </select>
                <select className="agentDropdown">
                    {agentsList.map((agent,id) => <option key={'agent'+id}>{agent}</option>)}
                </select>
                <button style={{paddingLeft:'0.75rem', paddingRight:'0.75rem'}}>+ New</button>
            </div>
            <div className="tabBar">
                {
                    ChatConversationsService.getConversations().map((_, id) => (
                    <button style={{columnGap:'1rem'}} key={'tabButton'+id}><span>Conversation {id}</span>
                    </button>))
                }
                <button onClick={handleNewTabClick}>+</button>
            </div>
            <ChatHistory historyItems={history} setTextareaValue={setTextareaValue}/>
            {/*<span className="textAreaTitle">Input</span>
            <div className="textArea" ref={fakeTextareaRef} role="textbox"
                onClick={() => {
                    if (editableSpanRef.current) {
                        editableSpanRef.current.focus();
                    }
                }} 
                onInput={(e) => askAutoComplete((e.target as HTMLDivElement).innerText)}>
                    <span style={{border:'none', outline:'none', color:'#000'}} ref={editableSpanRef} contentEditable="true"></span>
                    <span style={{color:'#000000aa'}}>{suggestion}</span>
            </div>*/}
            <CustomTextarea setTextareaValue={setTextareaValue} textareaValue={textareaValue}/>
            {followUpQuestions.length > 0 && <FollowUpQuestions questions={followUpQuestions} setTextareaValue={setTextareaValue}/>}
            <div className="sendButtonContainer">
                <input type="checkbox"/>Search the web for uptodate results
                <button onClick={handleSendMessageStreaming}>Send</button>
            </div>
        </>
      )
}
  
export default Chat

// lorsque je vois certains elements textuels, par exemple : bulletpoint list. je peux extraire toute la partie de la phrase relative a cette
// instruction utilisateur grace au llm et la remplacer par quelque chose de plus effectif

// save conversation by ticking the history pairs you want to keep

// number of characters in textarea

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