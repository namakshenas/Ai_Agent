/* eslint-disable @typescript-eslint/no-unused-vars */
import IScrapedPage from "../interfaces/IScrapedPage";
import ScrapedPage from "../models/ScrapedPage";
import { AgentLibrary } from "./AgentLibrary";

export class WebSearchService{

    static async scrapeRelatedDatas(query : string, maxPages : number = 3, summarize = false) : Promise<ScrapedPage[] | undefined>{
        try{
            console.log("**WebScraping**")
            const optimizedQuery = await this.#optimizeQuery(query)
            const trimedQuery = this.#trimQuotes(optimizedQuery)
            const scrapedPages = await this.#callExternalScraper(trimedQuery, maxPages)
            if(!summarize) return scrapedPages
            const summarizedScrapedPages = await this.#summarizeScrapedPages(scrapedPages, query)
            return summarizedScrapedPages
        }catch(error){
            console.error('Error while trying to scrape the needed datas :', error)
        }
    }

    static async #callExternalScraper(query : string, maxPages : number = 3) : Promise<ScrapedPage[]>{ // !!! make use of maxPages
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
    
            const scrapedPages : IScrapedPage[] | unknown = await response.json()
    
            // Validate the data structure
            if (!Array.isArray(scrapedPages)) {
                throw new Error('Invalid response format: Expected an array')
            }
    
            // object mapping
            return scrapedPages.map(page => new ScrapedPage(page.datas, page.source))

        } catch (error) {
            console.error('Error calling the scraper API :', error)
            throw error
        }
    }

    // convert the user request into an optimized search query
    static async #optimizeQuery(query : string) : Promise<string> {
        const queryOptimizer = AgentLibrary.getAgent('searchQueryOptimizer')
        if(queryOptimizer == null) return query
        return (await queryOptimizer.ask(query)).response
    }

    // summarizing the scraped datas so it will take less context
    static async #summarizeScrapedPages(scrapedPages : ScrapedPage[], query : string) : Promise<ScrapedPage[]> {
        const scrapedDatasSummarizer = AgentLibrary.getAgent('scrapedDatasSummarizer')
        if(scrapedDatasSummarizer == null) return scrapedPages
        const summarizedPages = [...scrapedPages]
        for (const page of summarizedPages) {
            page.setDatas(
                (await scrapedDatasSummarizer.ask(`
                    <SCRAPEDDATAS>${page.datas}</SCRAPEDDATAS>\n
                    <REQUEST>${query}</REQUEST>\n
                `)).response
            )

            console.log('SUMMARY : ' + page.datas)
        }

        return summarizedPages
    }

    static #trimQuotes(str : string) {
        return str.replace(/^['"]|['"]$/g, '').replace('"', " ").replace("'", " ")
    }
}