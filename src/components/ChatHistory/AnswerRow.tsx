import '../../style/ChatHistory.css'
import AnswerWaitingAnim from './AnswerWaitingAnim'
import computerIcon from '../../assets/chaticon8.png';
import clipboardIcon from '../../assets/clipboardicon2.png';
import downloadIcon from '../../assets/downloadicon2.png';
import retryIcon from '../../assets/reloadicon.png';

function AnswerRow({index, answer, onDownload, onCopyToClipboard} : IProps){

    return(
        <div className="historyItem" style={{backgroundColor:'#ffffff', color:'#000000dd'}} key={'answer' + index}>
            <div style={{height:'32px', width:'32px', borderRadius:'100%', border:'1px solid #56987ecc', outline:'2px solid #56987ecc', flexShrink:'0', display:'flex', justifyContent:'center', alignItems:'center'}}>
                <img className="actorIcon" src={computerIcon} width={32} style={{opacity:'0.60', filter: 'saturate(75%)'}}/>
            </div>
            {
                answer == '' ? <AnswerWaitingAnim/> : <div style={{width:'100%'}}>{answer}</div>
            }
            <div style={{display:'flex', flexDirection:'row', flexShrink:'0', columnGap:'8px'}}>
                <div style={{opacity:0.2, cursor:'default'}} className='iconButton' role="button"><img className="clipboardIcon" src={retryIcon}/></div>
                <div className='iconButton' role="button"><img className="clipboardIcon" src={downloadIcon} onClick={() => onDownload(answer)}/></div>
                <div className='iconButton' role="button"><img className="clipboardIcon" src={clipboardIcon} onClick={() => onCopyToClipboard(answer)}/></div>
            </div>
        </div>
    )
}

export default AnswerRow

interface IProps{
    index : number
    answer : string
    onDownload : (text : string) => void
    onCopyToClipboard : (text : string) => Promise<void>
}

/// should use factory method