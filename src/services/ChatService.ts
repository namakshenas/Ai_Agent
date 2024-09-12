/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIModel } from "../models/AIModel";
import AnswerFormatingService from "./AnswerFormatingService";
import PromptLibrary from "./PromptLibrary";
export class ChatService{

    /*static modelList = new Map<string, AIModel>()*/

    static regexRepository = new Map<string, string>().set("incomplete code block", "/<code>.*$/").set("complete code block", "/<code>.*?</code>/")

    static #completionModel = new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).setContextSize(8000)
        .setSystemPrompt(PromptLibrary.getPrompt("completionAssistant"))

    static #baseModel = new AIModel({modelName : /*"llama3.1:8b"*/"mistral-nemo:latest"}).setTemperature(0.3).setContextSize(8000).setSystemPrompt("You are an helpful assistant.")
    static #baseModelStreaming = new AIModel({modelName : /*"llama3.1:8b"*/"mistral-nemo:latest"}).setTemperature(0.1).setContextSize(8000)
    .setSystemPrompt(PromptLibrary.getPrompt("HelpfulAssistant")).enableStreaming()
  
    /**
     * Asks a question to the AI model and returns the context and response.
     *
     * @param {string} question The question to ask the AI model.
     * @param {number[]} [context=[]] An optional array of numbers that serves as context for the question.
     * @returns {Promise<{context: number[], response: string}>} A promise resolving to an object with the context and response from the AI model.
     */
    static async askTheActiveModel(question : string, context:number[] = []) : Promise<{context : number[], response : string}>
    {
        // console.log('question : '+ question)
        this.#baseModel.setContext(context)
        const answer = await this.#baseModel.ask(question)
        return {context : answer.context as number[], response : answer.response}
    }

    /**
     * Asks a question to the AI model and returns a ReadableStream of responses.
     *
     * @param {string} question The question to ask the AI model.
     * @param {number[]} [context=[]] An optional array of numbers that serves as context for the question.
     * @returns {Promise<ReadableStreamDefaultReader<Uint8Array>>} A promise resolving to a ReadableStream of responses from the AI model.
     */
    static async askTheActiveModelForAStreamedResponse(question : string, displayCallback : (toDisplay : string/*string*/) => void, context:number[] = []) : Promise<number[]>  /*Promise<ReadableStreamDefaultReader<Uint8Array>>*/
    {
        let newContext = []

        /*const model = new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).enableStreaming().setContextSize(8000).setContext(context).setSystemPrompt("You are an helpful assistant.")
        model.setContext(context)
        const reader = await model.askForAStreamedResponse(question)*/
        this.#baseModelStreaming.setContext(context)
        const reader = await this.#baseModelStreaming.askForAStreamedResponse(question)

        let content = ""
        // keep reading the streamed response until the stream is closed
        while(true){
            const { done, value } = await reader.read()
            if (done) {
                break;
            }
            const json = JSON.parse(new TextDecoder().decode(value))

            if(json.done) {
                newContext = json.context || []
                displayCallback(await AnswerFormatingService.format(content))
            }
        
            if (!json.done) {
                content += json.response
                // console.log(content)
                if(json?.context?.length > 0) console.log("falseDone : " + json?.context)
                displayCallback(await AnswerFormatingService.format(content))
            }
        }

        return newContext
    }

    static abortStreaming(){
        this.#baseModelStreaming.abortLastRequest()
    }

    static async askTheActiveModelForAutoComplete(promptToComplete : string, context:number[] = []) : Promise<{context : number[], response : string}>
    {
        // this.#completionModel.abortLastRequest()
        this.#completionModel.setContext(context)
        // setTimeout(() => {}, 2000)
        const answer = (await this.#completionModel.ask(promptToComplete))
        return {context : answer.context as number[], response : answer.response}
    }
}