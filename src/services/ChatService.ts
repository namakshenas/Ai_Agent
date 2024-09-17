/* eslint-disable no-unused-private-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import IScrapedPages from "../interfaces/IScrapedPages";
import { AgentLibrary } from "./AgentLibrary";
import AnswerFormatingService from "./AnswerFormatingService";
export class ChatService{

    static #activeAgentName = "helpfulAssistant"
  
    /**
     * Asks a question to the AI model and returns the context and response.
     *
     * @param {string} question The question to ask the AI model.
     * @param {number[]} [context=[]] An optional array of numbers that serves as context for the question.
     * @returns {Promise<{context: number[], response: string}>} A promise resolving to an object with the context and response from the AI model.
     */
    static async askTheActiveAgent(question : string, context:number[] = []) : Promise<{context : number[], response : string}>
    {
        if(!AgentLibrary.library[this.#activeAgentName]) throw new Error(`Agent ${this.#activeAgentName} is not available`)
        AgentLibrary.library[this.#activeAgentName].setContext(context)
        const answer = await AgentLibrary.library[this.#activeAgentName].ask(question)
        return {context : answer.context as number[], response : answer.response}
    }

    /**
     * Asks a question to the AI model and returns a ReadableStream of responses.
     *
     * @param {string} question The question to ask the AI model.
     * @param {number[]} [context=[]] An optional array of numbers that serves as context for the question.
     * @returns {Promise<ReadableStreamDefaultReader<Uint8Array>>} A promise resolving to a ReadableStream of responses from the AI model.
     */
    static async askTheActiveAgentForAStreamedResponse(question : string, answerProcessorCallback : (toProcessAsMarkdown : string, toProcessAsHTML : string) => void, context:number[] = [], scrapedPages?: IScrapedPages[]) : Promise<number[]>
    {
        let newContext = [];

        if(!AgentLibrary.library[this.#activeAgentName]) throw new Error(`Agent ${this.#activeAgentName} is not available`)
        AgentLibrary.library[this.#activeAgentName].setContext(context)
        const concatenatedWebDatas = scrapedPages ? scrapedPages.reduce((acc, curr)=> acc + '\n\n' + curr.datas, "Use the following datas as your prioritary source of information when replying to **MY REQUEST** :") : ""
        const reader = await AgentLibrary.library[this.#activeAgentName].askForAStreamedResponse(concatenatedWebDatas + '\n\n<MYREQUEST>' + question + '</MYREQUEST>')

        let content = ""
        // keep reading the streamed response until the stream is closed
        try{
            while(true){
                const { value } = await reader.read()

                const json = JSON.parse(new TextDecoder().decode(value))

                if(json.done) {
                    console.log("done")
                    newContext = json.context || []
                    answerProcessorCallback(content /*markdown*/, await AnswerFormatingService.format(content) /*html*/)
                    break;
                }
            
                if (!json.done) {
                    content += json.response
                    if(json?.context?.length > 0) console.log("falseDone : " + json?.context)
                    answerProcessorCallback(content, await AnswerFormatingService.format(content))
                }
            }
        } catch (error : unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
              console.log('Stream aborted.');
            } else {
              console.error('Stream error : ', error);
            }
        }

        return newContext
    }

    static abortStreaming(){
        AgentLibrary.library["helpfulAssistant"].abortLastRequest()
    }

    static setActiveAgent(name : string){
        if(!AgentLibrary.library[name]) return
        this.#activeAgentName = name
        console.log(this.#activeAgentName)
    }

    static async askTheActiveAgentForAutoComplete(promptToComplete : string, context:number[] = []) : Promise<{context : number[], response : string}>
    {
        // !!! replace with completion agent
        if(!AgentLibrary.library[this.#activeAgentName]) throw new Error(`Agent ${this.#activeAgentName} is not available`)
        AgentLibrary.library[this.#activeAgentName].setContext(context)
        const answer = (await AgentLibrary.library[this.#activeAgentName].ask(promptToComplete))
        return {context : answer.context as number[], response : answer.response}
    }
}