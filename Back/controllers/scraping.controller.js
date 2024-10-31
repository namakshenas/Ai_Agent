const dds = require('duck-duck-scrape');
const scraper = require('../services/scraper.service.js');

// Scrape 3 web pages related to a provided search query
const getScrapedDatas = (db) => async (req, res) => {

    try {
      if(!req.body || !req.body.query) throw new Error('No query provided')
      const searchRequest = req.body.query
      console.log("searchQuery : " + searchRequest)
      const searchResults = (await dds.search(searchRequest, {
          safeSearch: dds.SafeSearchType.STRICT
      })).results
      const filteredSearchResults = searchResults.filter((result) => !(result.url).includes('youtube'))
      if(filteredSearchResults.length == 0) return res.status(500).send(`Couldn't find any related page`)
      const pageDatas = []
      let resultIndex = 0
      // should have 3 sources excluding the pages rejecting scraping
      while(pageDatas.length < 3 || resultIndex > searchResults.length){
        console.log("resultIndex : " + resultIndex)
        const datas = await scraper.fetchPage(filteredSearchResults[resultIndex].url)
        if(datas != null) pageDatas.push(datas)
          resultIndex += 1
      }
      const pageDatasNSources = pageDatas.map((datas, index) => {
          if(datas == null || filteredSearchResults[index].url == null) return undefined
          return {datas : datas, source : filteredSearchResults[index].url}
      }).filter((pageData) => pageData!= undefined)
      return res.status(200).setHeader("Access-Control-Allow-Origin", "*").json(pageDatasNSources)
    } catch (error) {
      console.error(error)
      res.status(500).send('An error occurred while scraping')
    }
}

module.exports = { getScrapedDatas };