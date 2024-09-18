/* eslint-disable @typescript-eslint/no-unused-vars */
import IScrapedPages from "../interfaces/IScrapedPages";
import { AgentLibrary } from "./AgentLibrary";

export class WebSearchService{

    static async getRelatedWebpagesDatas(query : string, maxPages : number = 3) : Promise<IScrapedPages[]>{
        const reformulatedQuery = this.#trimQuotes(await this.#optimizeQuery(query)).replace('"', " ").replace("'", " ")
        const scrapedPages = await this.#callExternalScraper(reformulatedQuery, maxPages)
        const summarizedScrapedPages = await this.#summarizeScrapedPages(scrapedPages, query)
        return summarizedScrapedPages
    }

    static async #callExternalScraper(query : string, maxPages : number = 3){ // !!! make use of maxPages
        try {
            const response = await fetch('http://127.0.0.1:3000/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query : query }),
            })
    
            // Check if the response is OK (status in the range 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
    
            const scrapedPages = await response.json()

            console.log(scrapedPages)
    
            // Validate the data structure if necessary
            if (!Array.isArray(scrapedPages)) {
                throw new Error('Invalid response format: Expected an array')
            }
    
            return scrapedPages;
        } catch (error) {
            console.error('Error calling scraper:', error);
            throw error; // Rethrow the error for further handling
        }
    }

    static async #optimizeQuery(query : string) {
        const optimizedQuery = (await AgentLibrary.library['searchQueryOptimizer'].ask(query)).response
        console.log(optimizedQuery)
        return optimizedQuery
    }

    static async #summarizeScrapedPages(scrapedPages : IScrapedPages[], query : string) : Promise<IScrapedPages[]> {
        const summarizedPages = [...scrapedPages]
        for (const page of summarizedPages) {
            page.datas = (await AgentLibrary.library['scrapedDatasSummarizer'].ask(`
                <SCRAPEDDATAS>${page.datas}</SCRAPEDDATAS>\n
                <REQUEST>${query}</REQUEST>\n
            `)).response
        }
        console.log('sum datas : ' + JSON.stringify(summarizedPages))
        return summarizedPages
    }

    static #trimQuotes(str : string) {
        return str.replace(/^['"]|['"]$/g, '')
    }
}