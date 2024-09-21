/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { AIAgent } from "../models/AIAgent";
import Select from "./CustomSelect/Select";
import './FormAgentSettings.css'
import { OllamaService } from "../services/OllamaService";
import useFetchModelsList from "../hooks/useFetchModelsList";

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
        webSearch: false,
    }

    const [formValues, setFormValues] = useState<IFormStructure>(baseForm)

    return (
        <form className="agent-form">

            <label aria-label="agentNameLabel" style={{marginTop:0}} className="form-label">Agent Name</label>
            <div/>
            <label aria-label="modelNameLabel" style={{marginTop:0}} className="form-label">Model</label>

            <input
                aria-labelledby="agentNameLabel"
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
                labelledBy="modelNameLabel" 
                id="settingsSelectAgent"
            />

            <label aria-label="systemPromptLabel" style={{gridArea:'e'}} className="form-label">System Prompt</label>

            <textarea
                aria-labelledby="systemPromptLabel"
                style={{gridArea:'f'}}
                spellCheck="false"
                className="form-textarea" 
                rows={12} 
                value={formValues.systemPrompt}
                onChange={(e) => setFormValues(formValues => ({...formValues, systemPrompt : e.currentTarget.value}))}
            />

            <label aria-label="temperatureLabel" className="form-label">Temperature</label>
            <div/>
            <label aria-label="maxTokensPerReplyLabel" className="form-label">Max Tokens Per Reply</label>

            <input
                aria-labelledby="temperatureLabel" 
                className="form-input"
                spellCheck="false"
                value={formValues.temperature}
                onChange={(e) => setFormValues(formValues => ({...formValues, temperature : parseInt(e.currentTarget.value) | 0}))}
            />
            <div/>
            <input 
                aria-labelledby="maxTokensPerReplyLabel" 
                className="form-input"
                spellCheck="false"
                value={formValues.maxTokensPerReply}
                onChange={(e) => setFormValues(formValues => ({...formValues, maxTokensPerReply : parseInt(e.currentTarget.value) | 0}))}
            />

            <label aria-label="maxContextLengthLabel" className="form-label">Max Context Length</label>
            <div/>
            <label aria-label="webSearchLabel" className="form-label">Web Search</label>

            <input
                aria-labelledby="maxContextLengthLabel" 
                className="form-input"
                spellCheck="false"
                value={formValues.maxContextLength}
                onChange={(e) => setFormValues(formValues => ({...formValues, maxContextLength : parseInt(e.currentTarget.value) | 0}))}
            />
            <div/>
            <span className="form-span">Context Economy | Processing Speed</span>

            <button style={{gridArea:'p'}} className="form-button">Save</button>
        </form>
    )
}

interface IProps{
    agent : AIAgent
}

interface IFormStructure{
    agentName : string
    modelName : string
    systemPrompt : string
    temperature : number
    maxContextLength : number
    webSearch : boolean
    maxTokensPerReply : number
}