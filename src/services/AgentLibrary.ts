/* eslint-disable no-unused-private-class-members */
import { AIAgent } from "../models/AIAgent"
import PromptLibrary from "./PromptLibrary"

export class AgentLibrary {

    static #helpfulAssistantAgent = new AIAgent("helpfulAssistant", "mistral-nemo:latest").setTemperature(0.1).setContextSize(14000)
    .setSystemPrompt(PromptLibrary.getPrompt("helpfulAssistantPrompt")?.prompt || "")

    static #COTAgent = new AIAgent("COTGenerator", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("COTGeneratorPrompt")?.prompt || "")

    static #completionAgent = new AIAgent("completionAgent", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("completionAssistantPrompt")?.prompt || "")

    static #searchQueryOptimizer = new AIAgent("searchQueryOptimizer", "llama3.2:3b").setTemperature(0.3).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("searchQueryOptimizerPrompt")?.prompt || "")

    static #scrapedDatasSummarizer = new AIAgent("scrapedDatasSummarizer", "llama3.2:3b").setTemperature(0.3).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("scrapedDatasSummarizerPrompt")?.prompt || "")
    
    static library : ILibrary = {
        'helpfulAssistant': this.#helpfulAssistantAgent,
        'COTGenerator': this.#COTAgent,
        'CompletionAgent': this.#completionAgent,
        'searchQueryOptimizer' : this.#searchQueryOptimizer,
        'scrapedDatasSummarizer' : this.#scrapedDatasSummarizer
    }

    static addAgent(agent: AIAgent) {
        this.library = {...this.library, [agent.getName()] : agent}
        console.log(this.library)
    }

    static saveAgent(agent: AIAgent) {
        this.library[agent.getName()] = agent
    }

    static removeAgent(agentName: string): boolean {
        if (Object.prototype.hasOwnProperty.call(this.library, agentName)) {
            delete this.library[agentName]
            return true;
        }
        return false;
    }

    static updateAgent(agent: AIAgent) {
        this.saveAgent(agent)
    }

    static getAgent(agentName: string): AIAgent {
        return this.library[agentName]
    }

    static removeAllAgents(){
        this.library = {}
    }
    
    static getAgentsNameList(): Array<string> {
        return Object.getOwnPropertyNames(this.library)
    }

    static doesAgentExist(agentName: string): boolean {
        return this.getAgent(agentName) !== undefined
    }
}

interface ILibrary {
    [key: string]: AIAgent;
}