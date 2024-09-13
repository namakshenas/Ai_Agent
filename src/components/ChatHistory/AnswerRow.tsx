import '../../style/ChatHistory.css'
import AnswerWaitingAnim from './AnswerWaitingAnim'
import computerIcon from '../../assets/chaticon8.png';
import clipboardIcon from '../../assets/clipboardicon2.png';
import downloadIcon from '../../assets/downloadicon2.png';
import stopIcon from '../../assets/stopicon.png';
import { ChatService } from '../../services/ChatService';
import './AnswerRow.css'

function AnswerRow({index, answer, onDownload, onCopyToClipboard} : IProps){

    return(
        <article className="historyItem answerItem" key={'answer' + index}>
            <figure className={ answer=="" ? "actorFigureAnimation" : ""}>
                <img className="actorIcon" src={computerIcon} width={32} style={{opacity:'0.60', filter: 'saturate(75%)'}}/>
            </figure>
            {
                answer == '' ? <AnswerWaitingAnim/> : <div className='answerContainer' dangerouslySetInnerHTML={{ __html: answer?.toString() || "" }}></div>
            }
            {   answer &&
                <div className='answerIconsContainer'>
                    <div className='iconButton' role="button">
                        <img className="stopIcon" src={stopIcon} onClick={() => ChatService.abortStreaming()}/>
                    </div>
                    <div className='iconButton' role="button"><img className="clipboardIcon" src={downloadIcon} onClick={() => onDownload(answer.toString())}/></div>
                    <div className='iconButton' role="button"><img className="clipboardIcon" src={clipboardIcon} onClick={() => onCopyToClipboard(answer?.toString())}/></div>
                </div>
            }
        </article>
    )
}

export default AnswerRow

interface IProps{
    index : number
    answer : string
    onDownload : (text : string) => void
    onCopyToClipboard : (text : string) => Promise<void>
}