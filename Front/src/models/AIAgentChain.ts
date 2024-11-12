/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAIModelParams } from "../interfaces/params/IAIModelParams";
import { AIAgent } from "./AIAgent";

// chain of responsability design pattern
export default class AIAgentChain{

    static baseAgent : AIAgent = new AIAgent({id : 'a0000000001',
        name: "baseAssistant",
        modelName : "llama3.2:3b",
        systemPrompt : "You are an helpful assistant",
        mirostat: 0,
        mirostat_eta: 0.1,
        mirostat_tau: 5.0,
        num_ctx: 2048,
        repeat_last_n: 64,
        repeat_penalty: 1.1,
        temperature: 0.1,
        seed: 0,
        stop: "AI assistant:",
        tfs_z: 1,
        num_predict: 1024,
        top_k: 40,
        top_p: 0.9,
        type : "system",
        favorite : false
    })

    static baseAgentParameters : IAIModelParams & { id : string, name : string, type : "system" | "user_created", favorite : boolean, webSearchEconomy? : boolean } = {id : 'a0000000001',
        name: "baseAssistant",
        modelName : "llama3.2:3b",
        systemPrompt : "You are an helpful assistant",
        mirostat: 0,
        mirostat_eta: 0.1,
        mirostat_tau: 5.0,
        num_ctx: 2048,
        repeat_last_n: 64,
        repeat_penalty: 1.1,
        temperature: 0.1,
        seed: 0,
        stop: "AI assistant:",
        tfs_z: 1,
        num_predict: 1024,
        top_k: 40,
        top_p: 0.9,
        type : "system",
        favorite : false
    }

    private static agents: AIAgent[] = [
        new AIAgent(this.baseAgentParameters),
        new AIAgent({...this.baseAgentParameters, systemPrompt : "You are an expert who converts any given data into a table"}),
        new AIAgent({...this.baseAgentParameters, systemPrompt : "You are an expert who converts any given table into a poem using each table row"})
    ];

    /*static deleteAgent(index  : number){
        this.agents = [...this.agents.slice(0, index), ...this.agents.slice(index + 1)]
    }*/

    static updateAgentsList(agents : AIAgent[]){
        this.agents = agents;
    }

    static getAgentsList() : AIAgent[]{
        return this.agents;
    }

    static getLastAgent() : AIAgent{
        return this.agents[this.agents.length - 1]
    }

    static async process(query : string) : Promise<string>{
        console.log("starting chain process")
        this.buildLinks()
        const result = await this.agents[0].update(query)
        // console.log(result)
        return result
    }

    static buildLinks(){
        if(this.agents.length == 0) return
        this.agents.forEach((agent, index)=>{
            if (index < this.agents.length -1){
                agent.addObserver(this.agents[index + 1])
            }  
        })
    }
}