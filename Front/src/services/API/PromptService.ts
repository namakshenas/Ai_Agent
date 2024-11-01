import IPromptResponse from "../../interfaces/responses/IPromptResponse"

export default class PromptService{

    static async save(name : string, prompt : string){
        try{
            const reponse = await fetch('http://localhost:3000/prompt', {
                method : 'POST',
                body : JSON.stringify({name, prompt, version : 1}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error saving the prompt') // !!! deal with existing name
        }catch(e){
            console.error(e)
        }
    }

    static async updateByName(prevName : string, {newName, prompt, version} : {newName : string, prompt : string, version : number}) : Promise<void>{
        try{
            const reponse = await fetch('http://localhost:3000/prompt/byName/' + prevName, {
                method : 'PUT',
                body : JSON.stringify({name : newName, prompt, version}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error updating the prompt')
        }catch(e){
            console.error(e)
        }
    }

    static async updateById(id : string, {name, prompt, version} : {name : string, prompt : string, version : number}) : Promise<void>{
        try{
            const reponse = await fetch('http://localhost:3000/prompt/byId/' + id, {
                method : 'PUT',
                body : JSON.stringify({name, prompt, version}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) throw new Error('Error updating the prompt')
        }catch(e){
            console.error(e)
        }
    }

    static async getByName(name : string) : Promise<IPromptResponse | undefined>{
        try {
            const response = await fetch("http://127.0.0.1:3000/prompt/byName/" + name, {
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

    static async deleteById(promptId : string) : Promise<void>{
        try {
            const response = await fetch("http://127.0.0.1:3000/prompt/byId/" + promptId, {
                method:"DELETE"
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

        } catch (error) {
            console.error("Error deleting the target prompt : ", error)
            return undefined
        }
    }

    static async deleteByName(promptName : string) : Promise<void>{
        try {
            const response = await fetch("http://127.0.0.1:3000/prompt/byName/" + promptName, {
                method:"DELETE"
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

        } catch (error) {
            console.error("Error deleting the target prompt : ", error)
            return undefined
        }
    }
}