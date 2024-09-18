/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-private-class-members */
import { AIModel } from "./AIModel.js"

export class AIAgent extends AIModel {

    #name: string
    #processFn : (request : any) => any = (request : string) => request
    protected nextAgent: AIAgent | null = null

    models = ["mistral-nemo:latest", "phi3.5", "llama3", "llama3.1:8b", "dolphin-llama3:8b-256k", "phi3:3.8-mini-128k-instruct-q4_K_M", "qwen2", "qwen2:1.5b", "qwen2:0.5b", "gemma2:9b"]

    defaultModel = "llama3.1:8b"

    constructor(name : string, model : string = "llama3.1:8b"){
        super({modelName : model})
        this.#name = name
    }

    setName(name : string) : void {
        this.#name = name
    }

    getName() : string{
        return this.#name
    }

    setNextAgent(agent: AIAgent): AIAgent {
        this.nextAgent = agent
        return agent
    }

    getNextAgent(): AIAgent | null {
        return this.nextAgent
    }

    setProcessFn(fn : (params : unknown) => unknown){
        this.#processFn = fn
    }
    
    async process(request: string): Promise<string>{
        // should contain all the pre and post inference related to this agent
        this.#processFn(request)
        return this.passToNext((await this.ask(request)).response) // !!! should pass context too with response
    }

    protected async passToNext(response: string): Promise<string> {
        if (this.nextAgent) {
            return await this.nextAgent.process(response)
        }
        return response // if there is not next agent, this is the final reply
    }

    //setOutputSchema
}

// should be able to link a control agent

export interface IAIAgentParams{
    name : string
    model : AIModel
}

/*
Agent Attributes
Attribute	Description
Role	Defines the agent's function within the crew. It determines the kind of tasks the agent is best suited for.
Goal	The individual objective that the agent aims to achieve. It guides the agent's decision-making process.
Backstory	Provides context to the agent's role and goal, enriching the interaction and collaboration dynamics.
LLM (optional)	Represents the language model that will run the agent. It dynamically fetches the model name from the OPENAI_MODEL_NAME environment variable, defaulting to "gpt-4" if not specified.
Tools (optional)	Set of capabilities or functions that the agent can use to perform tasks. Expected to be instances of custom classes compatible with the agent's execution environment. Tools are initialized with a default value of an empty list.
Function Calling LLM (optional)	Specifies the language model that will handle the tool calling for this agent, overriding the crew function calling LLM if passed. Default is None.
Max Iter (optional)	The maximum number of iterations the agent can perform before being forced to give its best answer. Default is 25.
Max RPM (optional)	The maximum number of requests per minute the agent can perform to avoid rate limits. It's optional and can be left unspecified, with a default value of None.
max_execution_time (optional)	Maximum execution time for an agent to execute a task It's optional and can be left unspecified, with a default value of None, menaning no max execution time
Verbose (optional)	Setting this to True configures the internal logger to provide detailed execution logs, aiding in debugging and monitoring. Default is False.
Allow Delegation (optional)	Agents can delegate tasks or questions to one another, ensuring that each task is handled by the most suitable agent. Default is True.
Step Callback (optional)	A function that is called after each step of the agent. This can be used to log the agent's actions or to perform other operations. It will overwrite the crew step_callback.
Cache (optional)	Indicates if the agent should use a cache for tool usage. Default is True.
*/