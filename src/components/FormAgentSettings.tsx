import useFetchModelsList from "../hooks/useFetchModelsList";
import { AIAgent } from "../models/AIAgent";
import Select from "./CustomSelect/Select";
import './FormAgentSettings.css'

export default function FormAgentSettings({agent} : IProps){

    const modelsList = useFetchModelsList()

    return (
        <form className="agent-form">
            <div className="form-row">
            <div className="form-column">
                <label className="form-label">Agent Name</label>
                <input 
                className="form-input" 
                value={agent.getName()}
                />
            </div>
            <div className="form-column">
                <label className="form-label">Model</label>
                <Select 
                width="80%"
                options={modelsList.map((model) => ({ label: model, value: model }))} 
                defaultOption={agent.getModelName()} 
                id="settingsSelectAgent"
                />
            </div>
            </div>
            <div className="form-column full-width">
            <label className="form-label">System Prompt</label>
            <textarea 
                className="form-textarea" 
                rows={12} 
                value={agent.getSystemPrompt().replace(/\t/g,'')}
            ></textarea>
            </div>
            <div className="form-row">
            <div className="form-column">
                <label className="form-label">Temperature</label>
                <input 
                className="form-input" 
                value={agent.getTemperature()}
                />
            </div>
            <div className="form-column">
                <label className="form-label">Max Tokens Per Reply</label>
                <input 
                className="form-input" 
                value={agent.getNumPredict()}
                />
            </div>
            </div>
            <div className="form-row">
            <div className="form-column">
                <label className="form-label">Max Context Length</label>
                <input 
                className="form-input" 
                value={agent.getContextSize()}
                />
            </div>
            <div className="form-column">
                <label className="form-label">Web Search</label>
                <span className="form-span">Context Economy | Processing Speed</span>
            </div>
            </div>
            <div className="form-row justify-right">
                <button className="form-button">Save</button>
            </div>
        </form>
    )
}

interface IProps{
    agent : AIAgent
}