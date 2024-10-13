/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import DocProcessorService from '../../services/DocProcessorService'
import DocProcessor from '../../services/DocProcessorService'
import './FormUploadFile.css'

export function FormUploadFile({memoizedSetModalStatus, setForceLeftPanelRefresh} : IProps){
   
    function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
        memoizedSetModalStatus({visibility : false})
    }

    function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault()
    }

    async function processFile({filename, content, filesize}: {filename : string, content : string, filesize : number}) {
        // console.log('processFile', filename, content, filesize)
        const chunkEmbeddings = await DocProcessorService.processTextFile(content)
        console.log('chunkEmbeddings : ', JSON.stringify(chunkEmbeddings))
    }

    function handleEvent(event: ProgressEvent<FileReader>, filename: string) {
        const { loaded, total } = event;
    
        console.log((loaded / total) * 100);
    
        if (event.type === "load") {
            const result = event.target?.result;
            if (typeof result === "string") {
                processFile({ filename: filename, content: result, filesize : total });
            }
        }
    }

    function addFileReaderListeners(reader : FileReader, filename : string) : void {
        reader.addEventListener("loadstart", (e) => handleEvent(e as ProgressEvent<FileReader>, filename));
        reader.addEventListener("load", (e) => handleEvent(e as ProgressEvent<FileReader>, filename));
        reader.addEventListener("loadend", (e) => handleEvent(e as ProgressEvent<FileReader>, filename));
        reader.addEventListener("progress", (e) => handleEvent(e as ProgressEvent<FileReader>, filename));
        reader.addEventListener("error", (e) => handleEvent(e as ProgressEvent<FileReader>, filename));
        reader.addEventListener("abort", (e) => handleEvent(e as ProgressEvent<FileReader>, filename));
    }

    async function handleFileSelect(e : React.ChangeEvent<HTMLInputElement>){
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0];
        const reader = new FileReader();

        addFileReaderListeners(reader, file.name);
        
        reader.readAsText(file)

        // Or use readAsArrayBuffer(file) for binary files
    }

    return(
    <div className="formUploadFileContainer">
        <form className='fileUploadForm'>
            <label>Choose a file to upload for RAG</label>
            <input onChange={handleFileSelect} type="file" id="fileInput"/>
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