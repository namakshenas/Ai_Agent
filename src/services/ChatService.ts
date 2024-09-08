import { AIModel } from "../models/AIModel";

export class ChatService{
    
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
        const model = new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).setContextSize(8000).setContext(context).setSystemPrompt("You are an helpful assistant.")
        const answer = (await model.ask(question))
        return {context : answer.context as number[], response : answer.response}
    }

    /**
     * Asks a question to the AI model and returns a ReadableStream of responses.
     *
     * @param {string} question The question to ask the AI model.
     * @param {number[]} [context=[]] An optional array of numbers that serves as context for the question.
     * @returns {Promise<ReadableStreamDefaultReader<Uint8Array>>} A promise resolving to a ReadableStream of responses from the AI model.
     */
    static async askTheActiveModelForAStreamedResponse(question : string, displayCallback : (toDisplay : string) => void, context:number[] = []) : Promise<number[]>  /*Promise<ReadableStreamDefaultReader<Uint8Array>>*/
    {
        let newContext = []

        console.log('question : '+ question)
        const model = new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).enableStreaming().setContextSize(8000).setContext(context).setSystemPrompt("You are an helpful assistant.")
        const reader = await model.askForAStreamedResponse(question)
        let content = ""
        // keep reading the streamed response until the stream is closed
        while(true){
            const { done, value } = await reader.read()
            if (done) {
                break;
            }
            const json = JSON.parse(new TextDecoder().decode(value))

            if(json.done && json?.context) newContext = json.context
        
            if (!json.done) {
                content += json.response
                if(json?.context?.length > 0) console.log("falsedone : " + json?.context)
                displayCallback(content)
            }
        }

        return newContext
    }

    static async askTheActiveModelForAutoComplete(promptToComplete : string, context:number[] = []) : Promise<{context : number[], response : string}>
    {
        const model = new AIModel({modelName : "llama3.1:8b"}).setTemperature(0.1).setContextSize(8000).setContext(context)
        .setSystemPrompt(`You are specialized in questions auto-completion.
        As such, your role is to produce an output completing the last sentence of a given piece of text. 
        Your output should always be a string of characters transforming the incomplete last sentence into a question.
        Your output should NEVER BE AN ANSWER to this incomplete sentence.
        If the last sentence is already a valid question then you should reply with an empty string.
        Here is some examples showing you have to behave:\n\n
        * last sentence example : "Should I buy a" => output : " new car?"
        * last sentence example : "Who is the president " => output : "of the United States?"
        * last sentence example : "What is the capit" => output : "al of France?"
        * last sentence example : "What is the name of Batman?" => output : ""
        !!! ONLY RESPOND WITH THE OUTPUT NOT THE FULL SENTENCE.
        Here follows the given piece of text to produce an output for :\n\n
        `)
        const answer = (await model.ask(promptToComplete))
        return {context : answer.context as number[], response : answer.response}
    }
}