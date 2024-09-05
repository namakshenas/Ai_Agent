import { IChatHistoryQAPair } from "../interfaces/IChatHistoryQAPair"
import AnswerRow from "./ChatHistory/AnswerRow"
import QuestionRow from "./ChatHistory/QuestionRow"
import '../style/ChatHistory.css'

function ChatHistory({historyItems, textareaRef} : IProps) {

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
    if(textareaRef.current != null) textareaRef.current.value = text;
  }

  return (
    <section className="chatHistorySection">
        {
          historyItems.map((item, index) => (
            <div key={'historyItem'+index}>
              <QuestionRow key={index} question={item.question} onModify={handleModifyQuestion} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index}/>
              <AnswerRow key={index} answer={item.answer} onDownload={handleDownloadAsFile} onCopyToClipboard={handleCopyToClipboard} index={index}/>
            </div>
          ))
        }
    </section>
  )
}

export default ChatHistory

interface IProps{
  historyItems : IChatHistoryQAPair[]
  textareaRef : React.MutableRefObject<HTMLTextAreaElement | null>
}