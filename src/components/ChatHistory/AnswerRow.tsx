import '../../style/ChatHistory.css'
import AnswerWaitingAnim from './AnswerWaitingAnim'
import computerIcon from '../../assets/chaticon8.png';
import downloadIcon from '../../assets/downloadicon2.png';
import stopIcon from '../../assets/stopicon.png';
import { ChatService } from '../../services/ChatService';
import './AnswerRow.css'
import { ISource } from '../../interfaces/IConversation';

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
                    <button className='iconButton'>
                        <img className="stopIcon" src={stopIcon} onClick={() => ChatService.abortStreaming()}/>
                    </button>
                    <button className='iconButton' onClick={() => onDownload(answer.toString())}>
                        <img className="clipboardIcon" src={downloadIcon}/>
                    </button>
                    <button className='iconButton' onClick={() => onCopyToClipboard(answer?.toString())}>
                        <svg style={{width:'16px', opacity:1}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg>
                    </button>
                </div>
            }
        </article>
    )
}

// if table first answer node, then no margin top

export default AnswerRow

interface IProps{
    index : number
    answer : string
    sources : ISource[]
    onDownload : (text : string) => void
    onCopyToClipboard : (text : string) => Promise<void>
}