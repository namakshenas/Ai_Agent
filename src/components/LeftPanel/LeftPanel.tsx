/* eslint-disable @typescript-eslint/no-unused-vars */
import './LeftPanel3.css'
import ollama from '../../assets/Ollama3.png'
import DocumentsSlot from './DocumentsSlot'
import { ConversationsSlot } from './ConversationsSlot'

export default function LeftPanel({activeConversation, setActiveConversation} : IProps){

    return(
        <aside className="leftDrawer">
            <figure style={{cursor:'pointer'}} onClick={() => location.reload()}><span>OSspita for</span> <img src={ollama}/></figure>
            <ConversationsSlot activeConversation={activeConversation} setActiveConversation={setActiveConversation}/>
            <DocumentsSlot/>
            <article style={{marginTop:'0.75rem'}}>
                <h3>
                    PROMPTS<span className='nPages'>Page 1 on 2</span>
                </h3>
                <ul>
                    <li>HelpfulAssistantPrompt</li>
                    <li>COTGeneratorPrompt</li>
                    <li>searchQueryOptimizerPrompt</li>
                </ul>
                <div className='buttonsContainer'>
                    <button className="white" style={{marginLeft:'auto'}}>
                        <svg height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                    </button>
                    <button className="white">
                        <svg style={{transform:'rotate(180deg)'}} height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                    </button>
                    <button className="purple purpleShadow">
                        <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                    </button>
                </div>
            </article>
        </aside>
    )
}

interface IProps{
    activeConversation : number
    setActiveConversation : (index : number) => void
}