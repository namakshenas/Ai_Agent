/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import useFetchPromptsList from "../../hooks/useFetchPromptsList";
// import PromptLibrary from "../../services/PromptLibrary";

export function PromptsSlot({memoizedSetModalStatus, selectedPromptNameRef, isAPIOffline} : IProps){
    
    const [promptsListPage, setPromptsListPage] = useState(0)
    const {promptsList, setPromptsList} = useFetchPromptsList()

    function handleNextPage() : void{
        setPromptsListPage(page => page + 1 < Math.ceil(promptsList.length/3) ? page+1 : 0)
    }

    function handlePreviousPage() : void{
        setPromptsListPage(page => page - 1 < 0 ? Math.ceil(promptsList.length/3) - 1 : page - 1)
    }

    function nBlankConversationSlotsNeededAsFillers() : number{
        if (promptsListPage*3+3 < promptsList.length) return 0
        return promptsListPage*3+3 - promptsList.length
    }

    function handleOpenEditPromptFormClick(promptName : string) : void {
        selectedPromptNameRef.current = promptName
        memoizedSetModalStatus({visibility : true, contentId : "formEditPrompt"})
    }

    function handleOpenNewPromptFormClick() : void {
        memoizedSetModalStatus({visibility : true, contentId : "formNewPrompt"})
    }

    return(
    <article style={{marginTop:'0.75rem'}}>
        <h3>
            PROMPTS<span className='nPages'>Page {promptsListPage+1} on {Math.ceil(promptsList.length/3)}</span>
        </h3>
        <ul>
            {promptsList.slice(promptsListPage * 3, promptsListPage * 3 + 3).map((prompt, index) => (<li key={"prompt" + index + promptsListPage * 3} onClick={() => handleOpenEditPromptFormClick(prompt.name)}>{prompt.name}</li>))}
            {
                nBlankConversationSlotsNeededAsFillers() > 0 && Array(nBlankConversationSlotsNeededAsFillers()).fill("").map((_,id) => (<li className='fillerItem' key={"blank"+id}></li>))
            }
        </ul>
        <div className='buttonsContainer'>
            <button className="white" style={{marginLeft:'auto'}} onClick={handlePreviousPage}>
                <svg height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
            </button>
            <button className="white" onClick={handleNextPage}>
                <svg style={{transform:'rotate(180deg)'}} height="16" width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
            </button>
            <button className="purple purpleShadow" onClick={handleOpenNewPromptFormClick}>
                <svg width="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
            </button>
        </div>
    </article>
    )
}

interface IProps{
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId : string}) => void
    selectedPromptNameRef : React.MutableRefObject<string>
    isAPIOffline : boolean
}