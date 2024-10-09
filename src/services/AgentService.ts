/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIAgent } from "../models/AIAgent";
import { AgentLibrary } from "./AgentLibrary";

export default class AgentService{

    static async save(agent : AIAgent){
        try{
            this.localSave(agent)
            this.DBsave(agent)
        }catch(e){
            console.error(e)
        }
    }

    static async update(agent : AIAgent){
        try{
            this.localUpdate(agent)
            this.DBUpdate(agent)
        }catch(e){
            console.error(e)
        }
    }

    static localSave(agent : AIAgent){
        if(AgentLibrary.doesAgentExist(agent.getName())) throw new Error("An agent with this name already exists.")
        AgentLibrary.saveAgent(agent)
    }

    static async DBsave(agent : AIAgent){
        const reponse = await fetch('http://localhost:3000/agent', {
            method : 'POST',
            body : agent.asString(),
            headers:{ 'Content-Type' : 'application/json' }
        })
        if(!reponse.ok) throw new Error('Error saving agent in DB.')
    }

    static localUpdate(agent : AIAgent){
        // AgentLibrary.updateAgent(agent)
        // AgentLibrary.saveAgent(agent)
    }

    static async DBUpdate(agent : AIAgent){
        const agentName = agent.getName()
        const reponse = await fetch('http://localhost:3000/agent/' + agentName, {
            method : 'PUT',
            body : agent.asString(),
            headers:{ 'Content-Type' : 'application/json' }
        })
        if(!reponse.ok) throw new Error('Error updating agent in DB.')
    }
}