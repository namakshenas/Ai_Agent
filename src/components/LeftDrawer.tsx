/* eslint-disable @typescript-eslint/no-unused-vars */
import './LeftDrawer2.css'
import ollama from '../assets/Ollama3.png'
import { ConversationsRepository } from '../repositories/ConversationsRepository'
import { useState } from 'react'
import { IConversation } from '../interfaces/IConversation'

export default function LeftDrawer({activeConversation, setActiveConversation} : IProps){

    const [conversationsListState, setConversationsListState] = useState<IConversation[]>(ConversationsRepository.getConversations())
    const [conversationsListPage, setConversationsListPage] = useState<number>(0)

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

    return(
        <aside className="leftDrawer">
            <figure><span>OSspita for</span> <img src={ollama}/></figure>
            <h3>
                CONVERSATIONS<span style={{marginLeft:'auto'}}>{conversationsListPage+1}/{Math.ceil(conversationsListState.length/3)}</span>
            </h3>
            <ul>
                {conversationsListState.slice(conversationsListPage*3, conversationsListPage*3+3).map((conversation, id) => (
                    conversationsListPage*3+id != activeConversation ?
                    <li onClick={() => handleSetActiveConversation(conversationsListPage*3+id)} key={"conversation" + conversationsListPage*3+id} role="button">{conversation.name}</li> : 
                    <li className="active" key={"conversation" + conversationsListPage*3+id} role="button">
                        <span>{conversation.name}</span>
                        <button className='conversationTrashBtn' onClick={() => handleDeleteConversation(conversationsListPage*3+id)}>
                            <svg width="14" height="16" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#ffffff" d="M188 40H152V28C152 20.5739 149.05 13.452 143.799 8.20101C138.548 2.94999 131.426 0 124 0H76C68.5739 0 61.452 2.94999 56.201 8.20101C50.95 13.452 48 20.5739 48 28V40H12C8.8174 40 5.76516 41.2643 3.51472 43.5147C1.26428 45.7652 0 48.8174 0 52C0 55.1826 1.26428 58.2348 3.51472 60.4853C5.76516 62.7357 8.8174 64 12 64H16V200C16 205.304 18.1071 210.391 21.8579 214.142C25.6086 217.893 30.6957 220 36 220H164C169.304 220 174.391 217.893 178.142 214.142C181.893 210.391 184 205.304 184 200V64H188C191.183 64 194.235 62.7357 196.485 60.4853C198.736 58.2348 200 55.1826 200 52C200 48.8174 198.736 45.7652 196.485 43.5147C194.235 41.2643 191.183 40 188 40ZM72 28C72 26.9391 72.4214 25.9217 73.1716 25.1716C73.9217 24.4214 74.9391 24 76 24H124C125.061 24 126.078 24.4214 126.828 25.1716C127.579 25.9217 128 26.9391 128 28V40H72V28ZM160 196H40V64H160V196ZM88 96V160C88 163.183 86.7357 166.235 84.4853 168.485C82.2348 170.736 79.1826 172 76 172C72.8174 172 69.7652 170.736 67.5147 168.485C65.2643 166.235 64 163.183 64 160V96C64 92.8174 65.2643 89.7652 67.5147 87.5147C69.7652 85.2643 72.8174 84 76 84C79.1826 84 82.2348 85.2643 84.4853 87.5147C86.7357 89.7652 88 92.8174 88 96ZM136 96V160C136 163.183 134.736 166.235 132.485 168.485C130.235 170.736 127.183 172 124 172C120.817 172 117.765 170.736 115.515 168.485C113.264 166.235 112 163.183 112 160V96C112 92.8174 113.264 89.7652 115.515 87.5147C117.765 85.2643 120.817 84 124 84C127.183 84 130.235 85.2643 132.485 87.5147C134.736 89.7652 136 92.8174 136 96Z"/>
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
            <div style={{display:'flex', columnGap:'0.5rem'}}>
                <button style={{marginLeft:'auto'}} className='lemongreen' onClick={handlePreviousConversationsListPage}>
                    <svg height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </button>
                <button className='lemongreen' onClick={handleNextConversationsListPage}>
                    <svg style={{transform:'rotate(180deg)'}} height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </button>
                <button onClick={handNewConversation}>
                    <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                </button>
            </div>
            <h3 style={{marginTop:'1.5rem'}}>
                {/*<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 576 512"><path fill="#b8c5cf" d="M284 224.8a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 284 224.8zm-110.5 0a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 173.6 224.8zm220.9 0a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 394.5 224.8zm153.8-55.3c-15.5-24.2-37.3-45.6-64.7-63.6-52.9-34.8-122.4-54-195.7-54a406 406 0 0 0 -72 6.4 238.5 238.5 0 0 0 -49.5-36.6C99.7-11.7 40.9 .7 11.1 11.4A14.3 14.3 0 0 0 5.6 34.8C26.5 56.5 61.2 99.3 52.7 138.3c-33.1 33.9-51.1 74.8-51.1 117.3 0 43.4 18 84.2 51.1 118.1 8.5 39-26.2 81.8-47.1 103.5a14.3 14.3 0 0 0 5.6 23.3c29.7 10.7 88.5 23.1 155.3-10.2a238.7 238.7 0 0 0 49.5-36.6A406 406 0 0 0 288 460.1c73.3 0 142.8-19.2 195.7-54 27.4-18 49.1-39.4 64.7-63.6 17.3-26.9 26.1-55.9 26.1-86.1C574.4 225.4 565.6 196.4 548.3 169.5zM285 409.9a345.7 345.7 0 0 1 -89.4-11.5l-20.1 19.4a184.4 184.4 0 0 1 -37.1 27.6 145.8 145.8 0 0 1 -52.5 14.9c1-1.8 1.9-3.6 2.8-5.4q30.3-55.7 16.3-100.1c-33-26-52.8-59.2-52.8-95.4 0-83.1 104.3-150.5 232.8-150.5s232.9 67.4 232.9 150.5C517.9 342.5 413.6 409.9 285 409.9z"/></svg>*/}
                DOCUMENTS / RAG<span style={{marginLeft:'auto'}}>1/5</span>
            </h3>
            <ul>
                <li><div className='activeFileIndic'></div>tiny-shakespeare.txt<span style={{marginLeft:'auto'}}> 1.06 MB</span></li>
                <li>state_of_the_union.txt<span style={{marginLeft:'auto'}}>38.1 KB</span></li>
                <li>tinyStoriesV2-GPT4-train.txt<span style={{marginLeft:'auto'}}>22.5 MB</span></li>
            </ul>
            <div style={{display:'flex', columnGap:'0.5rem'}}>
                <button style={{marginLeft:'auto'}} className='lemongreen'>
                    <svg height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </button>
                <button className='lemongreen'>
                    <svg style={{transform:'rotate(180deg)'}} height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </button>
                <button>
                <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                </button>
            </div>
            <h3 style={{marginTop:'1.5rem'}}>
                {/*<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 576 512"><path fill="#b8c5cf" d="M284 224.8a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 284 224.8zm-110.5 0a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 173.6 224.8zm220.9 0a34.1 34.1 0 1 0 34.3 34.1A34.2 34.2 0 0 0 394.5 224.8zm153.8-55.3c-15.5-24.2-37.3-45.6-64.7-63.6-52.9-34.8-122.4-54-195.7-54a406 406 0 0 0 -72 6.4 238.5 238.5 0 0 0 -49.5-36.6C99.7-11.7 40.9 .7 11.1 11.4A14.3 14.3 0 0 0 5.6 34.8C26.5 56.5 61.2 99.3 52.7 138.3c-33.1 33.9-51.1 74.8-51.1 117.3 0 43.4 18 84.2 51.1 118.1 8.5 39-26.2 81.8-47.1 103.5a14.3 14.3 0 0 0 5.6 23.3c29.7 10.7 88.5 23.1 155.3-10.2a238.7 238.7 0 0 0 49.5-36.6A406 406 0 0 0 288 460.1c73.3 0 142.8-19.2 195.7-54 27.4-18 49.1-39.4 64.7-63.6 17.3-26.9 26.1-55.9 26.1-86.1C574.4 225.4 565.6 196.4 548.3 169.5zM285 409.9a345.7 345.7 0 0 1 -89.4-11.5l-20.1 19.4a184.4 184.4 0 0 1 -37.1 27.6 145.8 145.8 0 0 1 -52.5 14.9c1-1.8 1.9-3.6 2.8-5.4q30.3-55.7 16.3-100.1c-33-26-52.8-59.2-52.8-95.4 0-83.1 104.3-150.5 232.8-150.5s232.9 67.4 232.9 150.5C517.9 342.5 413.6 409.9 285 409.9z"/></svg>*/}
               PROMPTS<span style={{marginLeft:'auto'}}>1/2</span>
            </h3>
            <ul>
                <li>HelpfulAssistantPrompt</li>
                <li>COTGeneratorPrompt</li>
                <li>searchQueryOptimizerPrompt</li>
            </ul>
            <div style={{display:'flex', columnGap:'0.5rem'}}>
                <button style={{marginLeft:'auto'}} className='lemongreen'>
                    <svg height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </button>
                <button className='lemongreen'>
                    <svg style={{transform:'rotate(180deg)'}} height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                </button>
                <button>
                <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                </button>
            </div>
        </aside>
    )
}

interface IProps{
    activeConversation : number
    setActiveConversation : (index : number) => void
}