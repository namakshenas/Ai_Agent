import '../style/FollowUpQuestions.css'

function FollowUpQuestions({questions, setTextareaValue} : IProps){

    function handleFollowUpQuestionClick(text : string){
        setTextareaValue(text)
    }

    return (
        <div className="followUpQuestionsContainer">
            {questions.map((question, id) => (
                <span key={'fupquestion' + id} onClick={(e) => handleFollowUpQuestionClick((e.target as HTMLSpanElement).innerText)}>{question}</span>
            ))}
        </div>
    )
}

export default FollowUpQuestions;

interface IProps{
    questions : string[]
    setTextareaValue : (text : string) => void
}