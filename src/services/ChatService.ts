/* eslint-disable @typescript-eslint/no-unused-vars */
import { IConversationElement, IInferenceStats } from "../interfaces/IConversation";
import IScrapedPage from "../interfaces/IScrapedPage";
import { AIAgent } from "../models/AIAgent";
import ScrapedPage from "../models/ScrapedPage";
import AnswerFormatingService from "./AnswerFormatingService";
export class ChatService{

    static #targetedRAGDocs : string[] = []

    static activeAgent : AIAgent = new AIAgent({id : 'a0000000001',
      name: "baseAssistant",
      modelName : "mistral-nemo:latest",
      systemPrompt : "You are an helpful assistant",
      mirostat: 0,
      mirostat_eta: 0.1,
      mirostat_tau: 5.0,
      num_ctx: 2048,
      repeat_last_n: 64,
      repeat_penalty: 1.1,
      temperature: 0.1,
      seed: 0,
      stop: "AI assistant:",
      tfs_z: 1,
      num_predict: 1024,
      top_k: 40,
      top_p: 0.9,
      type : "system",
      favorite : false
    })

    static stillInUseAgent = this.activeAgent

    static async askForFollowUpQuestions(question : string, context:number[] = []) : Promise<string>
    {
      try{
        if(this.activeAgent == null) throw new Error(`Agent is not available`)

        this.activeAgent.setContext(context)
        const answer = await this.activeAgent.ask(question)
        return answer.response
      } catch (error){
        console.error("Failed to generate the follow up questions : " + error)
        throw error
      }
    }

    // askTheActiveAgent({question : string, context : number[], formating : boolean, answerProcessorCallback, websearch : boolean})
    // then redirect to one of the two ask below queryAgent
  
    static async askTheActiveAgent(question : string, context:number[] = [], format : boolean = true) : Promise<IConversationElement>
    {
      if(this.activeAgent == null) throw new Error(`Agent is not available`)
        this.activeAgent.setContext(context)

      try{
        const answer = await this.activeAgent.ask(question)
        const responseAsHTML = await AnswerFormatingService.format(answer.response)
        return {context : [...answer.context as number[]], answer : {asMarkdown : answer.response, asHTML : responseAsHTML}, sources : [], question : question}
      }catch(error){
        console.error("Failed to query the model : " + error)
        throw error
      }
    }

