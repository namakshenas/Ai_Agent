/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
import * as cheerio from 'cheerio'
import { SafeSearchType, search, SearchResult } from 'duck-duck-scrape';
export class AIBrowser {

    static async search(topic : string) : Promise<SearchResult[]>{
        const searchResults = await search(topic, {
            safeSearch: SafeSearchType.STRICT
        })
        
        return searchResults.results
    }

    static async fetchPage(url : string) : Promise<string| undefined>{
        const imgTagRegex = /<img[^>]*\/>/gi;
        const imgTagRegex2 = /<img[^>]*\/><\/img>/gi;
        const imgTagRegex3 = /<img[^>]*>/gi;
        const imgTagRegex4 = /<a[^>]/gi;
        try {
            
            const response = await fetch(url)
            if (!response.ok) throw new Error(`Response status: ${response.status}`)
            const webpage = cheerio.load(await response.text())
            webpage('script').remove()
            webpage('style').remove()
            webpage('nav').remove()
            webpage('header').remove()
            webpage('footer').remove()
            // webpage('a').remove()
            webpage('img').remove()
            const cleanText = (webpage("body").text())
                .replace(/[\n\t]+/g, '\n')
                .replace(imgTagRegex, '')
                .replace(imgTagRegex2, '')
                .replace(imgTagRegex3, '')
                .replace(imgTagRegex4, '')
                .replace("</a>", "")
                .replace("\'", "'")
                .replace('\"', '"');
            return cleanText
        }catch(error){
            console.log(error)
        }
    }

    /*static async callExternalScraper(query : string) : Promise<IScrapedPages[]>{
        try {
            const response = await fetch('http://127.0.0.1:3000/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query : query }),
            });
    
            // Check if the response is OK (status in the range 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const scrapedPages = await response.json();

            console.log(scrapedPages)
    
            // Validate the data structure if necessary
            if (!Array.isArray(scrapedPages)) {
                throw new Error('Invalid response format: Expected an array');
            }
    
            return scrapedPages;
        } catch (error) {
            console.error('Error calling scraper:', error);
            throw error; // Rethrow the error for further handling
        }
    }*/
}