import { AIAgent } from "../models/AIAgent"

export class AgentLibraryService {
    static #agentsLibrary = new Map()

    /*constructor() { 
        this.addAgent(new AIAgent('HelpfulAssistantAgent'))
    }*/

    static addAgent(agent: AIAgent) {
        this.#agentsLibrary.set(agent.name, agent)
    }

    static removeAgent(agentName: string): boolean {
        return this.#agentsLibrary.delete(agentName)
    }
    
    static getAgentsNameList(): Array<string> {
        return [...this.#agentsLibrary.keys()]
    }
}