/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react"
import { IConversation } from "../../interfaces/IConversation"
import { ConversationsRepository } from "../../repositories/ConversationsRepository"

export function ConversationsSlot({conversationStateRef, activeConversation, setActiveConversation} : IProps){
    // should be replaced by a fn from the reducer
    const [conversationsListState, setConversationsListState] = useState<IConversation[]>(ConversationsRepository.getConversations()) 
    const [conversationsListPage, setConversationsListPage] = useState<number>(0)

    // when the conversation state is modified, retrieve the conversations from the repository and update the displayed list
    useEffect(() => {
        setConversationsListState(ConversationsRepository.getConversations())
    }, [conversationStateRef.current])

    function handNewConversation() : void{
        ConversationsRepository.pushNewConversation("no_name", [], "")
        const nConversations = ConversationsRepository.getConversations().length
        setConversationsListState([...ConversationsRepository.getConversations()])
        setConversationsListPage(Math.ceil(nConversations / 3) - 1)
        setActiveConversation(nConversations - 1)
    }

    function handleSetActiveConversation(id : number) : void{
        setActiveConversation(id)
    }

    function handleDeleteConversation(id : number) : void{
        ConversationsRepository.deleteConversation(id) // issue when deleting first conv, conv still displayed (chat history) 
        // !!! refresh of chat history happens when active conversation id change
        // but when i delete convo 0 then convo 1 becomes convo 0 and then active id stays at 0 // should refresh on n_conversations (length) too?
        setConversationsListState([...ConversationsRepository.getConversations()])
        setActiveConversation(id > 0 ? id - 1 : 0)
        const nConversations = ConversationsRepository.getConversations().length
        if(Math.ceil(nConversations / 3) - 1 < conversationsListPage) setConversationsListPage(pageId => pageId - 1)
        // move to previous page if no conversation left on the page after deleting a conversation
    }

    function handleNextConversationsListPage() : void{
        setConversationsListPage(conversationsListPage => conversationsListPage + 1 < Math.ceil(conversationsListState.length/3) ? conversationsListPage+1 : 0)
    }

    function handlePreviousConversationsListPage() : void{
        setConversationsListPage(conversationsListPage => conversationsListPage - 1 < 0 ? Math.ceil(conversationsListState.length/3) - 1 : conversationsListPage - 1)
    }

    function nBlankConversationSlotsNeededAsFillers() : number{
        if (conversationsListPage*3+3 < conversationsListState.length) return 0
        return conversationsListPage*3+3 - conversationsListState.length
    }

    return(
        <article>
                <h3>
                    CONVERSATIONS<span className='nPages'>Page {conversationsListPage+1} on {Math.ceil(conversationsListState.length/3)}</span>
                </h3>
                <ul style={{minHeight : '118px'}}>
                    {conversationsListState.slice(conversationsListPage*3, conversationsListPage*3+3).map((conversation, id) => (
                        conversationsListPage*3+id != activeConversation ?
                        <li onClick={() => handleSetActiveConversation(conversationsListPage*3+id)} key={"conversation" + conversationsListPage*3+id} role="button">
                            {conversation.history[0]?.question.substring(0, 45) || conversation.name}
                            <svg className="arrow" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg">
                                <path fill="none" d="M1 1L5.29289 5.29289C5.68342 5.68342 5.68342 6.31658 5.29289 6.70711L1 11" stroke="#6D48C1" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </li> : 
                        <li className="active" key={"conversation" + conversationsListPage*3+id} role="button">
                            <span>{conversation.history[0]?.question.substring(0, 45) || conversation.name}</span>
                            <button className='conversationTrashBtn' onClick={() => handleDeleteConversation(conversationsListPage*3+id)}>
                                <svg width="14" height="16" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#ffffff" d="M188 40H152V28C152 20.5739 149.05 13.452 143.799 8.20101C138.548 2.94999 131.426 0 124 0H76C68.5739 0 61.452 2.94999 56.201 8.20101C50.95 13.452 48 20.5739 48 28V40H12C8.8174 40 5.76516 41.2643 3.51472 43.5147C1.26428 45.7652 0 48.8174 0 52C0 55.1826 1.26428 58.2348 3.51472 60.4853C5.76516 62.7357 8.8174 64 12 64H16V200C16 205.304 18.1071 210.391 21.8579 214.142C25.6086 217.893 30.6957 220 36 220H164C169.304 220 174.391 217.893 178.142 214.142C181.893 210.391 184 205.304 184 200V64H188C191.183 64 194.235 62.7357 196.485 60.4853C198.736 58.2348 200 55.1826 200 52C200 48.8174 198.736 45.7652 196.485 43.5147C194.235 41.2643 191.183 40 188 40ZM72 28C72 26.9391 72.4214 25.9217 73.1716 25.1716C73.9217 24.4214 74.9391 24 76 24H124C125.061 24 126.078 24.4214 126.828 25.1716C127.579 25.9217 128 26.9391 128 28V40H72V28ZM160 196H40V64H160V196ZM88 96V160C88 163.183 86.7357 166.235 84.4853 168.485C82.2348 170.736 79.1826 172 76 172C72.8174 172 69.7652 170.736 67.5147 168.485C65.2643 166.235 64 163.183 64 160V96C64 92.8174 65.2643 89.7652 67.5147 87.5147C69.7652 85.2643 72.8174 84 76 84C79.1826 84 82.2348 85.2643 84.4853 87.5147C86.7357 89.7652 88 92.8174 88 96ZM136 96V160C136 163.183 134.736 166.235 132.485 168.485C130.235 170.736 127.183 172 124 172C120.817 172 117.765 170.736 115.515 168.485C113.264 166.235 112 163.183 112 160V96C112 92.8174 113.264 89.7652 115.515 87.5147C117.765 85.2643 120.817 84 124 84C127.183 84 130.235 85.2643 132.485 87.5147C134.736 89.7652 136 92.8174 136 96Z"/>
                                </svg>
                            </button>
                        </li>
                    ))}
                    {
                        nBlankConversationSlotsNeededAsFillers() > 0 && Array(nBlankConversationSlotsNeededAsFillers()).fill("").map((el,id) => (<li className='fillerItem' key={"blank"+id}></li>))
                    }
                </ul>
                <div className='buttonsContainer'>
                    <button className="white" style={{marginLeft:'auto'}} onClick={handlePreviousConversationsListPage}>
                        <svg height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                    </button>
                    <button className="white" onClick={handleNextConversationsListPage}>
                        <svg style={{transform:'rotate(180deg)'}} height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                    </button>
                    <button className="purple purpleShadow" onClick={handNewConversation}>
                        <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                    </button>
                </div>
            </article>
    )

}

interface IProps{
    activeConversation : number
    setActiveConversation : (index : number) => void
    conversationStateRef: React.MutableRefObject<IConversation>
}