import { ChatConversationsService } from "../services/ChatConversationsService"

function ChatHistoryTabs({activeConversation, setActiveConversation} : IProps){

    // adding a new conversation tab
    function handleNewTabClick(){
        ChatConversationsService.pushConversation([])
        setActiveConversation(ChatConversationsService.getNumberOfConversations() - 1)
    }

    return(
        <div className="tabBar">
            {
                ChatConversationsService.getConversations().map((_, id) => (
                <button className={activeConversation == id ? 'active' : ''} style={{columnGap:'1rem'}} key={'tabButton'+id} onClick={() => setActiveConversation(id)}><span>Conversation {id}</span>
                </button>))
            }
            <button onClick={handleNewTabClick}>+</button>
        </div>
    )
}

export default ChatHistoryTabs

interface IProps{
    activeConversation : number
    setActiveConversation : React.Dispatch<React.SetStateAction<number>>
}