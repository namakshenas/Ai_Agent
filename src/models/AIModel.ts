/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @class AIModel
 * @description A class representing an AI model for generating text and embeddings.
 * @property {string} #modelName - The name of the AI model.
 * @property {boolean} #stream - Whether to stream the response or not.
 * @property {string} #systemPrompt - The system prompt for the AI model.
 * @property {number[]} #context - The context for the AI model.
 * @property {number} #contextSize - The size of the context for the AI model.
 */
export class AIModel{

    #modelName : string
    #systemPrompt : string
    #context : number[]
    #contextSize : number
    #temperature : number
    #numPredict : number
    #abortController = new AbortController()
    #signal = this.#abortController.signal
    // add keep alive!!!!!
    // add format : json

    /**
     * @constructor
     * @param {Object} params - The parameters for the AI model.
     * @param {string} params.modelName - The name of the AI model.
     * @param {string} [params.systemPrompt='You are a helpful assistant.'] - The system prompt for the AI model.
     * @param {number[]} [params.context=[]] - The context for the AI model.
     * @param {number} [params.contextSize=2048] - The size of the context for the AI model.
     * @param {number} [params.temperature=0.8] - The temperature for the AI model.
     */
    constructor({ modelName = "llama3.1:8b", systemPrompt =  'You are a helpful assistant.', context = [], contextSize = 2048, temperature = 0.8, numPredict = 1024 } : IAIModelParams){
        this.#modelName = modelName
        // this.#stream = stream
        this.#systemPrompt = systemPrompt
        this.#context = context
        this.#contextSize = contextSize
        this.#numPredict = numPredict
        this.#temperature = temperature
    }

    /**
     * @async
     * @function ask
     * @param {string} prompt - The prompt for the AI model.
     * @returns {Promise<ICompletionResponse>} The response from the AI model.
     * @description Sends a request to the AI model with the given prompt and returns the response.
     */
    async ask(prompt : string) : Promise<ICompletionResponse> {
        try {
            const response = await fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: this.#buildRequest({prompt, stream : false}),
                signal: this.#signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json()
            
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error("Request was aborted.");
                }
                throw new Error(`Failed to fetch: ${error.message}`);
            }
            throw new Error("An unknown error occurred.");
        }
    }

    async askForAStreamedResponse(prompt : string) : Promise<ReadableStreamDefaultReader<Uint8Array>>{
        try {
            const response = await fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: this.#buildRequest({prompt, stream : true}),
                signal: this.#signal
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error("Failed to read response body.")
            }
            return reader

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error("Request was aborted.");
                }
                throw new Error(`Failed to fetch: ${error.message}`);
            }
            throw new Error("An unknown error occurred.");
        }
    }

    /**
     * @async
     * @function embeddings
     * @param {string} sequence - The sequence for which to generate embeddings.
     * @returns {Promise<IEmbeddingResponse>} The embeddings for the given sequence.
     * @description Sends a request to generate embeddings for the given sequence and returns the embeddings.
     */
    async embeddings(sequence : string) : Promise<IEmbeddingResponse> {
        try {
            const response = await fetch("http://127.0.0.1:11434/api/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: this.#buildEmbeddingRequest(sequence),
                signal: this.#signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json()

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error("Request was aborted.");
                }
                throw new Error(`Failed to fetch: ${error.message}`);
            }
            throw new Error("An unknown error occurred.");
        }
    }

    /**
     * @function setSystemPrompt
     * @param {string} prompt - The new system prompt for the AI model.
     * @description Sets the system prompt for the AI model.
     */
    setSystemPrompt(prompt : string) : this {
        this.#systemPrompt = prompt
        return this
    }

    /**
     * @function setModel
     * @param {string} modelName - The new name of the AI model.
     * @description Sets the name of the AI model.
     */
    setModel(modelName : string) : this {
        this.#modelName = modelName
        return this
    }

    /**
     * @function setContextSize
     * @param {number} value - The new size of the context for the AI model.
     * @description Sets the size of the context for the AI model.
     */
    setContext(context : number[]) : this {
        this.#context = [...context]
        return this
    }

    /**
     * @function setContextSize
     * @param {number} value - The new size of the context for the AI model.
     * @description Sets the size of the context for the AI model.
     */
    setContextSize(value : number) : this {
        if(value < 0) value = 0
        this.#contextSize = value
        return this
    }

    /**
     * @function setTemperature
     * @param {number} value - The new temperature for the AI model.
     * @description Sets the temperature for the AI model.
     */
    setTemperature(value : number) : this {
        if(value > 1) value = 1
        if(value < 0) value = 0
        this.#temperature = value
        return this
    }

    setNumPredict(value : number){
        this.#numPredict = value
    }

    setSettings({ modelName = "llama3.1:8b", systemPrompt =  'You are a helpful assistant.', context = [], contextSize = 2048, temperature = 0.8, numPredict = 1024 } : IAIModelParams){
        this.#modelName = modelName
        this.#systemPrompt = systemPrompt
        this.#context = context
        this.#contextSize = contextSize
        this.#numPredict = numPredict
        this.#temperature = temperature
    }

    /**
     * @private
     * @function #buildRequest
     * @param {string} prompt - The prompt for the AI model.
     * @returns {string} The request body for the AI model.
     * @description Builds the request body for the AI model with the given prompt and other parameters.
     */
    #buildRequest({prompt, stream} : {prompt : string, stream : boolean}) : string {
        const baseRequest : IBaseOllamaRequest = {
            "model": this.#modelName,
            "stream": stream,
            "system": this.#systemPrompt,
            "prompt": prompt,
            "context" : [...this.#context],
        }
        const requestWithOptions = {...baseRequest, 
            "options": { 
                "num_ctx": this.#contextSize,
                "temperature" : this.#temperature, 
                "num_predict" : this.#numPredict 
        }}
        return JSON.stringify(requestWithOptions)
    }

    /**
     * @private
     * @function #buildEmbeddingRequest
     * @param {any} sequence - The sequence for which to generate embeddings.
     * @returns {string} The request body for generating embeddings.
     * @description Builds the request body for generating embeddings for the given sequence.
     */
    #buildEmbeddingRequest (sequence : unknown) : string {
        return JSON.stringify({
            "model": /*"mxbai-embed-large"*/ "nomic-embed-text",
            "prompt": sequence,
            /*"stream": false,*/
        })
    }

    abortLastRequest(){
        this.#abortController.abort("Signal aborted.")
        // need to create a new abort controller and a new signal
        // or subsequent request will be aborted from the get go
        this.#abortController = new AbortController()
        this.#signal = this.#abortController.signal
    }

    getSystemPrompt() : string{
        return this.#systemPrompt
    }

    getTemperature() : number {
        return this.#temperature
    }

    getContextSize() : number {
        return this.#contextSize
    }

    getModelName() : string {
        return this.#modelName
    }

    getNumPredict() : number {
        return this.#numPredict
    }
}

export interface IAIModelParams{
    modelName? : string
    stream? : boolean
    systemPrompt? : string
    context? : number[]
    contextSize? : number
    temperature? : number
    numPredict? : number
}

export interface IBaseOllamaRequest{
    model: string
    stream: boolean
    system: string
    prompt: string
    context : number[]
    options? : unknown
}

export type Embedding = number[]

export interface IEmbeddingResponse {
    embedding : Embedding
}

export interface ICompletionResponse{
    model: string
    created_at: string
    response: string
    done: boolean
    context?: number[]
    total_duration?: number
    load_duration?: number
    prompt_eval_count?: number
    prompt_eval_duration?: number
    eval_count?: number
    eval_duration?: number
}