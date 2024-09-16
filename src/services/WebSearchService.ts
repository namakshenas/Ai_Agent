/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIBrowser } from "../models/AIBrowser";

export class WebSearchService{

    static async getRelatedWebpagesDatas(topic : string, topWebpages : number = 3) : Promise<string[]>{       
        /*const resultlList = await AIBrowser.altSearch(topic)
        const pagesDatas = []
        let i = 0
        for(const result of resultlList){
            const fetchedPage = await AIBrowser.fetchPage(result)
            if(fetchedPage != null) pagesDatas.push(fetchedPage)
            i++
            if(i >= topWebpages) break
        }
        return pagesDatas*/
        const pagesDatas = await AIBrowser.callScraper(topic)
        return pagesDatas
    }
}