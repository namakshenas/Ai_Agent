import { IRAGDocumentResponse } from "../../interfaces/responses/IRAGDocumentResponse"

export default class DocService{

    static async save(){
        try{
            const response = await fetch("http://127.0.0.1:3000/doc", {
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

    static async getAll() : Promise<IRAGDocumentResponse[] | undefined>{
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
}