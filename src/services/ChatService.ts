/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIModel } from "../models/AIModel";
import AnswerFormatingService from "./AnswerFormatingService";
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
        1- Your output should ALWAYS ouput a string of characters transforming the incomplete last sentence into a question.
        2- Your output should NEVER BE AN ANSWER to this incomplete sentence.
        3- Your output should not be non-existent if the last sentence is already a valid question.
        Some examples showing the expected structure for your output:\n\n
        * last sentence example : "Should I buy a" => output : " new car?"
        * last sentence example : "Who is the president " => output : "of the United States?"
        * last sentence example : "What is the capit" => output : "al of France?"
        * last sentence example : "What is the name of Batman?" => output : ""
        !!! ONLY RESPOND WITH THE OUTPUT NOT THE FULL SENTENCE.
        Here follows the given piece of text to produce an output for :\n\n
    `)

    static #baseModel = new AIModel({modelName : /*"llama3.1:8b"*/"mistral-nemo:latest"}).setTemperature(0.3).setContextSize(8000).setSystemPrompt("You are an helpful assistant.")
    static #baseModelStreaming = new AIModel({modelName : /*"llama3.1:8b"*/"mistral-nemo:latest"}).setTemperature(0.1).setContextSize(8000)
    .setSystemPrompt(`You are an helpful assistant. 
        And you MUST follow the 5 following rules when replying to my request : \n
        1- Don't write any programming code if the request topic is not related.\n
        2- Add a new line before a new section or a new paragraph.\n
        3- All the programming code produced should encapsulated within markdown delimiters called triple backticks followed by the programming language used : \`\`\`.\n
        4- DON'T USE <pre> and <code> tags!\n
        5- DON'T USE triple backticks for non-code related text.\n
        Here come my request :\n\n
        `).enableStreaming()

    /*
    `You are an helpful assistant. 
        As such, you must follow those rules at all time : \n
        1- Don't write any programming code if you are not explicitly asked to.\n
        2- Don't forget to add a new line before a new section or a new paragraph.\n
        3- All the programming code produced should encapsulated between pre and code tags. Example :\n
        <pre><code>programming_code_produced</code></pre>\n
        4- The code tag should never have any attribute like language or class!\n
        5- NEVER put any text non code related into the <pre><code> tags.\n
        Here come my request :\n\n
        `
    */
    /*
    `You are an helpful assistant. 
        As such, you must follow those rules at all time : \n
        1- Don't write any programming code if you are not explicitly asked to.\n
        2- Don't forget to add a new line before a new section or a new paragraph.\n
        3- All the programming code produced should START with the following tag : <pre><code>\n 
        4- All the programming code produced should END with the following tag : </code></pre>\n\n
        Exemple in case of programming code needing to be produced :\n
        <pre><code>code_programming_produced</code></pre>
        5- NEVER put any text non code related into the <pre><code> tags.
        Here come my request :\n\n
        `
    */
  
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