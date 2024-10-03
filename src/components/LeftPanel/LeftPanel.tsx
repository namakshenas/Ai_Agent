/* eslint-disable @typescript-eslint/no-unused-vars */
import './LeftPanel3.css'
import ollama from '../../assets/Ollama3.png'
import DocumentsSlot from './DocumentsSlot'
import { ConversationsSlot } from './ConversationsSlot'
import { PromptsSlot } from './PromptsSlot'
import { useEffect } from 'react'
import React from 'react'
import { IConversation } from '../../interfaces/IConversation'
import IPrompt from '../../interfaces/IPrompt'

// export default function LeftPanel({activeConversation, setActiveConversation, setModalStatus, selectedPromptRef} : IProps){
const LeftPanel = React.memo(({activeConversation, conversationStateRef, setActiveConversation, memoizedSetModalStatus, promptsList, selectedPromptRef} : IProps) => {

    useEffect(() => {console.log("left panel render")})

    return(
        <aside className="leftDrawer">
            <figure style={{cursor:'pointer'}} onClick={() => location.reload()}><span>OSSPITA FOR</span> <img src={ollama}/></figure>
            <ConversationsSlot conversationStateRef={conversationStateRef} activeConversation={activeConversation} setActiveConversation={setActiveConversation}/>
            <DocumentsSlot/>
            <PromptsSlot selectedPromptRef={selectedPromptRef} memoizedSetModalStatus={memoizedSetModalStatus} promptsList={promptsList}/>
        </aside>
    )
}, (prevProps, nextProps) => {
    return prevProps.activeConversation === nextProps.activeConversation && prevProps.conversationStateRef.current === nextProps.conversationStateRef.current && prevProps.promptsList === nextProps.promptsList;
})

export default LeftPanel

interface IProps{
    activeConversation : number
    setActiveConversation : (index : number) => void
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId : string}) => void
    selectedPromptRef : React.MutableRefObject<string>
    conversationStateRef: React.MutableRefObject<IConversation>
    promptsList : IPrompt[]
}