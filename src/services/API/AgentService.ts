/* eslint-disable @typescript-eslint/no-unused-vars */
import IAgentResponse from "../../interfaces/responses/IAgentResponse";
import { AIAgent } from "../../models/AIAgent";

export default class AgentService{

    static async save(agent : AIAgent) : Promise<string | void>{
        try{
            const reponse = await fetch('http://localhost:3000/agent', {
                method : 'POST',
                body : agent.asString(),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) return reponse.text()
            // throw new Error('Error saving agent in DB.')
        }catch(e){
            console.error(e)
        }
    }

    static async updateByName(agentName : string, agent : AIAgent) : Promise<string | void>{
        try{
            const reponse = await fetch('http://localhost:3000/agent/byName/' + agentName, {
                method : 'PUT',
                body : agent.asString(),
                headers:{ 'Content-Type' : 'application/json' }
            })
            // if(!reponse.ok) throw new Error('Error updating agent in DB.')
            if(!reponse.ok) return reponse.text()
        }catch(e){
            console.error(e)
        }
    }

    static async updateById(agent : AIAgent) : Promise<string | void>{
        try{
            const reponse = await fetch('http://localhost:3000/agent/byId/' + agent.getId(), {
                method : 'PUT',
                body : agent.asString(),
                headers:{ 'Content-Type' : 'application/json' }
            })
            // if(!reponse.ok) throw new Error('Error updating agent in DB.')
            if(!reponse.ok) return reponse.text()
        }catch(e){
            console.error(e)
        }
    }

    static async getAll(): Promise<IAgentResponse[] | undefined>{
        try {
            const response = await fetch("http://127.0.0.1:3000/agents", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching agents list : ", error)
            return undefined
        }
    }

    static async getAgentsNameList() : Promise<string[]> {
        const allAgents = await this.getAll()
        return allAgents?.map(agent => agent.name) || []        
    }

    static async getAgentByName(name : string): Promise<IAgentResponse | undefined>{
        try {
            const response = await fetch("http://127.0.0.1:3000/agent/byName/" + name, {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching agents list : ", error)
            return undefined
        }
    }

    static async deleteAgent(name : string): Promise<void>{
        try{
            const response = await fetch("http://127.0.0.1:3000/agent/byName/" + name, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }catch(e){
            console.error(e)
        }
    }
}