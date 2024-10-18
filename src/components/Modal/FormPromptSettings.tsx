/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react"
import './FormPromptSettings.css'
import useFetchPrompt from "../../hooks/useFetchPrompt"
import PromptService from "../../services/API/PromptService"

export function FormPromptSettings({memoizedSetModalStatus, selectedPromptNameRef, setForceLeftPanelRefresh, role} : IProps){

    const { prompt, setPrompt } = useFetchPrompt(selectedPromptNameRef?.current)

    useEffect(() => {
        setFormValues({name : prompt.name, prompt : prompt.prompt})
    }, [prompt])

    const [formValues, setFormValues] = useState<IFormStructure>({name : prompt.name, prompt : prompt.prompt})
    
    function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        memoizedSetModalStatus({visibility : false})
    }

    function areFormDatasValid(){
        if(formValues.name == "") return false
        if(formValues.prompt == "") return false
        return true
    }

    function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        if(!areFormDatasValid()) return // !!! error message missing
        if(role == "edit") {
            PromptService.updateByName(prompt.name, {name : formValues.name, prompt : formValues.prompt, version : "0.0.1"})
        }
        if(role == "create") {
            PromptService.save(formValues.name, formValues.prompt, "0.0.1")
        }
        if(setForceLeftPanelRefresh) setForceLeftPanelRefresh(prev => prev + 1)
        memoizedSetModalStatus({visibility  : false})
    }

    return(
    <div className="formNHistoryContainer">
        <div className="historyContainer">
            <h3>Prompt History <span style={{fontWeight:'400'}}>(Coming soon)</span></h3>
            <div className="historyTable">
                <div className="historyHeader">
                    <div>Prompt Name</div><div>Version</div>
                </div>
                <div className="historyBody">
                    <div className="historyRow"><div>{prompt.name}</div><div>1.0.0</div></div>
                    <div className="historyRow"><div>{prompt.name}</div><div>0.1.4</div></div>
                    <div className="historyRow"><div>{prompt.name}</div><div>0.0.3</div></div>
                    <div className="historyRow"><div>{prompt.name}</div><div>0.0.2</div></div>
                    <div className="historyRow"><div>{prompt.name}</div><div>0.0.1</div></div>
                </div>
            </div>
        </div>
        <form className="prompt-form">
        <label id="label-name" style={{marginTop:0}}>Name</label>
        <div className="nameNOptionsWrapper">
            <input aria-labelledby="label-name" 
                style={{maxWidth:'50%'}} type="text" 
                spellCheck="false" 
                value={formValues.name} 
                onChange={(e) => setFormValues(formValues => ({...formValues, name : e.target?.value}))}
            />
            <button style={{marginLeft:'auto'}} title="download from cloud">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M6 3C6 2.44772 6.44772 2 7 2H15C15.5523 2 16 2.44772 16 3V9C16 10.6569 14.6569 12 13 12H7C6.44772 12 6 11.5523 6 11V3ZM7 0C5.34315 0 4 1.34315 4 3V11C4 12.6569 5.34315 14 7 14H13C15.7614 14 18 11.7614 18 9V3C18 1.34315 16.6569 0 15 0H7ZM0 5V13C0 15.7614 2.23858 18 5 18H11V16H5C3.34315 16 2 14.6569 2 13V5H0ZM10 8H8V6H10V4H12V6H14V8H12V10H10V8Z" fill="#373737"/>
                </svg>
            </button>
            <button style={{marginLeft:'0.5rem'}} title="save to cloud">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M6 3C6 2.44772 6.44772 2 7 2H15C15.5523 2 16 2.44772 16 3V9C16 10.6569 14.6569 12 13 12H7C6.44772 12 6 11.5523 6 11V3ZM7 0C5.34315 0 4 1.34315 4 3V11C4 12.6569 5.34315 14 7 14H13C15.7614 14 18 11.7614 18 9V3C18 1.34315 16.6569 0 15 0H7ZM0 5V13C0 15.7614 2.23858 18 5 18H11V16H5C3.34315 16 2 14.6569 2 13V5H0ZM10 8H8V6H10V4H12V6H14V8H12V10H10V8Z" fill="#373737"/>
                </svg>
            </button>
            <button style={{marginLeft:'0.5rem'}} title="copy prompt to clipboard">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M6 3C6 2.44772 6.44772 2 7 2H15C15.5523 2 16 2.44772 16 3V9C16 10.6569 14.6569 12 13 12H7C6.44772 12 6 11.5523 6 11V3ZM7 0C5.34315 0 4 1.34315 4 3V11C4 12.6569 5.34315 14 7 14H13C15.7614 14 18 11.7614 18 9V3C18 1.34315 16.6569 0 15 0H7ZM0 5V13C0 15.7614 2.23858 18 5 18H11V16H5C3.34315 16 2 14.6569 2 13V5H0ZM10 8H8V6H10V4H12V6H14V8H12V10H10V8Z" fill="#373737"/>
                </svg>
            </button>
            <button style={{marginLeft:'0.5rem'}} title="delete">
                <svg style={{transform:'translateY(1px)'}} width="16" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#373737" d="M188 40H152V28C152 20.5739 149.05 13.452 143.799 8.20101C138.548 2.94999 131.426 0 124 0H76C68.5739 0 61.452 2.94999 56.201 8.20101C50.95 13.452 48 20.5739 48 28V40H12C8.8174 40 5.76516 41.2643 3.51472 43.5147C1.26428 45.7652 0 48.8174 0 52C0 55.1826 1.26428 58.2348 3.51472 60.4853C5.76516 62.7357 8.8174 64 12 64H16V200C16 205.304 18.1071 210.391 21.8579 214.142C25.6086 217.893 30.6957 220 36 220H164C169.304 220 174.391 217.893 178.142 214.142C181.893 210.391 184 205.304 184 200V64H188C191.183 64 194.235 62.7357 196.485 60.4853C198.736 58.2348 200 55.1826 200 52C200 48.8174 198.736 45.7652 196.485 43.5147C194.235 41.2643 191.183 40 188 40ZM72 28C72 26.9391 72.4214 25.9217 73.1716 25.1716C73.9217 24.4214 74.9391 24 76 24H124C125.061 24 126.078 24.4214 126.828 25.1716C127.579 25.9217 128 26.9391 128 28V40H72V28ZM160 196H40V64H160V196ZM88 96V160C88 163.183 86.7357 166.235 84.4853 168.485C82.2348 170.736 79.1826 172 76 172C72.8174 172 69.7652 170.736 67.5147 168.485C65.2643 166.235 64 163.183 64 160V96C64 92.8174 65.2643 89.7652 67.5147 87.5147C69.7652 85.2643 72.8174 84 76 84C79.1826 84 82.2348 85.2643 84.4853 87.5147C86.7357 89.7652 88 92.8174 88 96ZM136 96V160C136 163.183 134.736 166.235 132.485 168.485C130.235 170.736 127.183 172 124 172C120.817 172 117.765 170.736 115.515 168.485C113.264 166.235 112 163.183 112 160V96C112 92.8174 113.264 89.7652 115.515 87.5147C117.765 85.2643 120.817 84 124 84C127.183 84 130.235 85.2643 132.485 87.5147C134.736 89.7652 136 92.8174 136 96Z"/>
                </svg>
            </button>
        </div>
        <label id="label-prompt">Prompt</label>
        <textarea
            aria-labelledby="label-prompt"
            spellCheck="false"
            className="form-textarea" 
            rows={12} 
            value={formValues.prompt}
            style={{position:"relative"}}
            onChange={(e) => setFormValues(formValues => ({...formValues, prompt : e.target?.value}))}
        />
            {/*<button className="purpleShadow">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M6 3C6 2.44772 6.44772 2 7 2H15C15.5523 2 16 2.44772 16 3V9C16 10.6569 14.6569 12 13 12H7C6.44772 12 6 11.5523 6 11V3ZM7 0C5.34315 0 4 1.34315 4 3V11C4 12.6569 5.34315 14 7 14H13C15.7614 14 18 11.7614 18 9V3C18 1.34315 16.6569 0 15 0H7ZM0 5V13C0 15.7614 2.23858 18 5 18H11V16H5C3.34315 16 2 14.6569 2 13V5H0ZM10 8H8V6H10V4H12V6H14V8H12V10H10V8Z" fill="#8490b3ee"/>
                </svg>
            </button>*/}
        <div style={{display:'flex', columnGap:'12px', marginTop:'24px', width:'50%', justifySelf:'flex-end'}}>
            <button onClick={handleCancelClick} className="cancel-button purpleShadow">Cancel</button>
            <button onClick={handleSaveClick} className="save-button purpleShadow">Save</button>
        </div>
        </form>
    </div>
    )
}

interface IProps{
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
    selectedPromptNameRef? : React.MutableRefObject<string>
    setForceLeftPanelRefresh : React.Dispatch<React.SetStateAction<number>>
    role : "edit" | "create"
}

interface IFormStructure {
    name : string
    prompt : string
}