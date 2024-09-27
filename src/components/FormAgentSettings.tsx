/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { AIAgent } from "../models/AIAgent";
import Select from "./CustomSelect/Select";
import './FormAgentSettings.css'
import useFetchModelsList from "../hooks/useFetchModelsList";
import IFormStructure from "../interfaces/IAgentFormStructure";

export default function FormAgentSettings({agent} : IProps){

    const modelList = useFetchModelsList()

    /*const emptyForm : IFormStructure = {
        agentName: "",
        modelName: "",
        systemPrompt: "",
        temperature: 0.1,
        maxContextLength: 2048,
        maxTokensPerReply: 0,
        webSearch: false,
    }*/

    const baseForm : IFormStructure = {
        agentName: agent.getName(),
        modelName: agent.getModelName(),
        systemPrompt: agent.getSystemPrompt().replace(/\t/g,''),
        temperature: agent.getTemperature(),
        maxContextLength: agent.getContextSize(),
        maxTokensPerReply: agent.getNumPredict(),
        webSearchEconomy: false,
    }

    const [formValues, setFormValues] = useState<IFormStructure>(baseForm)

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

            <input
                aria-labelledby="label-temperature"
                type="text" 
                className="form-input"
                spellCheck="false"
                value={formValues.temperature}
                onChange={(e) => setFormValues(formValues => ({...formValues, temperature : parseInt(e.target?.value) | 0}))}
            />
            <div/>
            <input 
                aria-labelledby="label-maxTokensPerReply"
                type="text"
                className="form-input"
                spellCheck="false"
                value={formValues.maxTokensPerReply}
                onChange={(e) => setFormValues(formValues => ({...formValues, maxTokensPerReply : parseInt(e.target?.value) | 0}))}
            />

            <label id="label-maxContextLength" className="form-label">Max Context Length</label>
            <div/>
            <label id="label-webSearch" className="form-label">Web Search</label>

            <input
                aria-labelledby="label-maxContextLength" 
                type="text"
                className="form-input"
                spellCheck="false"
                value={formValues.maxContextLength}
                onChange={(e) => setFormValues(formValues => ({...formValues, maxContextLength : parseInt(e.target?.value) | 0}))}
            />
            <div/>
            <span className="form-span">Context Economy | Processing Speed</span>

            <button style={{gridArea:'p'}} className="form-button purpleShadow">Save</button>
        </form>
    )
}

interface IProps{
    agent : AIAgent
}