    static async askTheActiveAgentForAStreamedResponse(question : string, /*showErrorModal: (message : string) => void, */chunkProcessorCallback : ({markdown , html} : {markdown : string, html : string}) => void, context:number[] = [], scrapedPages?: ScrapedPage[]) : Promise<{newContext :number[], inferenceStats : IInferenceStats}>
    {
      if(this.activeAgent == null) throw new Error(`Agent is not available`)
      this.setCurrentlyUsedAgent(this.activeAgent)

      let newContext = []
      const inferenceStats : IInferenceStats = {
        promptEvalDuration : 0,
        inferenceDuration : 0,
        modelLoadingDuration : 0,
        wholeProcessDuration : 0,
        tokensGenerated : 0,
        promptTokensEval : 0,
      }

      this.activeAgent.setContext(context)
      // logScrapedDatas(scrapedPages)
      const concatenatedWebDatas = scrapedPages ? scrapedPages.reduce((acc, currentPage)=> acc + '\n\n' + currentPage.datas, "When replying to **MY REQUEST**, always use the following datas as your MAIN source of informations especialy if it superseeds your training dataset : ") : ""
      const availableContextForWebDatas = this.activeAgent.getContextSize() - this.activeAgent.getNumPredict() - 1000
      const webDatasSizedForAvailableContext = concatenatedWebDatas.substring(0, availableContextForWebDatas)
      // the agent receive an amount of scraped datas matching the context size available

      let content = ""
      let decod = ""
      try{
          const reader = await this.activeAgent.askForAStreamedResponse(webDatasSizedForAvailableContext + '\n\n<MYREQUEST>' + question + '</MYREQUEST>')

          while(true){
              const { value } = await reader.read()

              const decodedValue = new TextDecoder().decode(value)
              decod = decodedValue
              // check if the decoded value isn't malformed -> fix it if it is
              let reconstructedValue = this.#reconstructMalformedValues(decodedValue)
              /* memo : decodedValue structure : {"model":"qwen2.5:3b","created_at":"2024-09-29T15:14:02.9781312Z","response":" also","done":false} */
              console.log(reconstructedValue)

              // deal with the very last datas chunk being unexpectedly split into two chunks
              if(reconstructedValue.includes('"done":true') && !reconstructedValue.endsWith("}")) reconstructedValue += (await reader.read()).value

              const json = JSON.parse(reconstructedValue)

              if(json.done) {
                newContext = json.context || []
                inferenceStats.promptEvalDuration = json.prompt_eval_duration
                inferenceStats.promptTokensEval = json.prompt_eval_duration
                inferenceStats.inferenceDuration = json.eval_duration
                inferenceStats.modelLoadingDuration = json.load_duration
                inferenceStats.wholeProcessDuration = json.total_duration
                inferenceStats.tokensGenerated = json.eval_count
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
            console.error('Stream aborted.')
          } else {
            console.error('Stream failed : ', error)
            console.error(decod)
          }
          throw error
      }

      return { newContext : scrapedPages ? [] : newContext, inferenceStats }
    }

    /*
          ChatService.ts:133 {"model":"mistral-nemo:latest","created_at":"2024-10-14T01:18:48.7477479Z","response":"","done":true,"done_reason":"stop","context":[3,3213,1584,1420,20351,27089,21366,1060,61997,46648,1062,11745,1395,1278,2181,1636,1736,1317,2210,1294,21764,1317,4832,2036,7330,1737,1032,1010,1369,14047,1059,1514,17626,2842,14724,6685,79483,1046,2182,1836,7934,47556,8646,1044,2084,1044,4053,1044,1505,13294,1059,1514,7125,2478,2127,6398,2414,1046,3931,5592,1514,2959,7363,1513,1278,7537,1307,1261,88066,1044,1321,1514,81517,26699,1794,7537,6184,1505,5946,5213,1046,6830,1261,4253,5433,1486,9491,3066,2414,1044,1321,47368,1794,3518,1317,10035,37062,1794,44671,1514,14063,1261,3709,5349,6945,1848,1307,1278,9091,1046,1531,2469,1486,9375,1044,5572,9829,1044,1321,12689,1044,5572,36791,1513,1420,94035,1288,39452,7786,2425,1278,14127,1046,1349,7153,1307,27998,23170,13875,1454,63159,2553,13247,1486,9236,1294,1925,15552,1046,1407,46235,2575,18168,5539,2015,1408,3687,44126,1494,1044,57079,1302,1455,1494,7867,2269,20151,1307,12216,1046,1429,19688,1044,6145,1402,42118,4225,1514,2639,1059,1429,1276,1395,1261,3145,7153,17405,1429,1069,46767,17405,2639,1278,14047,1044,1321,34100,1407,46235,2575,2203,1278,2469,1044,1514,9323,1278,5433,6610,2414,1046,1349,47981,2270,1621,1321,1407,46235,2575,1486,1261,55513,1046,3367,2156,1880,2151,1836,47981,1044,1494,2168,1736,2151,16501,1394,2414,1317,2764,2645,1278,67168,1307,1278,84997,2274,6452,1278,7990,1413,3025,1115,1307,1757,1046,33407,1044,3413,42079,6509,1261,12743,12970,2948,28473,4016,1736,16044,1435,1278,20368,41317,1581,27045,1046,1407,46235,2575,1044,4382,1044,1880,16044,1278,5287,1276,1044,9284,15090,1514,2168,1605,8902,2200,16653,1311,6044,3601,1102,10910,2414,1294,6993,1059,1321,1605,2342,2697,1514,22194,2414,1044,1809,1278,2469,1294,1799,16653,1880,2151,46171,1044,1321,1799,1486,7529,11141,1394,1278,56301,1307,82581,1046,4634,65915,7863,1722,17987,3656,6610,1454,2269,26765,1536,1407,46235,2575,1044,1321,32791,2414,1317,2269,9886,1307,31626,1525,1532,1046,9748,1278,5287,2383,1880,1605,1563,79996,2414,1513,5785,1044,1514,7516,1455,2127,2168,1605,15160,2414,1513,1747,1046,4159,1880,27792,2414,1394,1278,10485,1307,108488,1044,1321,1435,1514,1880,2342,1261,4517,1295,29474,2314,2414,1044,1514,98098,1605,1514,2168,1402,1382,1545,35974,1046,2182,29347,1455,6044,3601,1102,1880,2151,8224,1286,1513,1032,1052,1044,1048,1048,1048,30270,1115,1044,1321,1435,1514,6090,7363,1307,3315,7607,11678,2224,6044,3601,1102,1514,9247,1794,3754,9169,1513,1032,1056,1044,1048,1048,1048,30270,1115,1046,47965,22334,30270,1115,102832,1317,1032,1052,1056,1044,1048,1048,1048,36030,1059,1514,2168,2430,1736,2314,1032,1053,1044,1048,1053,1048,1044,1048,1048,1048,56559,3979,1046,5930,1593,4556,1514,2481,18108,1317,5807,1848,1307,25618,1046,9144,1044,15872,4118,17898,1294,3144,5083,1317,16479,11125,7363,1562,1794,3980,1044,5662,1514,1722,1605,39659,1513,1278,126130,4556,1307,1032,1053,1044,1048,1053,1048,1044,1048,1048,1048,56559,1044,1514,42989,7363,1408,1794,7153,1044,1321,2453,19826,2136,2295,1505,3300,5213,1044,14374,45158,1454,1278,31626,1525,1532,1307,1278,20279,9284,4129,41317,1581,27045,1486,28768,1046,14940,1032,1049,1049,1053,41317,1581,27045,1681,11630,1307,129406,1046,2837,54403,1562,3387,10301,8100,1278,1925,57309,1286,1536,1407,46235,2575,1046,2182,4308,6611,1046,3870,1261,6993,1911,92310,1317,5043,3569,102067,1044,16363,20434,1454,124731,9333,104964,1044,1321,1278,6444,107097,1307,32126,12603,1044,1278,7496,29528,1307,1799,3811,8146,7423,1294,124703,22416,3879,1278,5349,1044,1278,13988,1307,1278,7496,13779,2440,2469,1799,73791,1794,5731,1408,72814,7081,10935,2479,1278,55523,1307,2269,60865,1638,21189,1046,3626,1294,2516,1261,8516,1261,4249,4735,14336,2961,1317,4036,1278,47470,16251,2203,64624,1046,1429,16860,1044,14842,4225,1514,34355,4223,1044,1429,1073,1855,1294,1278,8004,1307,1278,22497,4471,1307,12970,16653,1311,6044,3601,1102,19135,2613,6304,2158,6674,1486,1317,56336,1044,1455,1514,4139,2840,5627,1514,1486,34997,1046,2182,70320,1593,1562,1429,11874,3653,2111,3015,4225,1278,2342,4978,1514,1880,7256,3346,1044,1809,1799,15
      Chat.tsx:186 SyntaxError: Expected ',' or ']' after array element in JSON at position 56726 (line 1 column 56727)
          at JSON.parse (<anonymous>)
          at ChatService.askTheActiveAgentForAStreamedResponse (ChatService.ts:106:33)
          at async askMainAgent_Streaming (Chat.tsx:167:36)
      askMainAgent_Streaming	@	Chat.tsx:186
    */

    // write three functions in javascript for a tetris game
    // split one malformed block into multiple ones if needed
    static #reconstructMalformedValues(value : string | null) : string{
      try{
        // console.log("untouchedValue : " + value)
        if(value == null) return JSON.stringify({"model":"","created_at":"","response":" ","done":false})
        const splitValues = value.split("}\n{")
        if(splitValues.length == 1) return value.trim()
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
        console.log("rebuilt : " + JSON.stringify(aggregatedChunk))
        return JSON.stringify(aggregatedChunk)
      } catch (error) {
        // this.abortAgentLastRequest()
        console.error(`Can't reconstruct these values : ` + JSON.stringify(value))
        throw error
      }
    }

