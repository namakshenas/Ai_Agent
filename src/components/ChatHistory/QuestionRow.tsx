import '../../style/ChatHistory.css'
import userIcon from '../../assets/usericon5.png';
import clipboardIcon from '../../assets/clipboardicon2.png';
import downloadIcon from '../../assets/downloadicon2.png';
import retryIcon from '../../assets/reloadicon.png';

function QuestionRow({index, question, onDownload, onCopyToClipboard, onModify} : IProps){

    return(
       <div className="historyItem questionItem" style={{borderBottom:'1px solid #22222211'}} key={'question' + index}>
            <div style={{height:'34px', width:'34px', borderRadius:'100%', border:'0px solid #000', flex:'0'}}>
                <img src={userIcon} width={32} style={{opacity:'0.6'}}/>
            </div>
            <div style={{width:'100%', display:'flex', alignItems:'center'}}>{question}</div>
            <div style={{display:'flex', flexDirection:'row', flexShrink:'0', columnGap:'8px'}}>
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