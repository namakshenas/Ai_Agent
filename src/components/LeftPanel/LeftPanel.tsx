/* eslint-disable @typescript-eslint/no-unused-vars */
import './LeftPanel3.css'
import ollama from '../../assets/Ollama3.png'
import DocumentsSlot from './DocumentsSlot'
import { ConversationsSlot } from './ConversationsSlot'
import { PromptsSlot } from './PromptsSlot'
import { useEffect } from 'react'
import React from 'react'
import { IConversation } from '../../interfaces/IConversation'

// export default function LeftPanel({activeConversation, setActiveConversation, setModalStatus, selectedPromptRef} : IProps){
const LeftPanel = React.memo(({activeConversationId, activeConversationStateRef, setActiveConversationId, memoizedSetModalStatus, selectedPromptNameRef} : IProps) => {

    useEffect(() => {console.log("left panel render")})

    return(
        <aside className="leftDrawer">
            <figure style={{cursor:'pointer'}} onClick={() => location.reload()}><span>OSSPITA FOR</span> <img src={ollama}/></figure>
            <ConversationsSlot activeConversationId={activeConversationId} setActiveConversationId={setActiveConversationId}/>
            <DocumentsSlot/>
            <PromptsSlot selectedPromptNameRef={selectedPromptNameRef} memoizedSetModalStatus={memoizedSetModalStatus}/>
        </aside>
    )
}, (prevProps, nextProps) => {
    return prevProps.activeConversationId === nextProps.activeConversationId && prevProps.activeConversationStateRef.current === nextProps.activeConversationStateRef.current /* && prevProps.promptsList === nextProps.promptsList // should refresh with a key instead*/ ;
})

export default LeftPanel

interface IProps{
    activeConversationId : number
    setActiveConversationId : ({value} : {value : number}) => void
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId : string}) => void
    selectedPromptNameRef : React.MutableRefObject<string>
    activeConversationStateRef: React.MutableRefObject<IConversation>
}