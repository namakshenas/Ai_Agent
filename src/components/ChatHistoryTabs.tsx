import { ConversationsRepository } from '../repositories/ConversationsRepository'
import { AgentLibrary } from '../services/AgentLibrary'
import '../style/ChatHistoryTabs.css'

function ChatHistoryTabs({activeConversation, setActiveConversation} : IProps){

    // adding a new conversation tab
    function handleNewTabClick(){
        ConversationsRepository.pushNewConversation("conversation " + ConversationsRepository.getNumberOfConversations(), [], AgentLibrary.getAgent("helpfulAssistant").getName())
        setActiveConversation(ConversationsRepository.getNumberOfConversations() - 1)
    }

    function handleSwitchTabClick(id : number){
        setActiveConversation(id)
    }

    return(
        <div className="tabBar">
            {
                ConversationsRepository.getConversations().map((conversation, id) => (
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