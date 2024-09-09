import '../../style/ChatHistory.css'
import AnswerWaitingAnim from './AnswerWaitingAnim'
import computerIcon from '../../assets/chaticon8.png';
import clipboardIcon from '../../assets/clipboardicon2.png';
import downloadIcon from '../../assets/downloadicon2.png';
import stopIcon from '../../assets/stopicon.png';
import { ChatService } from '../../services/ChatService';
import './AnswerRow.css'
// import 'highlight.js/styles/default.css';

function AnswerRow({index, answer, onDownload, onCopyToClipboard} : IProps){

    return(
        <div className="historyItem" style={{backgroundColor:'#ffffff', color:'#000000dd'}} key={'answer' + index}>
            <div style={{height:'32px', width:'32px', borderRadius:'100%', border:'1px solid #56987ecc', outline:'2px solid #56987ecc', flexShrink:'0', display:'flex', justifyContent:'center', alignItems:'center'}}>
                <img className="actorIcon" src={computerIcon} width={32} style={{opacity:'0.60', filter: 'saturate(75%)'}}/>
            </div>
            {
                answer == '' ? <AnswerWaitingAnim/> : <div className='answerContainer' dangerouslySetInnerHTML={{ __html: answer?.toString() || "" }}></div>
            }
            {   answer &&
                <div className='answerIconsContainer'>
                    <div className='iconButton' role="button">
                        {/*<svg style={{width:'30px'}} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="-2 -2 24 24" onClick={() => ChatService.abortStreaming()}><path fill="currentColor" d="M5.094 16.32A8 8 0 0 0 16.32 5.094zM3.68 14.906L14.906 3.68A8 8 0 0 0 3.68 14.906M10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10s-4.477 10-10 10"/></svg>*/}
                        <img className="stopIcon" src={stopIcon} onClick={() => ChatService.abortStreaming()}/>
                    </div>
                    <div className='iconButton' role="button"><img className="clipboardIcon" src={downloadIcon} onClick={() => onDownload(answer.toString())}/></div>
                    <div className='iconButton' role="button"><img className="clipboardIcon" src={clipboardIcon} onClick={() => onCopyToClipboard(answer?.toString())}/></div>
                </div>
            }
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