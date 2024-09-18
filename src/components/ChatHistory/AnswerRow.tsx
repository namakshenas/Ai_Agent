import '../../style/ChatHistory.css'
import AnswerWaitingAnim from './AnswerWaitingAnim'
import computerIcon from '../../assets/chaticon8.png';
import clipboardIcon from '../../assets/clipboardicon2.png';
import downloadIcon from '../../assets/downloadicon2.png';
import stopIcon from '../../assets/stopicon.png';
import { ChatService } from '../../services/ChatService';
import './AnswerRow.css'
import { ISource } from '../../interfaces/INewConversation';

function AnswerRow({index, answer, sources, onDownload, onCopyToClipboard} : IProps){

    // !!! should sanitize source
    function convertSourcesArrayToHTML(sourcesArray : ISource[]) : string{
        if(sourcesArray.length == 0) return ''
        return sourcesArray.reduce((acc, source) => acc + source.asHTML + '<br>', '<br><span style="font-weight:600; text-decoration:underline;">Sources :</span><br>').slice(0, -4)
    }

    return(
        <article className="historyItem answerItem" key={'answer' + index} id={'answer' + index}>
            <figure className={ answer=="" ? "actorFigureAnimation" : ""}>
                <img className="actorIcon" src={computerIcon} width={32} style={{opacity:'0.60', filter: 'saturate(75%)'}}/>
            </figure>
            {
                answer == '' ? <AnswerWaitingAnim/> : <div className='answerContainer' dangerouslySetInnerHTML={{ __html: (answer?.toString() + convertSourcesArrayToHTML(sources)) || "" }}></div>
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
    sources : ISource[]
    onDownload : (text : string) => void
    onCopyToClipboard : (text : string) => Promise<void>
}