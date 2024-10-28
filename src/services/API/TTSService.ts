export default class PromptService{

    static async generateAudio(text : string){
        try{
            const reponse = await fetch('http://localhost:3000/tts/generate', {
                method : 'POST',
                body : JSON.stringify({text}),
                headers:{ 'Content-Type' : 'application/json' }
            })
            if(!reponse.ok) return reponse.text()
        }catch(e){
            console.error(e)
        }
    }
}