/* eslint-disable @typescript-eslint/no-unused-vars */
import { IChatHistoryQAPair } from "../interfaces/IChatHistoryQAPair"
import AnswerRow from "./ChatHistory/AnswerRow"
import QuestionRow from "./ChatHistory/QuestionRow"
import '../style/ChatHistory.css'
import { useEffect, useRef } from "react"

function ChatHistory({historyItems, setTextareaValue} : IProps) {

  const historyContainerRef = useRef(null)

  // setting up an observer that scroll the div to bottom to follow the text being printed
  /*useEffect(() => {
    if(historyContainerRef.current == null) return
    const observer = new MutationObserver(() => {
      if(historyContainerRef.current != null) scrollHistorySectionToBottom(historyContainerRef.current)
    })
    observer.observe(historyContainerRef.current, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])*/

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
    // if(textareaRef.current != null) textareaRef.current.innerText = text;
    setTextareaValue(text)
  }

  function scrollHistorySectionToBottom(element : HTMLDivElement) {
    if (element== null) return
    element.scrollTop = element.scrollHeight
  }

  return (
    <section ref={historyContainerRef} className="chatHistorySection">
        {
          historyItems.map((item, index) => (
            <div key={'historyItem'+index}>
              <QuestionRow key={'questionRow' + index} question={item.question} onModify={handleModifyQuestion} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index}/>
              <AnswerRow key={'answerRow' + index} answer={item.answer} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index}/>
            </div>
          ))
        }
    </section>
  )
}

export default ChatHistory

interface IProps{
  historyItems : IChatHistoryQAPair[]
  // textareaRef : React.MutableRefObject<HTMLSpanElement | null>
  setTextareaValue : (text : string) => void
}