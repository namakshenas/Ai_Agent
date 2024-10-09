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

    static async askTheActiveAgentForAStreamedResponse(question : string, showErrorModal: (message : string) => void, chunkProcessorCallback : ({markdown , html} : {markdown : string, html : string}) => void, context:number[] = [], scrapedPages?: ScrapedPage[]) : Promise<number[]>
    {
      if(!AgentLibrary.library[this.#activeAgentName]) throw new Error(`Agent ${this.#activeAgentName} is not available`)

      let newContext = []

      AgentLibrary.library[this.#activeAgentName].setContext(context)
      // scrapedPages?.forEach(page => console.log("scrapedPageData :" + page.datas))
      const concatenatedWebDatas = scrapedPages ? scrapedPages.reduce((acc, currentPage)=> acc + '\n\n' + currentPage.datas, "When replying to **MY REQUEST**, always use the following datas as your MAIN source of informations especialy if it superseeds your training dataset : ") : ""
      const availableContextForWebDatas = AgentLibrary.library[this.#activeAgentName].getContextSize() - AgentLibrary.library[this.#activeAgentName].getNumPredict() - 1000
      const webDatasSizedForAvailableContext = concatenatedWebDatas.substring(0, availableContextForWebDatas)
      // the agent receive an amount of scraped datas matching the context size available

      let content = ""
      let decod = ""
      try{
          const reader = await AgentLibrary.library[this.#activeAgentName].askForAStreamedResponse(webDatasSizedForAvailableContext + '\n\n<MYREQUEST>' + question + '</MYREQUEST>')

          while(true){
              const { value } = await reader.read()

              const decodedValue = new TextDecoder().decode(value)
              decod = decodedValue
              // check if the decoded value isn't malformed -> fix it if it is
              const reconstructedValue = this.#reconstructMalformedValues(decodedValue)
              /* memo : decodedValue structure : {"model":"qwen2.5:3b","created_at":"2024-09-29T15:14:02.9781312Z","response":" also","done":false} */
              console.log(reconstructedValue)
              const json = JSON.parse(reconstructedValue)

              if(json.done) {
                newContext = json.context || []
                content += json.response
                chunkProcessorCallback({markdown : content, html : await AnswerFormatingService.format(content)})
                break
              }
          
              if (!json.done) {
                content += json.response
                // if(json?.context?.length > 0) console.log("falseDone : " + json?.context)
                chunkProcessorCallback({markdown : content, html : await AnswerFormatingService.format(content)})
              }
          }
          this.abortAgentLastRequest()
      } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Stream aborted.')
          } else {
            showErrorModal("Stream failed : " + error)
            console.error('Stream failed : ', error)
            console.error(decod)
            this.abortAgentLastRequest()
          }
          throw error
      }

      return newContext // !!!! add datas
    }

    // write three functions in javascript for a tetris game
    // split one malformed block into multiple ones if needed
    static #reconstructMalformedValues(value : string | null) : string{
      try{
        console.log("untouchedValue : " + value)
        if(value == null) return JSON.stringify({"model":"","created_at":"","response":" ","done":false})
        const splitValues = value.split("}\n{")
        if(splitValues.length == 1) return value.trim()
         // !!! should be true?
        const bracedValues = splitValues.map(value => {
          let trimmedValue = value.trim()
          if(!trimmedValue.startsWith("{")) trimmedValue = "{" + trimmedValue
          if(!trimmedValue.endsWith("}")) trimmedValue = trimmedValue + "}"
          return trimmedValue
        })
        const reconstructedValue = bracedValues.reduce((acc, value) => acc + JSON.parse(value).response, "")
        // if one of the malformed chunk is the {..., done : true } chunk
        // then the reconstructed chunk becomes a {..., done : true } chunk itself
        const isDone = bracedValues.reduce((acc, value) => acc || JSON.parse(value).done, false)
        const aggregatedChunk = {...JSON.parse(bracedValues[bracedValues.length-1])}
        aggregatedChunk.response = reconstructedValue
        aggregatedChunk.done = isDone
        console.log("reformed : " + JSON.stringify(aggregatedChunk))
        return JSON.stringify(aggregatedChunk)
      } catch (error) {
        this.abortAgentLastRequest()
        console.error(`Can't reconstruct these values : ` + JSON.stringify(value))
        throw error
      }
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