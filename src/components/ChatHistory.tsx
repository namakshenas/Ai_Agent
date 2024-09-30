/* eslint-disable @typescript-eslint/no-unused-vars */
import AnswerRow from "./ChatHistory/AnswerRow"
import QuestionRow from "./ChatHistory/QuestionRow"
import '../style/ChatHistory.css'
import { useEffect, useRef } from "react"
import { IConversationElement } from "../interfaces/IConversation"

function ChatHistory({history, setTextareaValue, regenerateLastAnswer} : IProps) {

  const historyContainerRef = useRef(null)

  // setting up an observer that keep scrolling to the bottom of the main window
  // when some new streamed text is added to the conversation history
  useEffect(() => {
    if(historyContainerRef.current == null) return
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if(historyContainerRef.current != null && (mutation.type === 'childList' || mutation.type === 'attributes')) 
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          })
      })
    })
    observer.observe(historyContainerRef.current, { attributes : true, childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  function handleDownloadAsFile(text : string) : void {
    const blob = new Blob([text], {type: "text/plain;charset=utf-8"})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = "myfile.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function handleCopyToClipboard(text : string) : Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  function handleModifyQuestion(text : string){
    setTextareaValue(text)
  }

  return (
    <section ref={historyContainerRef} className="chatHistorySection">
        {
          history.map((item, index, array) => (
            <article key={'historyItem'+index}>
              <QuestionRow key={'questionRow' + index} question={item.question} onModify={handleModifyQuestion} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index}/>
              {(index == (array.length -1)) ? 
              <AnswerRow key={'answerRow' + index} answer={item.answer.asHTML} onRegenerate={regenerateLastAnswer} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index} sources={item.sources}/>
              : <AnswerRow key={'answerRow' + index} answer={item.answer.asHTML} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index} sources={item.sources}/>}
            </article>
          ))
        }
    </section>
  )
}

export default ChatHistory

interface IProps{
  history : IConversationElement[]
  setTextareaValue : (text : string) => void
  regenerateLastAnswer : () => void
}