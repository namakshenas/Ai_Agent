/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import DocService from '../../services/API/DocService'
import DocProcessorService from '../../services/DocProcessorService'
import './FormUploadFile.css'
import upload from '../../assets/upload2.png'

export function FormUploadFile({memoizedSetModalStatus, setForceLeftPanelRefresh} : IProps){

    const [progress, SetProgress] = useState(0)
   
    function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        memoizedSetModalStatus({visibility : false})
    }

    function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
    }

    async function processFile({filename, content, filesize}: {filename : string, content : string, filesize : number}) {
        const correctedFilesize = filesize * 1000 / 1100 // taking into account the fact that some spaces are lost
        // file splitting then embedding each chunk of text
        const textChunks = DocProcessorService.splitTextIntoChunks(content, 600)
        const textEmbeddings : {text : string, embeddings : number[]}[] = []
        for(const chunk of textChunks) {
            const chunkEmbeddings = await DocProcessorService.getEmbeddingsForChunk(chunk)
            textEmbeddings.push({...chunkEmbeddings})
            // update progress bar
            SetProgress(Math.floor(textEmbeddings.reduce((acc, chunk) => chunk.text.length + acc, 0) / correctedFilesize * 100))
        }
        // add metadatas to each embedding chunk
        await DocService.saveDocWithEmbeddings(textEmbeddings.map((chunkEmbedding) => (
            {...chunkEmbedding, metadatas : {filename, filesize}}
        )))
        setForceLeftPanelRefresh(prevValue => prevValue + 1)
        memoizedSetModalStatus({visibility : false})
    }

    function handleEvent(event: ProgressEvent<FileReader>, filename: string, filesize : number) {    
        if (event.type === "load") {
            const result = event.target?.result;
            if (typeof result === "string") {
                processFile({ filename: filename, content: result, filesize : filesize });
            }
        }
    }

    function addFileReaderListeners(reader : FileReader, filename : string, filesize : number) : void {
        reader.addEventListener("loadstart", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize));
        reader.addEventListener("load", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize));
        reader.addEventListener("loadend", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize));
        reader.addEventListener("progress", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize));
        reader.addEventListener("error", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize));
        reader.addEventListener("abort", (e) => handleEvent(e as ProgressEvent<FileReader>, filename, filesize));
    }

    async function handleFileSelect(e : React.ChangeEvent<HTMLInputElement>){
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0];
        const reader = new FileReader();

        addFileReaderListeners(reader, file.name, file.size);
        
        reader.readAsText(file) // Or use readAsArrayBuffer(file) for binary files

        const events = ["loadstart", "load", "loadend", "progress", "error", "abort"]
        events.forEach(eventType => {
            reader.removeEventListener(eventType, (e) => handleEvent(e as ProgressEvent<FileReader>, file.name, file.size))
        })
    }

    return(
    <div className="formUploadFileContainer">
        <form className='fileUploadForm'>
            <h3>Choose a file to upload for RAG</h3>
            <p>supported formats : txt, pdf, </p>
            <div className='uploadImageContainer'><img style={{width:'240px'}} src={upload}/></div>
            <input onChange={handleFileSelect} type="file" id="fileInput"/>
            <div className='progressBarContainer'>
                <div className='progressBar' style={{width : progress+'%'}}></div>
            </div>
            <div style={{display:'flex', columnGap:'12px', marginTop:'24px', width:'50%', justifySelf:'flex-end'}}>
                <button onClick={handleCancelClick} className="cancel-button purpleShadow">Cancel</button>
                <button onClick={handleSaveClick} className="save-button purpleShadow">Save</button>
            </div>
        </form>
    </div>
    )
}

interface IProps{
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
    setForceLeftPanelRefresh : React.Dispatch<React.SetStateAction<number>>
}