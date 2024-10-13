/* eslint-disable @typescript-eslint/no-unused-vars */
import './LeftPanel3.css'
import ollama from '../../assets/Ollama3.png'
import DocumentsSlot from './DocumentsSlot'
import { ConversationsSlot } from './ConversationsSlot'
import { PromptsSlot } from './PromptsSlot'
import { useEffect } from 'react'
import React from 'react'
import { IConversation } from '../../interfaces/IConversation'
import { TAction } from '../../hooks/useActiveConversationReducer'

// export default function LeftPanel({activeConversation, setActiveConversation, setModalStatus, selectedPromptRef} : IProps){
const LeftPanel = React.memo(({activeConversationId, activeConversationStateRef, setActiveConversationId, dispatch, memoizedSetModalStatus, selectedPromptNameRef} : IProps) => {

    useEffect(() => {console.log("left panel render")})

    return(
        <aside className="leftDrawer">
            <figure style={{cursor:'pointer'}} onClick={() => location.reload()}><span>OSSPITA FOR</span> <img src={ollama}/></figure>
            <ConversationsSlot activeConversationId={activeConversationId} setActiveConversationId={setActiveConversationId} dispatch={dispatch}/>
            <DocumentsSlot memoizedSetModalStatus={memoizedSetModalStatus}/>
            <PromptsSlot selectedPromptNameRef={selectedPromptNameRef} memoizedSetModalStatus={memoizedSetModalStatus}/>
        </aside>
    )
}, (prevProps, nextProps) => {
    return prevProps.activeConversationId === nextProps.activeConversationId && prevProps.activeConversationStateRef.current === nextProps.activeConversationStateRef.current ;
})

export default LeftPanel

interface IProps{
    activeConversationId : number
    setActiveConversationId : ({value} : {value : number}) => void
    dispatch : React.Dispatch<TAction>
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId : string}) => void
    selectedPromptNameRef : React.MutableRefObject<string>
    activeConversationStateRef: React.MutableRefObject<IConversation>
}