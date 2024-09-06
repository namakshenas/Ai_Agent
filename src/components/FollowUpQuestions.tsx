function FollowUpQuestions({questions, textareaRef} : IProps){

    function handleFollowUpQuestionClick(text : string){
        (textareaRef.current as HTMLTextAreaElement).value = text
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
    textareaRef : React.MutableRefObject<HTMLTextAreaElement | null>
}