import IEmbedChunkedDoc from "../../interfaces/IEmbedChunk"
import { IRAGDocument } from "../../interfaces/IRAGDocument"
import { AIModel } from "../../models/AIModel"

export default class DocService{

    static embeddingModel = new AIModel({modelName : "nomic-embed-text"})

    static async saveDocWithEmbeddings(processedDoc : IEmbedChunkedDoc[]){
        try{
            const response = await fetch("http://127.0.0.1:3000/embeddings", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body : JSON.stringify(processedDoc)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }catch(e){
            console.error(e)
        }
    }

    static async delete(docLokiId : number){
        try{
            const response = await fetch("http://127.0.0.1:3000/doc/" + docLokiId, {
                method: "POST",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }catch(e){
            console.error(e)
        }
    }

    static async getAll() : Promise<IRAGDocument[] | undefined>{
        try {
            const response = await fetch("http://127.0.0.1:3000/docs", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching docs list : ", error)
            return undefined
        }
    }

    static async getRelevantTextChunks(query : string, targetFilesNames : string[]) : Promise<string[] | undefined>{
        try {
            console.log("getrelevant")
            const queryEmbeddings = (await this.embeddingModel.askEmbeddingsFor(query)).embedding
            const response = await fetch("http://127.0.0.1:3000/docs/bySimilarity", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body : JSON.stringify({ query,  embeddings : queryEmbeddings, targetFilesNames })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching related docs : ", error)
            return undefined
        }
    }
}