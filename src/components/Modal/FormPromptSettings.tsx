/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react"
import './FormPromptSettings.css'
import useFetchPrompt from "../../hooks/useFetchPrompt"
import PromptLibrary from "../../services/PromptLibrary"
import PromptService from "../../services/PromptService"

export function FormPromptSettings({memoizedSetModalStatus, selectedPromptNameRef, isAPIOffline, setForceLeftPanelRefresh, role} : IProps){

    const { prompt, setPrompt } = useFetchPrompt(selectedPromptNameRef?.current, isAPIOffline)

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
            // PromptLibrary.updatePrompt(prompt.name, formValues.name, formValues.prompt)
            /*if(!isAPIOffline) */PromptService.update(prompt.name, formValues.name, formValues.prompt, "0.0.1")
        }
        if(role == "create") {
            /*PromptLibrary.addPrompt(formValues.name, formValues.prompt)
            if(!isAPIOffline) */ PromptService.save(formValues.name, formValues.prompt, "0.0.1")
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
        <input aria-labelledby="label-name" 
            style={{maxWidth:'50%'}} type="text" 
            spellCheck="false" 
            value={formValues.name} 
            onChange={(e) => setFormValues(formValues => ({...formValues, name : e.target?.value}))}
        />
        <label id="label-prompt">Prompt</label>
        <textarea
            aria-labelledby="label-prompt"
            spellCheck="false"
            className="form-textarea" 
            rows={12} 
            value={formValues.prompt}
            onChange={(e) => setFormValues(formValues => ({...formValues, prompt : e.target?.value}))}
        />
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
    isAPIOffline? : boolean
    setForceLeftPanelRefresh : React.Dispatch<React.SetStateAction<number>>
    role : "edit" | "create"
}

interface IFormStructure {
    name : string
    prompt : string
}