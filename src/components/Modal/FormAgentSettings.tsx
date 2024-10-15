/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { AIAgent } from "../../models/AIAgent";
import Select, { IOption } from "../CustomSelect/Select";
import './FormAgentSettings.css'
import useFetchModelsList from "../../hooks/useFetchModelsList";
import IFormStructure from "../../interfaces/IAgentFormStructure";
import picots from '../../assets/sliderpicots.png'
import { ChatService } from "../../services/ChatService";
import AgentService from "../../services/API/AgentService";

export default function FormAgentSettings({memoizedSetModalStatus, role, triggerAIAgentsListRefresh} : IProps){

    const modelList = useFetchModelsList()
    const currentAgent = useRef<AIAgent | null>(null)

    const [webSearchEconomy, setWebSearchEconomy] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function retrieveAgent(agentName : string) {
            const agentDatas = await AgentService.getAgentByName(agentName)
            if(agentDatas) currentAgent.current = new AIAgent({...agentDatas, modelName : agentDatas.model})
            const baseForm : IFormStructure = {
                agentName: role == "edit" && currentAgent.current ? currentAgent.current.getName() : "",
                modelName: role == "edit" && currentAgent.current ? currentAgent.current.getModelName() : (modelList[0] != null ? modelList[0] :  ""),
                systemPrompt: role == "edit" && currentAgent.current ? currentAgent.current.getSystemPrompt().replace(/\t/g,'') : "",
                temperature: role == "edit" && currentAgent.current ? currentAgent.current.getTemperature() : 0.8,
                maxContextLength: role == "edit" && currentAgent.current ? currentAgent.current.getContextSize() : 2048,
                maxTokensPerReply: role == "edit" && currentAgent.current ? currentAgent.current.getNumPredict() : 1024,
                webSearchEconomy: false,
            }
            setFormValues({...baseForm})
            
        }

        retrieveAgent(ChatService.getActiveAgent().getName())
    }, [])

    const [formValues, setFormValues] = useState<IFormStructure>({
        agentName : "",
        modelName : "",
        systemPrompt : "",
        temperature : 0.8,
        maxContextLength : 2048,
        maxTokensPerReply : 1024,
        webSearchEconomy : false,
    })

    // const startAgentName = useRef<string>(role == "edit" && currentAgent.current ? currentAgent.current.getName() : "")

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

    function isFormValid(){
        setError("")
        if(formValues.agentName == "") { 
            setError("Agent name is required.")
            return false
        }
        if(formValues.modelName == "") return
        if(formValues.systemPrompt == "") { 
            setError("System prompt is missing.")
            return false
        }
        if(formValues.temperature < 0 || formValues.temperature > 1) { 
            setError("Temperature must be > 0 and <= 1.")
            return false
        }
        if(formValues.maxContextLength < 1024 || formValues.maxContextLength > 8388608) { 
            setError("Context length must be >= 1024 and < 8388609.")
            return false
        }
        if(formValues.maxTokensPerReply < 1 || formValues.maxTokensPerReply > 128000) { 
            setError("Max tokens must be >= 1 and < 128000.")
            return false
        }
        return true
    }

    async function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        if(!isFormValid()) return
        const newAgent = new AIAgent({
            id : role == "edit" && currentAgent.current ? currentAgent.current.getId() : "", 
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
        if(role == "edit") response = await AgentService.updateById(newAgent)
        
        // if any error saving or updating the model -> the modal stays open & the active agent is not updated
        if(response != null) return setError(response)
        
        triggerAIAgentsListRefresh()
        ChatService.setActiveAgent(newAgent)
    
        // if(setForceRightPanelRefresh) setForceRightPanelRefresh(prev => prev + 1)
            
        memoizedSetModalStatus({visibility : false})
    }

    return (
        <form className="agentForm">

            <div className="labelErrorContainer"><label id="label-agentName" style={{marginTop:0}} className="formLabel">Agent Name</label>{(error != "" && error.includes("Agent name")) && <span className="errorMessage">{error}</span>}</div>
            <div/>
            <label id="label-modelName" style={{marginTop:0}} className="formLabel">Model</label>

            <input
                aria-labelledby="label-agentName"
                type="text"
                className="formInput" 
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

            <div style={{gridArea:'e'}} className="labelErrorContainer"><label id="label-systemPrompt" className="formLabel">System Prompt</label>{(error != "" && error.includes("System prompt")) && <span style={{marginTop:'1.5rem'}} className="errorMessage">System Prompt is missing</span>}</div>

            <textarea
                aria-labelledby="label-systemPrompt"
                style={{gridArea:'f'}}
                spellCheck="false"
                className="formTextarea" 
                rows={12} 
                value={formValues.systemPrompt}
                onChange={(e) => setFormValues(formValues => ({...formValues, systemPrompt : e.target?.value}))}
            />

            <label id="label-temperature" className="formLabel">Temperature</label>
            <div/>
            <label id="label-maxTokensPerReply" className="formLabel">Max Tokens Per Reply</label>

            <div className="inputNSliderContainer">
                <input
                aria-labelledby="label-temperature"
                className="formInput"
                spellCheck="false"
                type="number"
                step="0.01" min="0.01" max="1" 
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
                    className="formInput"
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

            <label id="label-maxContextLength" className="formLabel">Max Context Length</label>
            <div/>
            <label id="label-webSearch" className="formLabel">Web Search</label>

            <div className="inputNSliderContainer">
                <input
                    aria-labelledby="label-maxContextLength" 
                    spellCheck="false" 
                    type="number"
                    step="1" min="0" max="1000000" 
                    className="formInput"
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
                <button onClick={handleCancelClick} className="cancelButton purpleShadow">Cancel</button>
                <button onClick={handleSaveClick} className="saveButton purpleShadow">Save</button>
            </div>
        </form>
    )
}

interface IProps{
    // currentAgent? : AIAgent
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
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