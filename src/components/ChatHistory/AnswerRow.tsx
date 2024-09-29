/* eslint-disable @typescript-eslint/no-unused-vars */
import '../../style/ChatHistory.css'
import AnswerWaitingAnim from './AnswerWaitingAnim'
import computerIcon from '../../assets/chaticon9.png';
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
            <figure className={ answer == "" ? "actorFigureAnimation" : ""}>
                <img className="actorIcon" src={computerIcon}/>
            </figure>
            {
                answer == '' ? <AnswerWaitingAnim/> : <div className='answerContainer' dangerouslySetInnerHTML={{ __html: (answer?.toString() + convertSourcesArrayToHTML(sources)) || "" }}></div>
            }
            {   answer &&
                <div className='answerIconsContainer'>
                    {<button className='iconButton'>
                        <svg width="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/>
                        </svg>
                    </button>}
                    <button className='iconButton' onClick={() => onCopyToClipboard(answer?.toString())}>
                        <svg width="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M96 352L96 96c0-35.3 28.7-64 64-64l256 0c35.3 0 64 28.7 64 64l0 197.5c0 17-6.7 33.3-18.7 45.3l-58.5 58.5c-12 12-28.3 18.7-45.3 18.7L160 416c-35.3 0-64-28.7-64-64zM272 128c-8.8 0-16 7.2-16 16l0 48-48 0c-8.8 0-16 7.2-16 16l0 32c0 8.8 7.2 16 16 16l48 0 0 48c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-48 48 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16l-48 0 0-48c0-8.8-7.2-16-16-16l-32 0zm24 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-160 0C60.9 512 0 451.1 0 376L0 152c0-13.3 10.7-24 24-24s24 10.7 24 24l0 224c0 48.6 39.4 88 88 88l160 0z"/>
                        </svg>
                    </button>
                    <button className='iconButton'>
                        <svg style={{width:'16px', opacity:1}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg>
                    </button>
                </div>
            }
        </article>
    )
}

// if table first answer node, then no margin top
// onClick={() => onDownload(answer.toString())}

export default AnswerRow

interface IProps{
    index : number
    answer : string
    sources : ISource[]
    onDownload : (text : string) => void
    onCopyToClipboard : (text : string) => Promise<void>
}