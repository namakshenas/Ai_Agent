import { useState } from "react"
import { IConversation } from "../interfaces/IConversation"
import { ConversationsRepository } from "../repositories/ConversationsRepository"

export default function useConversationsListManager(setActiveConversation : (index : number) => void){
    
    const [conversationsListState, setConversationsListState] = useState<IConversation[]>(ConversationsRepository.getConversations())
    const [conversationsListPage, setConversationsListPage] = useState<number>(0)

    function handNewConversation() : void{
        ConversationsRepository.pushNewConversation("no_name", [], "", "")
        const nConversations = ConversationsRepository.getConversations().length
        setConversationsListState([...ConversationsRepository.getConversations()])
        setConversationsListPage(Math.ceil(nConversations / 3) - 1)
        setActiveConversation(nConversations - 1)
    }

    function handleSetActiveConversation(id : number) : void{
        setActiveConversation(id)
    }

    function handleDeleteConversation(id : number) : void{
        ConversationsRepository.deleteConversation(id)
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

    return {
        conversationsListState, 
        setConversationsListState, 
        conversationsListPage, 
        setConversationsListPage,
        handleDeleteConversation,
        handleNextConversationsListPage,
        handlePreviousConversationsListPage,
        handleSetActiveConversation,
        handNewConversation,
    }
}