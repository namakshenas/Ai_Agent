/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { OllamaService } from "../services/OllamaService";
import { ChatService } from "../services/ChatService";
import ChatHistory from "../components/ChatHistory";
import '../style/Chat.css'
import { IChatHistoryQAPair } from "../interfaces/IChatHistoryQAPair";
import { ChatConversationsService } from "../services/ChatConversationsService";

function Chat() {
   
    const [lastContext, setLastContext] = useState<number[]>([])

    const textareaRef = useRef(null);
    const [history, setHistory] = useState<IChatHistoryQAPair[]>([])
    const recentHistory = useRef<IChatHistoryQAPair[]>([])
    const effectRef = useRef<number>(0)
    const [modelsList, setModelsList] = useState<string[]>([])
    const [activeConversation, setActiveConversation] = useState<number>(0);

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
        
        const reader : ReadableStreamDefaultReader<Uint8Array> = await ChatService.askQuestionStreaming((textareaRef.current as HTMLTextAreaElement).value, lastContext)
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
                setHistory(newHistory);
                (textareaRef.current as HTMLTextAreaElement).value=''
            }
        }
        return content
    }

    function handleNewTabClick(){
        ChatConversationsService.pushConversation([])
        setActiveConversation(ChatConversationsService.getNumberOfConversations() - 1)
    }

    return (
        <>
            <select className="modelDropdown">
                {modelsList.map((model,id) => <option key={id}>{model}</option>)}
            </select>
            <div className="tabBar">
                {
                    ChatConversationsService.getConversations().map((conversation, id) => <button>conversation {id}</button>)
                }
                <button onClick={handleNewTabClick}>+</button>
            </div>
            <ChatHistory historyItems={history}/>
            <textarea ref={textareaRef}></textarea>
            <button onClick={handleSendMessageStreaming}>send</button>
        </>
      );
}
  
export default Chat

// lorsque je vois certains elements textuels, par exemple : bulletpoint list. je peux extraire toute la partie de la phrase relative a cette
// instruction utilisateur grace au llm et la remplacer par quelque chose de plus effectif
// <img className="clipboardIcon" src={clipboardIcon} alt="Clipboard" onClick={() => copyToClipboard(message)}/>
// save history as a file
// save response as a file