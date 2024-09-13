import { useEffect, useState } from 'react'
import '../style/FollowUpQuestions.css'
import { ChatService } from '../services/ChatService'
import { IChatHistoryQAPair } from '../interfaces/IChatHistoryQAPair'

function FollowUpQuestions({history, context, setTextareaValue, focusTextarea} : IProps){

    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])

    function handleFollowUpQuestionClick(text : string){
        focusTextarea()
        setTextareaValue(text)
    }

    useEffect(() => {
        if(history.length > 0) generateFollowUpQuestions(history[history.length-1].question)
    }, [context])

    // scrolldown when the followup questions appear
    useEffect(() => {
        window.scrollTo(0, document.body.scrollHeight)
    }, [followUpQuestions])

    // generate three follow up questions
    async function generateFollowUpQuestions(question : string, iter : number = 0){
        const prompt = "Use the following question to generate three related follow up questions, with a maximum 50 words each, that would lead your reader to discover great and related knowledge : \n\n" + question + `\n\nFormat those three questions as an array of strings such as : ["question1", "question2", "question3"]. Don't add any commentary or any annotation. Just output a simple and unique array.`
        let response = []
        const threeQuestions = await ChatService.askTheActiveModel(prompt, context || [])
        try{
            response = JSON.parse(threeQuestions.response)
        }catch(error){
            console.error(error)
            if(iter + 1 > 4) return setFollowUpQuestions([])
            generateFollowUpQuestions(question, iter + 1)
        }
        if(response.length == 3) setFollowUpQuestions(response)
    }

    return (
        followUpQuestions.length > 2 && <div className="followUpQuestionsContainer">
            {followUpQuestions.map((question, id) => (
                <span key={'fupquestion' + id} onClick={(e) => handleFollowUpQuestionClick((e.target as HTMLSpanElement).innerText)}>{question}</span>
            ))}
        </div>
    )
}

export default FollowUpQuestions;

interface IProps{
    history : IChatHistoryQAPair[]
    context : number[]
    setTextareaValue : (text : string) => void
    focusTextarea : () => void
}