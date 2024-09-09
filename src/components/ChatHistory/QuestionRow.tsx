import '../../style/ChatHistory.css'
import userIcon from '../../assets/usericon5.png';
import clipboardIcon from '../../assets/clipboardicon2.png';
import downloadIcon from '../../assets/downloadicon2.png';
import retryIcon from '../../assets/reloadicon.png';
import './QuestionRow.css'

function QuestionRow({index, question, onDownload, onCopyToClipboard, onModify} : IProps){

    return(
       <div className="historyItem questionItem" style={{borderBottom:'1px solid #22222211'}} key={'question' + index}>
            <div style={{height:'34px', width:'34px', borderRadius:'100%', outline:'2px solid #fff', flexShrink:'0', display:'flex', justifyContent:'center', alignItems:'center'}}>
                <img className="actorIcon" src={userIcon} width={34} style={{opacity:'0.6'}}/>
            </div>
            <div style={{width:'100%', display:'flex', alignItems:'center'}}>{question}</div>
            <div className='questionIconsContainer'>
                <div className='iconButton' role="button"><img className="clipboardIcon" src={retryIcon} onClick={() => onModify(question)}/></div>
                <div className='iconButton' role="button"><img className="clipboardIcon" src={downloadIcon} onClick={() => onDownload(question)}/></div>
                <div className='iconButton' role="button"><img className="clipboardIcon" src={clipboardIcon} onClick={() => onCopyToClipboard(question)}/></div>
            </div>
       </div>
    )
   }
   
   export default QuestionRow

   interface IProps{
    index : number
    question : string
    onDownload : (text : string) => void
    onModify : (text : string) => void
    onCopyToClipboard : (text : string) => Promise<void>
}