/* eslint-disable no-useless-escape */
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
              //.replace('"{"', '"["').replace('"}"', '"]"').replace('"}\\', '"]\\').replace('" }"', '" ]"').replace('"}$"', '"]$"')
              decod = decodedValue
              // check if the decoded value isn't malformed and fix it if it is
              // const splitValues = decodedValue.match(/{"model[^}]*}/g)
              const reconstructedValue = this.#reconstructMalformedValues(decodedValue)
              /* memo : decodedValue structure : {"model":"qwen2.5:3b","created_at":"2024-09-29T15:14:02.9781312Z","response":" also","done":false} */
              console.log(reconstructedValue)
              // {"model":"mistral-nemo:latest","created_at":"2024-10-06T03:10:02.5907059Z","response":" }
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
            console.error('Stream failed : ', error)
            console.error(decod)
            this.abortAgentLastRequest()
          }
          throw error
      }

      return newContext
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
        console.error(`Can't reconstruct these values : ` + JSON.stringify(value))
        throw error
      }
        //return JSON.stringify({"model":"","created_at":"","response":reconstructedValue,"done":isDone})
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
keep as ref :

malformed : ["{\"model\":\"mistral-nemo:latest\",\"created_at\":\"2024-10-05T16:33:48.7492932Z\",
\"response\":\".\",\"done\":false}",
"{\"model\":\"mistral-nemo:latest\",\"created_at\":\"2024-10-05T16:33:48.7747315Z\",
\"response\":\"\",\"done\":true,\"done_reason\":\"stop\", \"context\":[],
\"total_duration\":22789130800,\"load_duration\":56604900,\"prompt_eval_count\":2443,
\"prompt_eval_duration\":400843000,\"eval_count\":568,\"eval_duration\":22325068000}"]
*/

/*
["{\"model\":\"mistral-nemo:latest\",\"created_at\":\"2024-10-05T16:33:48.1209571Z\",\"response\":\" combining\",\"done\":false}",
"{\"model\":\"mistral-nemo:latest\",\"created_at\":\"2024-10-05T16:33:48.1559578Z\",\"response\":\" both\", \"done\":false}",]
*/

/*

malformed : ["{\"model\":\"mistral-nemo:latest\",
\"created_at\":\"2024-10-05T20:01:44.3270787Z\",
\"response\":\" fiction\",\"done\":false}",

"{\"model\":\"mistral-nemo:latest\",
\"created_at\":\"2024-10-05T20:01:44.4080908Z\",
\"response\":\",\",\"done\":false}",

"{\"model\":\"mistral-nemo:latest\",
\"created_at\":\"2024-10-05T20:01:44.4080908Z\",
\"response\":\" and\",\"done\":false}",

"{\"model\":\"mistral-nemo:latest\",
\"created_at\":\"2024-10-05T20:01:44.4800404Z\",
\"response\":\" superhero\",\"done\":false}",

"{\"model\":\"mistral-nemo:latest\",
\"created_at\":\"2024-10-05T20:01:44.4800404Z\",
\"response\":\" films\",\"done\":false}",

"{\"model\":\"mistral-nemo:latest\",
\"created_at\":\"2024-10-05T20:01:44.5650422Z\",
\"response\":\".\",\"done\":false}",

"{\"model\":\"mistral-nemo:latest\",
\"created_at\":\"2024-10-05T20:01:44.5650422Z\",
\"response\":\"\",\"done\":true,
\"done_reason\":\"stop\",\"context\":[],
\"total_duration\":22473708500,\"load_duration\":34018100,
\"prompt_eval_count\":459,\"prompt_eval_duration\":40253000,
\"eval_count\":674,\"eval_duration\":22397935000}"]

reformed : 
{"model":"mistral-nemo:latest",
"created_at":"2024-10-05T20:01:44.5650422Z",
"response":" fiction, and superhero films.","done":true,
"done_reason":"stop","context":[],
"total_duration":22473708500,"load_duration":34018100,
"prompt_eval_count":459,"prompt_eval_duration":40253000,
"eval_count":674,"eval_duration":22397935000}


*/