/* eslint-disable @typescript-eslint/no-unused-vars */
import AnswerRow from "./AnswerRow"
import QuestionRow from "./QuestionRow"
import '../../style/ChatHistory.css'
import { useEffect, useRef } from "react"
import { IConversationElement } from "../../interfaces/IConversation"
import { useTTS } from "../../hooks/useTTS"

function ChatHistory({history, isStreaming, setTextareaValue, regenerateLastAnswer} : IProps) {

  const historyContainerRef = useRef(null)
  const autoScrollingObsRef = useRef<MutationObserver>()

  const TTS = useTTS()

  // setting up an observer that keep scrolling to the bottom of the chat window
  // when some new streamed text is added to the conversation history
  useEffect(() => {
    if(isStreaming == false) return
    if(historyContainerRef.current == null) return
    if(autoScrollingObsRef.current) autoScrollingObsRef.current.disconnect()
    autoScrollingObsRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if(historyContainerRef.current != null && (mutation.type === 'childList' || mutation.type === 'attributes')) 
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          })
      })
    })
    // autoScrollingObsRef.current = observer
    autoScrollingObsRef.current.observe(historyContainerRef.current, { attributes : true, childList: true, subtree: true })

    return () => {
      if(autoScrollingObsRef.current) autoScrollingObsRef.current.disconnect()
      autoScrollingObsRef.current = undefined
    }
  }, [isStreaming])

  // disconnect observer if mouse wheel or scrollbar used
  /*useEffect(() => {
    function disconnectObserver() {
      if(autoScrollingObsRef.current) autoScrollingObsRef.current.disconnect()
      autoScrollingObsRef.current = undefined
    }
    document.addEventListener('wheel', disconnectObserver)

    return () => {
      document.removeEventListener('wheel', disconnectObserver)
    }
  }, [autoScrollingObsRef])*/

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
        {history.length == 0 && <div style={{padding: '3rem 0', background:'#f7f9fd'}}>Warning : Due to some Ollama limitations, you won't be able to switch model during a conversation.</div>}
        {
          history.map((item, index, array) => (
            <article key={'historyItem'+index}>
              <QuestionRow key={'questionRow' + index} question={item.question} onModify={handleModifyQuestion} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index}/>
              {(index == (array.length -1)) ? 
              <AnswerRow TTS={TTS} key={'answerRow' + index} answer={item.answer} onRegenerate={regenerateLastAnswer} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index} sources={item.sources}/>
              : <AnswerRow TTS={TTS} key={'answerRow' + index} answer={item.answer} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index} sources={item.sources}/>}
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
  isStreaming : boolean
}