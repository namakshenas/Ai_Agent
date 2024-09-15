import { ConversationsService } from "../services/ConversationsService";
import '../style/ChatHistoryTabs.css'

function ChatHistoryTabs({activeConversation, setActiveConversation} : IProps){

    // adding a new conversation tab
    function handleNewTabClick(){
        ConversationsService.pushNewConversation("conversation " + ConversationsService.getNumberOfConversations(), [])
        setActiveConversation(ConversationsService.getNumberOfConversations() - 1)
    }

    function handleSwitchTabClick(id : number){
        setActiveConversation(id)
    }

    return(
        <div className="tabBar">
            {
                ConversationsService.getConversations().map((conversation, id) => (
                <button className={activeConversation == id ? 'active' : ''} style={{columnGap:'1rem'}} key={'tabButton'+id} onClick={() => handleSwitchTabClick(id)}><span>{conversation.name}</span>
                </button>))
            }
            <button onClick={handleNewTabClick}>+</button>
        </div>
    )
}

export default ChatHistoryTabs

interface IProps{
    activeConversation : number
    setActiveConversation : (index : number) => void
}