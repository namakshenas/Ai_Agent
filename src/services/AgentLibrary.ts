import { AIAgent } from "../models/AIAgent"
import PromptLibrary from "./PromptLibrary"

export class AgentLibrary {
    /*.set('helpfulAssistant', new AIAgent("helpfulAssistant"))
    .set('autocompleteAssistant', new AIAgent("autocompleteAssistant").setSystemPrompt(
        `You are an auto-complete bot.
        As such, your only role is to generate the text needed to complete the last sentence of a given piece of text.
        Don't add any annotations, comments, marking or delimiters.
        Just reply with the string needed to complete the piece of text.
        Here comes the piece of text :\n\n
        `
    ))*/

    static #helpfulAssistantAgent = new AIAgent("helpfulAssistant", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("helpfulAssistantPrompt"))

    static #COTAgent = new AIAgent("COTGenerator", "mistral-nemo:latest").setTemperature(0.1).setContextSize(8192)
    .setSystemPrompt(PromptLibrary.getPrompt("COTGeneratorPrompt"))
    
    /*static library = {
        'helpfulAssistant' : this.#helpfulAssistantAgent,
        'COTGenerator': this.#COTAgent
    }*/

    // static library = new Map().set('helpfulAssistant', this.helpfulAssistantAgent).set('COTGenerator', this.COTAgent)

    static library : ILibrary = {
        'helpfulAssistant': AgentLibrary.#helpfulAssistantAgent,
        'COTGenerator': AgentLibrary.#COTAgent
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