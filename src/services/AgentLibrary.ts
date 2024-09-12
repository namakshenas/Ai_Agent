import { AIAgent } from "../models/AIAgent"

export class AgentLibrary {
    static #agentsLibrary = new Map()
    /*.set('helpfulAssistant', new AIAgent("helpfulAssistant"))
    .set('autocompleteAssistant', new AIAgent("autocompleteAssistant").setSystemPrompt(
        `You are an auto-complete bot.
        As such, your only role is to generate the text needed to complete the last sentence of a given piece of text.
        Don't add any annotations, comments, marking or delimiters.
        Just reply with the string needed to complete the piece of text.
        Here comes the piece of text :\n\n
        `
    ))*/

    static addAgent(agent: AIAgent) {
        this.#agentsLibrary.set(agent.name, agent)
    }

    static removeAgent(agentName: string): boolean {
        return this.#agentsLibrary.delete(agentName)
    }

    static removeAllAgents(){
        this.#agentsLibrary = new Map()
    }
    
    static getAgentsNameList(): Array<string> {
        return [...this.#agentsLibrary.keys()]
    }
}