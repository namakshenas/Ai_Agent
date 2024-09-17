/* eslint-disable no-unused-private-class-members */
import { AIAgent } from "../models/AIAgent"
import PromptLibrary from "./PromptLibrary"

export class AgentLibrary {

    static #helpfulAssistantAgent = new AIAgent("helpfulAssistant", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("helpfulAssistantPrompt"))

    static #COTAgent = new AIAgent("COTGenerator", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("COTGeneratorPrompt"))

    static #completionAgent = new AIAgent("completionAgent", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("completionAssistantPrompt"))
    
    static library : ILibrary = {
        'helpfulAssistant': AgentLibrary.#helpfulAssistantAgent,
        'COTGenerator': AgentLibrary.#COTAgent,
        'CompletionAgent': AgentLibrary.#completionAgent,
    }

    static addAgent(agent: AIAgent) {
        this.library = {...this.library, [agent.getName()] : agent}
    }

    static removeAgent(agentName: string): boolean {
        if (Object.prototype.hasOwnProperty.call(this.library, agentName)) {
            delete this.library[agentName]
            return true;
        }
        return false;
    }

    static removeAllAgents(){
        this.library = {}
    }
    
    static getAgentsNameList(): Array<string> {
        return Object.getOwnPropertyNames(this.library)
    }
}

interface ILibrary {
    [key: string]: AIAgent;
}