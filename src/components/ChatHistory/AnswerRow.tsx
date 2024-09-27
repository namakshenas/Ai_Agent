import '../../style/ChatHistory.css'
import AnswerWaitingAnim from './AnswerWaitingAnim'
import computerIcon from '../../assets/chaticon9.png';
import downloadIcon from '../../assets/downloadicon2.png';
import './AnswerRow2.css'
import { ISource } from '../../interfaces/IConversation';

function AnswerRow({index, answer, sources, onDownload, onCopyToClipboard} : IProps){

    // !!! should sanitize source
    function convertSourcesArrayToHTML(sourcesArray : ISource[]) : string{
        if(sourcesArray.length == 0) return ''
        return sourcesArray.reduce((acc, source) => acc + source.asHTML + '<br>', '<hr style="opacity:0.3; margin:1.15rem 0 0.5rem 0;"><span style="font-size:14px; font-weight:600; text-decoration:underline;">Sources :</span><br>').slice(0, -4)
    }

    return(
        <article className="historyItem answerItem" key={'answer' + index} id={'answer' + index}>
            <figure className={ answer=="" ? "actorFigureAnimation" : ""}>
                <img className="actorIcon" src={computerIcon} style={{opacity:'0.9', filter: 'saturate(85%)'}}/>
            </figure>
            {
                answer == '' ? <AnswerWaitingAnim/> : <div className='answerContainer' dangerouslySetInnerHTML={{ __html: (answer?.toString() + convertSourcesArrayToHTML(sources)) || "" }}></div>
            }
            {   answer &&
                <div className='answerIconsContainer'>
                    <button className='iconButton'>
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 16C5.76667 16 3.875 15.225 2.325 13.675C0.775 12.125 0 10.2333 0 8C0 5.76667 0.775 3.875 2.325 2.325C3.875 0.775 5.76667 0 8 0C9.15 0 10.25 0.237333 11.3 0.712C12.35 1.18667 13.25 1.866 14 2.75V1C14 0.447715 14.4477 0 15 0V0C15.5523 0 16 0.447715 16 1V6C16 6.55228 15.5523 7 15 7H10C9.44772 7 9 6.55228 9 6V6C9 5.44772 9.44772 5 10 5H13.2C12.6667 4.06667 11.9377 3.33333 11.013 2.8C10.0883 2.26667 9.084 2 8 2C6.33333 2 4.91667 2.58333 3.75 3.75C2.58333 4.91667 2 6.33333 2 8C2 9.66667 2.58333 11.0833 3.75 12.25C4.91667 13.4167 6.33333 14 8 14C9.28333 14 10.4417 13.6333 11.475 12.9C12.3124 12.3057 12.9472 11.5583 13.3797 10.6576C13.564 10.2737 13.9355 10 14.3613 10H14.4515C15.1076 10 15.588 10.6245 15.326 11.226C14.795 12.4457 13.9863 13.4787 12.9 14.325C11.4667 15.4417 9.83333 16 8 16Z" fill="#545454"/>
                        </svg>
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