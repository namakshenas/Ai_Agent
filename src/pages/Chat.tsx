/* eslint-disable @typescript-eslint/no-unused-vars */
import { TextareaHTMLAttributes, useEffect, useRef, useState } from "react";
import { OllamaService } from "../services/OllamaService";
import { ChatService } from "../services/ChatService";
import ChatHistory from "../components/ChatHistory";
import '../style/Chat.css'
import { IChatHistoryQAPair } from "../interfaces/IChatHistoryQAPair";
import { ChatConversationsService } from "../services/ChatConversationsService";

function Chat() {
   
    const [lastContext, setLastContext] = useState<number[]>([])

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [history, setHistory] = useState<IChatHistoryQAPair[]>([])
    const recentHistory = useRef<IChatHistoryQAPair[]>([])
    const effectRef = useRef<number>(0)
    const [modelsList, setModelsList] = useState<string[]>([])
    const [activeConversation, setActiveConversation] = useState<number>(0);
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

    useEffect(() => {
        async function fetchJobDisambiguation () {
            if(effectRef.current == 1) return
            if(effectRef.current == 0) effectRef.current = 1
            try {
                // listing all the models installed on the users machine
                const modelList = await OllamaService.getModelList()
                if(modelList != null) {
                    const ml = modelList?.models.map((model) => model?.model)
                    setModelsList(ml)
                }
            } catch (error) {
                console.error("Error fetching job disambiguation:", error)
            }
        }
        fetchJobDisambiguation()
        ChatConversationsService.pushConversation([])
        setActiveConversation(0)

        // Cleanup
        return () => {
            ChatConversationsService.clearAll()
            setActiveConversation(0)
        };
    }, [])

    /*async function handleSendMessage() : Promise<void>{
        if(textareaRef.current == null) return
        const historyCopy = [...history]
        const response = await ChatService.askQuestion((textareaRef.current as HTMLTextAreaElement).value, lastContext)
        historyCopy.push({question : textareaRef.current, answer : response.response})
        setHistory(historyCopy)
        setLastContext(response.context);
        (textareaRef.current as HTMLTextAreaElement).value=''
    }*/

    async function handleSendMessageStreaming() : Promise<string | void>{
        if(textareaRef.current == null) return
        const historyCopy = [...history]
        /*historyCopy.push((textareaRef.current as HTMLTextAreaElement).value)
        historyCopy.push("")*/
        historyCopy.push({question : (textareaRef.current as HTMLTextAreaElement).value, answer : ""})
        recentHistory.current = historyCopy
        setHistory(historyCopy)
        
        const reader : ReadableStreamDefaultReader<Uint8Array> = await ChatService.askTheActiveModelForAStreamedResponse((textareaRef.current as HTMLTextAreaElement).value, lastContext)
        let content = ""
        while(true){
            const { done, value } = await reader.read()
            if (done) {
                break;
            }
            const stringifiedJson = new TextDecoder().decode(value);
            const json = JSON.parse(stringifiedJson)

            if(json.done && json?.context) setLastContext(json.context)
        
            if (!json.done) {
                content += json.response
                if(json?.context?.length > 0) console.log("falsedone : " + json?.context)
                const newHistory = [...recentHistory.current]
                newHistory[newHistory.length-1].answer = content
                recentHistory.current = newHistory
                console.log("recent history : " + recentHistory.current)
                setHistory(newHistory)
            }
        }

        generateFollowUpQuestions((textareaRef.current as HTMLTextAreaElement).value);
        (textareaRef.current as HTMLTextAreaElement).value=''
        return content
    }

    function handleNewTabClick(){
        ChatConversationsService.pushConversation([])
        setActiveConversation(ChatConversationsService.getNumberOfConversations() - 1)
    }

    async function generateFollowUpQuestions(question : string){
        const prompt = "Use the following question to generate three related follow up questions, with a maximum 50 words each, that would lead your reader to discover great knowledge : \n\n" + question + `\n\nFormat those three questions as an array of strings such as : ["question1", "question2", "question3"]. Don't add any commentary or any annotation. Just output a simple and unique array.`
        const threeQuestions = await ChatService.askTheActiveModel(prompt, lastContext || [])
        console.log(threeQuestions)
        setFollowUpQuestions(JSON.parse(threeQuestions.response))
    }

    return (
        <>
            <select className="modelDropdown">
                {modelsList.map((model,id) => <option key={id}>{model}</option>)}
            </select>
            <div className="tabBar">
                {
                    ChatConversationsService.getConversations().map((_, id) => <button key={'tabButton'+id}>conversation {id} [save]</button>)
                }
                <button onClick={handleNewTabClick}>+</button>
            </div>
            <ChatHistory historyItems={history} textareaRef={textareaRef}/>
            <div className="historyFakeShadow"></div>
            <span className="textAreaTitle">Input</span>
            <textarea ref={textareaRef}></textarea>
            {followUpQuestions.length > 0 && (
                <div className="followUpQuestionsContainer">
                    {followUpQuestions.map((question, id) => (
                    <span key={'fupquestion' + id}>{question}</span>
                    ))}
                </div>
            )}
            <div className="sendButtonContainer">
                <input type="checkbox"/>Search the web for uptodate results
                <button onClick={handleSendMessageStreaming}>send</button>
            </div>
        </>
      );
}
  
export default Chat

// lorsque je vois certains elements textuels, par exemple : bulletpoint list. je peux extraire toute la partie de la phrase relative a cette
// instruction utilisateur grace au llm et la remplacer par quelque chose de plus effectif

// testarea typing suggestion, tab to replace typing with suggestion

// save conversation by ticking the history pairs you want to keep

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