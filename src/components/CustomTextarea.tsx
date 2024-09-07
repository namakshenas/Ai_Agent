/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef } from "react";

function CustomTextarea ({textareaValue, setTextareaValue} : IProps) {

    const editableSpanRef = useRef<HTMLSpanElement | null>(null)
    const fakeTextareaRef = useRef<HTMLDivElement | null>(null)

    // const localRef = useRef()

    // Expose methods to the parent
    /*useImperativeHandle(ref, () => ({
      setTextareaValue: (text : string) => {
       if(editableSpanRef.current) editableSpanRef.current.innerText = text;
      },
      getTextareaValue: () => {
        if(!editableSpanRef.current) return ""
        return editableSpanRef.current.innerText
      },
    }));*/

    function setCursorAtEnd(){
        const range = document.createRange();
        const selection = window.getSelection();
        if(!selection || !editableSpanRef.current) return
        range.selectNodeContents(editableSpanRef.current) // select the whole text
        range.collapse(false) // collapse the range to the end point
        selection.removeAllRanges() // clear all existing selections
        selection.addRange(range) // add the range as a selection
    }

    function handleInput(text : string){
        setTextareaValue(text)
        setCursorAtEnd()
    }
    
    return(
        <>
            <span className="textAreaTitle">Input</span>
            <div className="textArea" role="textbox" ref={fakeTextareaRef}
                onClick={(e) => {
                    if (editableSpanRef.current) {
                        e.currentTarget.style.outline = '2px solid #2292ee'
                        editableSpanRef.current.focus();
                    }
                }}>
                    <span style={{border:'none', outline:'none', color:'#000'}} ref={editableSpanRef} contentEditable="true" suppressContentEditableWarning={true}
                    onInput={(e) => handleInput((e.target as HTMLSpanElement).innerText)}
                    onBlur={() => {(fakeTextareaRef.current as HTMLDivElement).style.outline = 'none'}}
                    >{textareaValue}</span>
                    <span style={{color:'#000000aa'}}>suggestion</span>
            </div>
        </>
    )
}

export default CustomTextarea

interface IProps{
    textareaValue : string
    setTextareaValue : (text : string) => void
}