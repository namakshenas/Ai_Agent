/* eslint-disable no-unused-private-class-members */
import { AIAgent } from "../models/AIAgent"

export class AgentLibrary {

    static library : AIAgent[] = []

    static addAgent(agent: AIAgent){
        this.library.push(agent)
    }

    static addAgents(agents: AIAgent[]){
        this.removeAllAgents()
        agents.forEach(agent => this.addAgent(agent));
    }

    static getAgentsNameList(): Array<string> {
        return this.library.map((agent) => agent.getName())
    }

    static removeAllAgents(){
        this.library = []
    }

    static removeAgent(agentName: string){
        this.library = this.library.filter((agent) => !(agentName == agent.getName()))
    }

    static updateAgent(updatedAgent: AIAgent){
        const targetIndex = this.library.findIndex((agent) => updatedAgent.getId() == agent.getId())
        this.library[targetIndex] = updatedAgent
    }

    static doesAgentExist(agentName: string): boolean {
        return this.library.filter(agent => agentName == agent.getName()).length > 0
    }

    static getAgent(agentName: string){
        return this.library.find((agent) => agentName == agent.getName())
    }

    // will be replaced by the backend
    static generatePlaceholderId(): string {
        const maxId = Math.max(...(this.library.map(agent => {
            console.log(agent.getId());
            return parseInt(agent.getId().slice(1))
        })))
        const newID = (maxId + 1).toString()
        const nZerosNeeded = 10 - newID.length
        console.log("new : " + "a" + '0'.repeat(nZerosNeeded) + newID)
        return "a" + '0'.repeat(nZerosNeeded) + newID
    }
}