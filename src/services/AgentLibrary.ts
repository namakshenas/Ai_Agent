/* eslint-disable no-unused-private-class-members */
import { AIAgent } from "../models/AIAgent"
import PromptLibrary from "./PromptLibrary"

export class AgentLibrary {

    static #helpfulAssistantAgent = new AIAgent("helpfulAssistant", "mistral-nemo:latest").setTemperature(0.1).setContextSize(16384)
    .setSystemPrompt(PromptLibrary.helpfulAssistantPrompt)

    static #COTAgent = new AIAgent("COTGenerator", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.COTGeneratorPrompt)

    static #completionAgent = new AIAgent("completionAgent", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.completionAssistantPrompt)

    static #searchQueryOptimizer = new AIAgent("searchQueryOptimizer", "mistral-nemo:latest").setTemperature(0.3).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.searchQueryOptimizerPrompt)

    static #scrapedDatasSummarizer = new AIAgent("scrapedDatasSummarizer", "mistral-nemo:latest").setTemperature(0.3).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.scrapedDatasSummarizerPrompt)
    
    static library : ILibrary = {
        'helpfulAssistant': this.#helpfulAssistantAgent,
        'COTGenerator': this.#COTAgent,
        'CompletionAgent': this.#completionAgent,
        'searchQueryOptimizer' : this.#searchQueryOptimizer,
        'scrapedDatasSummarizer' : this.#scrapedDatasSummarizer
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