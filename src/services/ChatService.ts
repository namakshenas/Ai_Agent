/* eslint-disable no-unused-private-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IConversationElement } from "../interfaces/IConversation";
import { AIAgent } from "../models/AIAgent";
import ScrapedPage from "../models/ScrapedPage";
import { AgentLibrary } from "./AgentLibrary";
import AnswerFormatingService from "./AnswerFormatingService";
export class ChatService{

    static #activeAgentName = "helpfulAssistant"

    static async askForFollowUpQuestions(question : string, context:number[] = []) : Promise<string>
    {
      try{
        if(!AgentLibrary.library["helpfulAssistant"]) throw new Error(`Agent helpfulAssistant is not available`)

        AgentLibrary.library["helpfulAssistant"].setContext(context)
        const answer = await AgentLibrary.library["helpfulAssistant"].ask(question)
        return answer.response
      }catch (error){
        console.error("Failed to generate the follow up questions : " + error)
        throw error
      }
    }

    // askTheActiveAgent({question : string, context : number[], formating : boolean, answerProcessorCallback, websearch : boolean})
    // then redirect to one of the two ask below queryAgent
  
    static async askTheActiveAgent(question : string, context:number[] = [], format : boolean = true) : Promise<IConversationElement>
    {
        if(!AgentLibrary.library[this.#activeAgentName]) throw new Error(`Agent ${this.#activeAgentName} is not available`)

        AgentLibrary.library[this.#activeAgentName].setContext(context)
        try{
          const answer = await AgentLibrary.library[this.#activeAgentName].ask(question)
          const responseAsHTML = await AnswerFormatingService.format(answer.response)
          return {context : [...answer.context as number[]], answer : {asMarkdown : answer.response, asHTML : responseAsHTML}, sources : [], question : question}
        }catch(error){
          console.error("Failed to query the model : " + error)
          throw error
        }
    }

    static async askTheActiveAgentForAStreamedResponse(question : string, chunkProcessorCallback : ({markdown , html} : {markdown : string, html : string}) => void, context:number[] = [], scrapedPages?: ScrapedPage[]) : Promise<number[]>
    {
      if(!AgentLibrary.library[this.#activeAgentName]) throw new Error(`Agent ${this.#activeAgentName} is not available`)

      let newContext = []
      const contextSpaceForScrapedDatas = AgentLibrary.library[this.#activeAgentName].getContextSize() - AgentLibrary.library[this.#activeAgentName].getNumPredict() - 1000

      AgentLibrary.library[this.#activeAgentName].setContext(context)
      // scrapedPages?.forEach(page => console.log("scrapedPageData :" + page.datas))
      const concatenatedWebDatas = scrapedPages ? scrapedPages.reduce((acc, currentPage)=> acc + '\n\n' + currentPage.datas, "When replying to **MY REQUEST**, always use the following datas as your MAIN source of informations especialy if it superseeds your training dataset : ") : ""
      // the agent receive an amount of scraped datas matching the context size available
      const reader = await AgentLibrary.library[this.#activeAgentName].askForAStreamedResponse(concatenatedWebDatas.substring(0, contextSpaceForScrapedDatas) + '\n\n<MYREQUEST>' + question + '</MYREQUEST>')

      let content = ""
      let decod = ""
      try{
          while(true){
              const { value } = await reader.read()

              const decodedValue = new TextDecoder().decode(value).replace('"{"', '"["').replace('"}"', '"]"').replace('"}\\', '"]\\').replace('" }"', '" ]"')
              decod = decodedValue
              // check if the decoded value isn't malformed and fix it
              const splitValues = decodedValue.match(/{"model[^}]*}/g)
              const reconstructedValue = this.#reconstructMalformedValues(splitValues)
              /* memo : decodedValue structure : {"model":"qwen2.5:3b","created_at":"2024-09-29T15:14:02.9781312Z","response":" also","done":false} */
              const json = JSON.parse(reconstructedValue)

              if(json.done) {
                newContext = json.context || []
                chunkProcessorCallback({markdown : content, html : await AnswerFormatingService.format(content)})
                this.abortAgentLastRequest()
                break
              }
          
              if (!json.done) {
                content += json.response
                if(json?.context?.length > 0) console.log("falseDone : " + json?.context)
                chunkProcessorCallback({markdown : content, html : await AnswerFormatingService.format(content)})
              }
          }
      } catch (error : unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Stream aborted.')
          } else {
            console.error('Stream failed : ', error)
            console.error(decod)
            this.abortAgentLastRequest()
          }
          throw error
      }

      return newContext
    }

    // split one malformed block into multiple ones if needed
    static #reconstructMalformedValues(values : string[] | null){
        if(values == null) return JSON.stringify({"model":"","created_at":"","response":" ","done":false})
        if(values.length == 1) return values[0]
        console.log("malformed : " + JSON.stringify(values))
        const reconstructedValue = values.reduce((acc, value) => acc + JSON.parse(value).response, "")
        return JSON.stringify({"model":"","created_at":"","response":reconstructedValue,"done":false})
    }

    static abortAgentLastRequest(){
        AgentLibrary.library[this.#activeAgentName].abortLastRequest()
    }

    static setActiveAgent(name : string){
        if(!AgentLibrary.library[name]) return
        this.#activeAgentName = name
    }

    static getActiveAgentName() : string{
        return this.#activeAgentName
    }

    static getActiveAgent() : AIAgent{
        return AgentLibrary.library[this.#activeAgentName]
    }

    static async askTheActiveAgentForAutoComplete(promptToComplete : string, context:number[] = []) : Promise<{context : number[], response : string}>
    {
        try{
          if(!AgentLibrary.library['CompletionAgent']) throw new Error(`CompletionAgent is not available`)
          AgentLibrary.library['CompletionAgent'].setContext(context)
          const answer = (await AgentLibrary.library['CompletionAgent'].ask(promptToComplete))
          return {context : answer.context as number[], response : answer.response}
        }catch(error){
          console.error("Failed to complete the question : " + error)
          throw error
        }
    }
}

/*

async function streamWithRetry(url, maxRetries = 3) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let retryCount = 0;

  async function readChunk() {
    try {
      const { value, done } = await reader.read();
      
      if (done) {
        return null;
      }

      const decodedValue = decoder.decode(value);
      
      // Process the decoded value here
      console.log("Received chunk:", decodedValue);

      return decodedValue;
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying... Attempt ${retryCount}`);
        return readChunk(); // Retry reading the chunk
      } else {
        throw new Error("Max retries reached");
      }
    }
  }

  while (true) {
    const chunk = await readChunk();
    if (chunk === null) break;
    // You can implement additional logic here to decide 
    // if you want to regenerate the current chunk
  }
}

// Usage
streamWithRetry('https://api.example.com/stream')
  .catch(error => console.error("Streaming error:", error));

  */

  /*

  async function controlledFetch(url) {
    const response = await fetch(url);
    const reader = response.body.getReader();

    async function* readChunks() {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield value; // Yield each chunk one at a time
        }
    }

    for await (const chunk of readChunks()) {
        // Process each chunk here
        console.log(chunk);
        // Optionally add delay or processing logic to control flow
    }
}

controlledFetch('http://example.com/data');
  */