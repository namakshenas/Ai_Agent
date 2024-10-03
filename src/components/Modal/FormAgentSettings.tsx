/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { AIAgent } from "../../models/AIAgent";
import Select, { IOption } from "../CustomSelect/Select";
import './FormAgentSettings.css'
import useFetchModelsList from "../../hooks/useFetchModelsList";
import IFormStructure from "../../interfaces/IAgentFormStructure";
import picots from '../../assets/sliderpicots.png'
import { AgentLibrary } from "../../services/AgentLibrary";
import { ChatService } from "../../services/ChatService";

export default function FormAgentSettings({agent, memoizedSetModalStatus, setCurrentAgent} : IProps){

    const modelList = useFetchModelsList()

    const [webSearchEconomy, setWebSearchEconomy] = useState(true)

    const baseForm : IFormStructure = {
        agentName: agent ? agent.getName() : "",
        modelName: agent ? agent.getModelName() : modelList[0],
        systemPrompt: agent ? agent.getSystemPrompt().replace(/\t/g,'') : "",
        temperature: agent ? agent.getTemperature() : 0.8,
        maxContextLength: agent ? agent.getContextSize() : 2048,
        maxTokensPerReply: agent ? agent.getNumPredict() : 128,
        webSearchEconomy: false,
    }

    const [formValues, setFormValues] = useState<IFormStructure>(baseForm)

    /*function handleSaveAgent(){
        AgentLibrary.getAgent(formValues.agentName).setSettings({
            modelName : formValues.modelName, 
            systemPrompt : formValues.systemPrompt, 
            context : [], 
            contextSize : formValues.maxContextLength, 
            temperature : formValues.temperature, 
            numPredict : formValues.maxTokensPerReply
        })
    }*/

    /*function handleSwitchAgent(option : IOption){
        ChatService.setActiveAgent(option.value)
        const agent = ChatService.getActiveAgent()
        const newFormValues : IFormStructure = {
            agentName: agent.getName(),
            modelName: agent.getModelName(),
            systemPrompt: agent.getSystemPrompt().replace(/\t/g,''),
            temperature: agent.getTemperature(),
            maxContextLength: agent.getContextSize(),
            maxTokensPerReply: agent.getNumPredict(),
            webSearchEconomy: true,
        }
        setFormValues({...newFormValues})
    }*/

    function handleSwitchModel(option : IOption){
        setFormValues(currentFormValues => ({...currentFormValues, modelName: option.value}))
    }

    function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        memoizedSetModalStatus({visibility : false})
    }

    function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        AgentLibrary.getAgent(formValues.agentName).setSettings({
            modelName : formValues.modelName, 
            systemPrompt : formValues.systemPrompt, 
            context : [], 
            contextSize : formValues.maxContextLength, 
            temperature : formValues.temperature, 
            numPredict : formValues.maxTokensPerReply
        })
        if(setCurrentAgent) setCurrentAgent(ChatService.getActiveAgent())
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
                onChange={(e) => setFormValues(formValues => ({...formValues, agentName : e.currentTarget.value}))}
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
                type="text" 
                className="form-input"
                spellCheck="false"
                value={formValues.temperature}
                onChange={(e) => setFormValues(formValues => ({...formValues, temperature : parseInt(e.target?.value) | 0}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider">
                                <img src={picots} alt="picots" className="sliderPicots"/>
                            </div>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'10px', fontSize:'14px'}}>
                            <span>Temperature</span><span>0.1</span>
                        </div>
                    </div>
                </div>
            </div>
            <div/>
            <div className="inputNSliderContainer">
                <input 
                    aria-labelledby="label-maxTokensPerReply"
                    type="text"
                    className="form-input"
                    spellCheck="false"
                    value={formValues.maxTokensPerReply}
                    onChange={(e) => setFormValues(formValues => ({...formValues, maxTokensPerReply : parseInt(e.target?.value) | 0}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider" style={{marginLeft:'92px'}}>
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
                    type="text"
                    className="form-input"
                    spellCheck="false"
                    value={formValues.maxContextLength}
                    onChange={(e) => setFormValues(formValues => ({...formValues, maxContextLength : parseInt(e.target?.value) | 0}))}
                />
                <div style={{display:'flex', flex: '1 1 100%', height:'100%'}}>
                    <div className="sliderbarContainer">
                        <div className="sliderTrack">
                            <div className="slider" style={{marginLeft:'140px'}}>
                                <img src={picots} alt="picots" className="sliderPicots"/>
                            </div>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', lineHeight:'12px', marginTop:'10px', fontSize:'14px'}}>
                            <span>Context Length</span><span>8192</span>
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
        </form>
    )
}

interface IProps{
    agent? : AIAgent
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
    setCurrentAgent ?: React.Dispatch<React.SetStateAction<AIAgent>>
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