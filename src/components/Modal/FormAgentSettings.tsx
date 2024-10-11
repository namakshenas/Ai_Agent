/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { AIAgent } from "../../models/AIAgent";
import Select, { IOption } from "../CustomSelect/Select";
import './FormAgentSettings.css'
import useFetchModelsList from "../../hooks/useFetchModelsList";
import IFormStructure from "../../interfaces/IAgentFormStructure";
import picots from '../../assets/sliderpicots.png'
import { ChatService } from "../../services/ChatService";
import { AgentLibrary } from "../../services/AgentLibrary";
import AgentService from "../../services/API/AgentService";

export default function FormAgentSettings({memoizedSetModalStatus, setForceRightPanelRefresh, role, triggerAIAgentsListRefresh} : IProps){

    const modelList = useFetchModelsList()
    const currentAgent = useRef<AIAgent>(ChatService.getActiveAgent())

    const [webSearchEconomy, setWebSearchEconomy] = useState(true)
    const [error, setError] = useState("")

    const baseForm : IFormStructure = {
        agentName: role == "edit" ? currentAgent.current.getName() : "",
        modelName: role == "edit" ? currentAgent.current.getModelName() : (modelList[0] != null ? modelList[0] :  ""),
        systemPrompt: role == "edit" ? currentAgent.current.getSystemPrompt().replace(/\t/g,'') : "",
        temperature: role == "edit" ? currentAgent.current.getTemperature() : 0.8,
        maxContextLength: role == "edit" ? currentAgent.current.getContextSize() : 2048,
        maxTokensPerReply: role == "edit" ? currentAgent.current.getNumPredict() : 1024,
        webSearchEconomy: false,
    }

    const [formValues, setFormValues] = useState<IFormStructure>(baseForm)

    useEffect(() => {
        if (role == "create") {
            setFormValues(prevValues => ({...prevValues, modelName : modelList[0]}))
        }
    }, [modelList])

    function handleSwitchModel(option : IOption){
        setFormValues(currentFormValues => ({...currentFormValues, modelName: option.value}))
    }

    function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        memoizedSetModalStatus({visibility : false})
    }

    function areFormDatasValid(){
        if(formValues.agentName == "") return false
        if(formValues.modelName == "") return false
        if(formValues.systemPrompt == "") return false
        if(formValues.temperature < 0 || formValues.temperature > 1) return false
        if(formValues.maxContextLength < 1024 || formValues.maxContextLength > 8388608) return false
        if(formValues.maxTokensPerReply < 1 || formValues.maxTokensPerReply > 128000) return false
        return true
    }

    async function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        if(!areFormDatasValid()) return // !!! error message missing
        console.log("modelName : " + formValues.modelName)
        const newAgent = new AIAgent({
            id : role == "edit" ? currentAgent.current.getId() : AgentLibrary.generatePlaceholderId(), 
            modelName: formValues.modelName, 
            name : formValues.agentName, 
            type : role == "edit" ? ChatService.getActiveAgent().getType() : "user_created", 
            favorite : false
        })
        .setContextSize(formValues.maxContextLength)
        .setNumPredict(formValues.maxTokensPerReply)
        .setSystemPrompt(formValues.systemPrompt)
        .setTemperature(formValues.temperature)

        let response
        if(role == "create") response = await AgentService.save(newAgent)
        if(role == "edit") response = await  AgentService.update(newAgent)
        
        // if any error saving or updating the model -> the modal stays open & the active agent is not updated
        if(response != null) return setError(response)
        
        ChatService.setActiveAgent(newAgent)
        
        triggerAIAgentsListRefresh()
        if(setForceRightPanelRefresh) setForceRightPanelRefresh(prev => prev + 1)
            
        memoizedSetModalStatus({visibility : false})
    }

    return (
        <form className="agent-form">

            <label id="label-agentName" style={{marginTop:0}} className="form-label">Agent Name</label>
            <div/>
            <label id="label-modelName" style={{marginTop:0}} className="form-label">Model</label>

            <input
                aria-labelledby="label-agentName"
                type="text"
                className="form-input" 
                spellCheck="false"
                value={formValues.agentName}
                onChange={(e) => setFormValues(formValues => ({...formValues, agentName : e.target?.value}))}
            />
            <div/>
            <Select 
                width="100%"
                options={modelList.map((model) => ({ label: model, value: model }))} 
                defaultOption={formValues.modelName}
                labelledBy="label-modelName" 
                id="settingsSelectAgent"
                onValueChange={handleSwitchModel}
            />

            <label id="label-systemPrompt" style={{gridArea:'e'}} className="form-label">System Prompt</label>

            <textarea
                aria-labelledby="label-systemPrompt"
                style={{gridArea:'f'}}
                spellCheck="false"
                className="form-textarea" 
                rows={12} 
                value={formValues.systemPrompt}
                onChange={(e) => setFormValues(formValues => ({...formValues, systemPrompt : e.target?.value}))}
            />

            <label id="label-temperature" className="form-label">Temperature</label>
            <div/>
            <label id="label-maxTokensPerReply" className="form-label">Max Tokens Per Reply</label>

            <div className="inputNSliderContainer">
                <input
                aria-labelledby="label-temperature"
                className="form-input"
                spellCheck="false"
                type="number"
                step="0.01" min="0" max="1" 
                value={formValues.temperature}
                onChange={(e) => setFormValues(formValues => ({...formValues, temperature : e.target.value === '' ? 0 : parseFloat(e.target.value)}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider" style={{marginLeft:'180px'}}>
                                <img src={picots} alt="picots" className="sliderPicots"/>
                            </div>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'10px', fontSize:'14px'}}>
                            <span>Temperature</span><span>0.8</span>
                        </div>
                    </div>
                </div>
            </div>
            <div/>
            <div className="inputNSliderContainer">
                <input 
                    aria-labelledby="label-maxTokensPerReply"
                    spellCheck="false"
                    type="number"
                    className="form-input"
                    value={formValues.maxTokensPerReply}
                    onChange={(e) => setFormValues(formValues => ({...formValues, maxTokensPerReply : e.target.value === '' ? 0 : parseInt(e.target.value)}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider" style={{marginLeft:'110px'}}>
                                <img src={picots} alt="picots" className="sliderPicots"/>
                            </div>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'10px', fontSize:'14px'}}>
                            <span>Max Tokens</span><span>1024</span>
                        </div>
                    </div>
                </div>
            </div>

            <label id="label-maxContextLength" className="form-label">Max Context Length</label>
            <div/>
            <label id="label-webSearch" className="form-label">Web Search</label>

            <div className="inputNSliderContainer">
                <input
                    aria-labelledby="label-maxContextLength" 
                    spellCheck="false" 
                    type="number"
                    step="1" min="0" max="1000000" 
                    className="form-input"
                    value={formValues.maxContextLength}
                    onChange={(e) => setFormValues(formValues => ({...formValues, maxContextLength : e.target.value === '' ? 0 : parseInt(e.target.value)}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider" style={{marginLeft:'50px'}}>
                                <img src={picots} alt="picots" className="sliderPicots"/>
                            </div>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'10px', fontSize:'14px'}}>
                            <span>Context Length</span><span>2048</span>
                        </div>
                    </div>
                </div>
            </div>
            <div/>
            <div className='webSearchContainer'>
                <span>Context Economy (Far slower)</span>
                <div className='switchContainer' onClick={() => setWebSearchEconomy(webSearchEconomy => !webSearchEconomy)}>
                    <div className={webSearchEconomy ? 'switch active' : 'switch'}></div>
                </div>
                <span>Processing Speed</span>
            </div>

            <div style={{gridArea:'o', marginTop:'2rem', display:'flex', flexDirection:'column'}}>
                <div style={{display:'flex', textAlign:'left', width:'100%', marginBottom:'0.25rem'}}><span>Advanced Options</span><span style={{marginLeft:'auto', fontWeight:'500'}}>Coming Soon</span></div>
                <hr/>
            </div>

            <div style={{gridArea:'p', display:'flex', columnGap:'12px', marginTop:'24px'}}>
                <button onClick={handleCancelClick} className="cancel-button purpleShadow">Cancel</button>
                <button onClick={handleSaveClick} className="save-button purpleShadow">Save</button>
            </div>

            <div>{error}</div>
        </form>
    )
}

interface IProps{
    // currentAgent? : AIAgent
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
    setForceRightPanelRefresh? : React.Dispatch<React.SetStateAction<number>>
    triggerAIAgentsListRefresh : () => void
    role : "edit" | "create"
}


/*const emptyForm : IFormStructure = {
    agentName: "",
    modelName: "",
    systemPrompt: "",
    temperature: 0.1,
    maxContextLength: 2048,
    maxTokensPerReply: 0,
    webSearch: false,
}*/