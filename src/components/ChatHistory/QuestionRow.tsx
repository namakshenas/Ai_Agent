import '../../style/ChatHistory.css'
import userIcon from '../../assets/usericon5.png';
import clipboardIcon from '../../assets/clipboardicon2.png';
import downloadIcon from '../../assets/downloadicon2.png';

function QuestionRow({index, question, onDownload, onCopyToClipboard} : IProps){

    return(
       <div className="historyItem" style={{backgroundColor:'#eeeeeebb', color:'#000000dd'}} key={'question' + index}>
            <div style={{height:'34px', width:'34px', borderRadius:'100%', border:'0px solid #000', flex:'0'}}>
                <img src={userIcon} width={32} style={{opacity:'0.6'}}/>
            </div>
            <div style={{width:'100%', display:'flex', alignItems:'center'}}>{question}</div>
            <div style={{display:'flex', flexDirection:'row', flexShrink:'0', columnGap:'8px', opacity:'0.6'}}>
                <img className="clipboardIcon" src={downloadIcon} onClick={() => onDownload(question)}/>
                <img className="clipboardIcon" src={clipboardIcon} onClick={() => onCopyToClipboard(question)}/>
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