/* eslint-disable @typescript-eslint/no-unused-vars */
import { marked } from "marked";
import { AIModel } from "../models/AIModel";
import hljs from 'highlight.js';
export class ChatService{

    /*static modelList = new Map<string, AIModel>()
   
    static init(){
        this.modelList.set("helpfulAssistant", new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).setContextSize(8000).setSystemPrompt("You are an helpful assistant."))
    }*/

    static regexRepository = new Map<string, string>().set("incomplete code block", "/<code>.*$/").set("complete code block", "/<code>.*?</code>/")

    static #completionModel = new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).setContextSize(8000)
        .setSystemPrompt(`You act like a search engine specialized in questions auto-completion.
        As such, your role is to produce complete the last sentence of a given piece of text. 
        Meaning : 
        -Your output should ALWAYS ouput a string of characters transforming the incomplete last sentence into a question.
        -Your output should NEVER BE AN ANSWER to this incomplete sentence.
        -Your output should not be if the last sentence is already a valid question.
        Here is some examples showing you have to structure your output:\n\n
        * last sentence example : "Should I buy a" => output : " new car?"
        * last sentence example : "Who is the president " => output : "of the United States?"
        * last sentence example : "What is the capit" => output : "al of France?"
        * last sentence example : "What is the name of Batman?" => output : ""
        !!! ONLY RESPOND WITH THE OUTPUT NOT THE FULL SENTENCE.
        Here follows the given piece of text to produce an output for :\n\n
    `)

    static #baseModel = new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).setContextSize(8000).setSystemPrompt("You are an helpful assistant.")
    static #baseModelStreaming = new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).setContextSize(8000).setSystemPrompt(`You are an helpful assistant. 
        As such, you must follow those rules at all time : \n
        1- Don't write any code if you are not explicitly asked to.\n
        2- Don't forget to add a new line before a new section or a new paragraph.\n
        3- All the code produced should START with the following tag : <pre><code>\n 
        4- All the code produced should END with the following tag : </code></pre>\n\n
        Exemple :\n
        <pre><code>code_produced</code></pre>
        Here come my request :\n\n
        `).enableStreaming()
  
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
                displayCallback(await marked(this.codetransformer(content)))
            }
        
            if (!json.done) {
                content += json.response
                // console.log(content)
                if(json?.context?.length > 0) console.log("falseDone : " + json?.context)
                displayCallback(await marked(this.codetransformer(content)))
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

    static codetransformer(text : string) : string{
        // [\s\S] includes new lines
        // put a complete code block into a dedicated code container
        let transformedText = text.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, codeContent) => {
            /*
            // text highlighting
            return `<div class="codeBlock">
            <div class="title">Code<span style="margin-left:auto; padding-right:0.5rem">Javascript</span></div>
            <div class="body">${hljs.highlightAuto(codeContent).value}</div>
            </div>`})*/
            return `<div class="codeBlock">
                        <div class="title">Code<span style="margin-left:auto; padding-right:0.5rem">Javascript</span></div>
                        <div class="body">${codeContent.replace(/</g, '&lt;').replace(/</g, '&gt;')}</div>
                    </div>`})
        // put an incomplete code block into a dedicated code container
        transformedText = transformedText.replace(/<pre><code([\s\S]*?)(?!<\/code><\/pre>)$/, (match, codeContent) => {
            return `<div class="codeBlock">
                        <div class="title">Code<span style="margin-left:auto; padding-right:0.5rem">Javascript</span></div>
                        <div class="body">${codeContent.replace(/^>/, '').replace(/</g, '&lt;').replace(/</g, '&gt;')}</div>
                    </div>`})
        return transformedText  
    }
}