    static abortAgentLastRequest(){
      if(this.activeAgent != null) this.activeAgent.abortLastRequest()
      if(this.stillInUseAgent != null) this.stillInUseAgent.abortLastRequest() 
    }

    static setActiveAgent(agent : AIAgent){
      this.activeAgent = agent
    }

    static setCurrentlyUsedAgent(agent : AIAgent){
      if(agent != null) this.stillInUseAgent = agent
    }

    static getActiveAgentName() : string{
      return this.activeAgent?.getName() || ""
    }

    static getActiveAgent() : AIAgent{
      return this.activeAgent
    }

    static setDocAsARAGTarget(docName : string){
      if(!this.#targetedRAGDocs.includes(docName)) this.#targetedRAGDocs.push(docName)
    }

    static removeDocFromRAGTargets(docName : string){
      if(this.#targetedRAGDocs.includes(docName)) this.#targetedRAGDocs = this.#targetedRAGDocs.filter(targetName => !(targetName == docName))
    }

    static getRAGTargetsFilenames() : string[]{
      return this.#targetedRAGDocs
    }

    static clearRAGTargets(){
      this.#targetedRAGDocs = []
    }

    static logScrapedDatas(scrapedPages : IScrapedPage[]){
      scrapedPages?.forEach(page => console.log("scrapedPageData :" + page.datas))
    }

    /*static async askTheActiveAgentForAutoComplete(promptToComplete : string, context:number[] = []) : Promise<{context : number[], response : string}>
    {
        try{
          if(this.activeAgent == null) throw new Error(`Complemention Agent is not available`)
          AgentLibrary.library['CompletionAgent'].setContext(context)
          const answer = (await AgentLibrary.library['CompletionAgent'].ask(promptToComplete))
          return {context : answer.context as number[], response : answer.response}
        }catch(error){
          console.error("Failed to complete the question : " + error)
          throw error
        }
    }*/
}