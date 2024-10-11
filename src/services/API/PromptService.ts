import IPromptResponse from "../../interfaces/responses/IPromptResponse"

export default class PromptService{

    static async save(name : string, prompt : string, version : string){
        try{
            const reponse = await fetch('http://localhost:3000/prompt', {
                method : 'POST',
                body : JSON.stringify({name, prompt, version}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error saving agent') // !!! deal with existing name
        }catch(e){
            console.error(e)
        }
    }

    static async update(prevName : string, name : string, prompt : string, version : string) : Promise<void>{
        try{
            const reponse = await fetch('http://localhost:3000/prompt/' + prevName, {
                method : 'PUT',
                body : JSON.stringify({name, prompt, version}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error saving agent')
        }catch(e){
            console.error(e)
        }
    }

    static async getByName(name : string) : Promise<IPromptResponse | undefined>{
        try {
            const response = await fetch("http://127.0.0.1:3000/prompt/name/" + name, {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching the target prompt : ", error)
            return undefined
        }
    }

    static async getAll() : Promise<IPromptResponse[] | undefined>{
        try {
            const response = await fetch("http://127.0.0.1:3000/prompts", {
                method: "GET",
                headers: { "Content-Type": "application/json", }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
            
        } catch (error) {
            console.error("Error fetching prompts list : ", error)
            return undefined
        }
    }

    static async delete(promptId : string) : Promise<void>{
        try {
            const response = await fetch("http://127.0.0.1:3000/prompt/" + promptId, {
                method:"DELETE"
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

        } catch (error) {
            console.error("Error fetching prompts list : ", error)
            return undefined
        }
    }
}