/* eslint-disable @typescript-eslint/no-unused-vars */
import './LeftPanel3.css'
import ollama from '../../assets/Ollama3.png'
import DocumentsSlot from './DocumentsSlot'
import { ConversationsSlot } from './ConversationsSlot'
import { PromptsSlot } from './PromptsSlot'
import { useEffect } from 'react'

export default function LeftPanel({activeConversation, setActiveConversation, setModalStatus, selectedPromptRef} : IProps){

    useEffect(() => {console.log("left panel render")}, [])

    return(
        <aside className="leftDrawer">
            <figure style={{cursor:'pointer'}} onClick={() => location.reload()}><span>OSSPITA FOR</span> <img src={ollama}/></figure>
            <ConversationsSlot activeConversation={activeConversation} setActiveConversation={setActiveConversation}/>
            <DocumentsSlot/>
            <PromptsSlot selectedPromptRef={selectedPromptRef} setModalStatus={setModalStatus}/>
        </aside>
    )
}

interface IProps{
    activeConversation : number
    setActiveConversation : (index : number) => void
    setModalStatus : (visibility : boolean, contentId : string) => void
    selectedPromptRef : React.MutableRefObject<string>
}