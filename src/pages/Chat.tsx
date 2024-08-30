/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { OllamaService } from "../services/OllamaService";
import { ChatService } from "../services/ChatService";
import ChatHistory from "../components/ChatHistory";
import '../style/Chat.css'
import clipboardIcon from '../assets/clipboard2.svg'

function Chat() {
   
    const [lastContext, setLastContext] = useState<number[]>([])

    const textareaRef = useRef(null);
    const [history, setHistory] = useState<string[]>([])
    const recentHistory = useRef<string[]>([])
    const effectRef = useRef<number>(0)
    const [modelsList, setModelsList] = useState<string[]>([])

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
    }, [])

    async function handleSendMessage() : Promise<void>{
        if(textareaRef.current == null) return
        const historyCopy = [...history]
        const response = await ChatService.askQuestion((textareaRef.current as HTMLTextAreaElement).value, lastContext)
        historyCopy.push(response.response)
        setHistory(historyCopy)
        setLastContext(response.context);
        (textareaRef.current as HTMLTextAreaElement).value=''
    }

    async function handleSendMessageStreaming() : Promise<string | void>{
        if(textareaRef.current == null) return
        const historyCopy = [...history]
        historyCopy.push((textareaRef.current as HTMLTextAreaElement).value)
        historyCopy.push("")
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
                newHistory[newHistory.length-1] = content
                recentHistory.current = newHistory
                setHistory(newHistory);
                (textareaRef.current as HTMLTextAreaElement).value=''
            }
        }
        return content
    }

    async function copyToClipboard(text : string) {
        try {
          await navigator.clipboard.writeText(text);
          console.log('Text copied to clipboard');
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
    }

    function downloadAsFile(text : string){
        const blob = new Blob([text], {type: "text/plain;charset=utf-8"})
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = "myfile.txt"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <>
            <select style={{maxWidth:'300px', height: '2rem'}}>
                {modelsList.map((model,id) => <option key={id}>{model}</option>)}
            </select>
            <ChatHistory/>
            {
                history.map((message, index) => (
                    <div className="historyItem" style={{backgroundColor:index%2 == 0 ? '#eeeeeebb' : '#ffffff', color:'#000000dd'}} key={'message' + index}>
                        <div>{message}</div>
                        <div style={{flexDirection:'row', flexShrink:'0'}}>
                            <svg className="clipboardIcon" onClick={() => downloadAsFile(message)} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000aa"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
                            <svg className="clipboardIcon" onClick={() => copyToClipboard(message)} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000aa"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
                        </div>
                    </div>
                ))
            }
            <textarea ref={textareaRef} style={{margin:'2rem 0', resize:'none', height:'300px'}}></textarea>
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