import '../../style/ChatHistory.css'
import AnswerWaitingAnim from './AnswerWaitingAnim'
import computerIcon from '../../assets/computericon2.png';
import clipboardIcon from '../../assets/clipboardicon2.png';
import downloadIcon from '../../assets/downloadicon2.png';
import retryIcon from '../../assets/reloadicon.png';

function AnswerRow({index, answer, onDownload, onCopyToClipboard} : IProps){

    return(
        <div className="historyItem" style={{backgroundColor:'#ffffff', color:'#000000dd'}} key={'answer' + index}>
            <div style={{height:'34px', width:'34px', borderRadius:'100%', border:'0px solid #000', flex:'0'}}>
                <img src={computerIcon} width={32} style={{opacity:'0.7', borderRadius:'100%', border:'1px solid #fff'}}/>
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