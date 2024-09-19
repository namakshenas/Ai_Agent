/* eslint-disable @typescript-eslint/no-unused-vars */
import IScrapedPage from "../interfaces/IScrapedPage";
import ScrapedPage from "../models/ScrapedPage";
import { AgentLibrary } from "./AgentLibrary";

export class WebSearchService{

    static async scrapeRelatedDatas(query : string, maxPages : number = 3) : Promise<ScrapedPage[]>{
        const reformulatedQuery = this.#trimQuotes(await this.#optimizeQuery(query)).replace('"', " ").replace("'", " ")
        const scrapedPages = await this.#callExternalScraper(reformulatedQuery, maxPages)
        const summarizedScrapedPages = await this.#summarizeScrapedPages(scrapedPages, query)
        return summarizedScrapedPages
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

            console.log(scrapedPages)
    
            // Validate the data structure
            if (!Array.isArray(scrapedPages)) {
                throw new Error('Invalid response format: Expected an array')
            }
    
            // object mapping
            return scrapedPages.map(page => new ScrapedPage(page.datas, page.source))

        } catch (error) {
            console.error('Error calling scraper:', error)
            throw error // !!!
        }
    }

    // convert the user request into an optimized search query
    static async #optimizeQuery(query : string) {
        const optimizedQuery = (await AgentLibrary.library['searchQueryOptimizer'].ask(query)).response
        console.log(optimizedQuery)
        return optimizedQuery
    }

    // summarizing the scraped datas so it will take less context
    static async #summarizeScrapedPages(scrapedPages : ScrapedPage[], query : string) : Promise<ScrapedPage[]> {
        const summarizedPages = [...scrapedPages]
        for (const page of summarizedPages) {
            page.setDatas(
                (await AgentLibrary.library['scrapedDatasSummarizer'].ask(`
                    <SCRAPEDDATAS>${page.datas}</SCRAPEDDATAS>\n
                    <REQUEST>${query}</REQUEST>\n
                `)).response
            )

        }

        summarizedPages.map(page => {
            console.log('SUMMARY : ' + page.datas)
        })

        return summarizedPages
    }

    static #trimQuotes(str : string) {
        return str.replace(/^['"]|['"]$/g, '')
    }
}