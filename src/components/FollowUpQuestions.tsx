/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import '../style/FollowUpQuestions.css'
import { ChatService } from '../services/ChatService'
import { IConversationElement } from '../interfaces/IConversation'

function FollowUpQuestions({historyElement, setTextareaValue, focusTextarea, isStreaming, selfClose} : IProps){

    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])

    function handleFollowUpQuestionClick(text : string){
        focusTextarea()
        setTextareaValue(text)
    }

    function handleSelfCloseClick(){
        selfClose(true)
    }

    function handleRefreshFUpClick(){
        generateFollowUpQuestions(historyElement.question)
    }

    useEffect(() => {
        if(historyElement?.question && historyElement.question != "" && historyElement?.context?.length && !isStreaming) {
            generateFollowUpQuestions(historyElement.question)
        }
    }, [historyElement?.context])

    // generate three follow up questions after an answer has been streamed
    async function generateFollowUpQuestions(question : string, iter : number = 0){
        const prompt = "Use the following question to generate three related follow up questions, with a maximum 50 words each, that would lead your reader to discover great and related knowledge : \n\n" + question + `\n\nFormat those three questions as an array of strings such as : ["question1", "question2", "question3"]. Don't add any commentary or any annotation. Just output a simple and unique array.`
        let response = []
        ChatService.abortAgentLastRequest()
        const threeQuestions = await ChatService.askTheActiveAgent(prompt, historyElement.context || [])
        try{
            response = JSON.parse(threeQuestions.response)
        }catch(error){
            console.error(error)
            if(iter + 1 > 4) return setFollowUpQuestions([])
            generateFollowUpQuestions(question, iter + 1)
        }
        if(response?.length == 3) setFollowUpQuestions(response)
    }

    return (
        followUpQuestions.length > 2 && <div className="followUpQuestionsContainer">
            {followUpQuestions.map((question, id) => (
                <span role="button" key={'fupquestion' + id} onClick={(e) => handleFollowUpQuestionClick((e.target as HTMLSpanElement).innerText)}>{question}</span>
            ))}
            <button onClick={handleSelfCloseClick}>
                <svg width="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </button>
        </div>
    )
}

export default FollowUpQuestions;

interface IProps{
    historyElement : IConversationElement
    setTextareaValue : (text : string) => void
    focusTextarea : () => void
    isStreaming : boolean
    selfClose : (bool : boolean) => void
}