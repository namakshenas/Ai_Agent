import '../../style/ChatHistory.css'

function QuestionRow({index, question, onDownload, onCopyToClipboard} : IProps){

    return(
       <div className="historyItem" style={{backgroundColor:'#eeeeeebb', color:'#000000dd'}} key={'question' + index}>
           <div>{question}</div>
           <div style={{flexDirection:'row', flexShrink:'0'}}>
               <svg className="clipboardIcon" onClick={() => onDownload(question)} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000aa"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
               <svg className="clipboardIcon" onClick={() => onCopyToClipboard(question)} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000aa"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
           </div>
       </div>
    )
   }
   
   export default QuestionRow

   interface IProps{
    index : number
    question : string
    onDownload : (text : string) => void
    onCopyToClipboard : (text : string) => Promise<void>
}