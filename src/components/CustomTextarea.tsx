/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";

function CustomTextarea ({textareaValue, setTextareaValue, currentContext} : IProps) {

    const editableSpanRef = useRef<HTMLDivElement | null>(null)
    const fakeTextareaRef = useRef<HTMLDivElement | null>(null)
    const [suggestion, _setSuggestion] = useState("")
    const suggestionRef = useRef("")
    const cursorPosition = useRef(0)

    function setSuggestion(text : string) {
        suggestionRef.current = text
        _setSuggestion(text)
    }

    useEffect(() => {
        window.addEventListener('keydown', applyAutoCompleteOnTabPress)

        return () => window.removeEventListener('keydown', applyAutoCompleteOnTabPress)
    }, [])

    // move the cursor at the right position after a character has been inputed into the editable span
    // without this useeffect, the cursor position would be reseted back at position 0
    useEffect(() => {
        setCursorPosition(cursorPosition.current)
    },[textareaValue])


    async function askAutoComplete(sentence : string){
        /*console.log('sentence to complete : ' + sentence)
        const response = await ChatService.askTheActiveModelForAutoComplete(sentence, currentContext || [])
        setSuggestion(response.response)*/
    }

    function applyAutoCompleteOnTabPress(event : KeyboardEvent){
        if(document.activeElement?.id == "editableSpan" && event.key === 'Tab') {
            event.preventDefault();
            setTextareaValue((prevValue : string) => prevValue + suggestionRef.current)
            setSuggestion("")
        }
    }

    function setCursorAtEnd(){
        const range = document.createRange();
        const selection = window.getSelection();
        if(!selection || !editableSpanRef.current) return
        range.selectNodeContents(editableSpanRef.current) // select the whole text
        range.collapse(false) // collapse the range to the end point
        selection.removeAllRanges() // clear all existing selections
        selection.addRange(range) // add the range as a selection
    }

    function getCursorPosition(){
        const selection = window.getSelection()
        if(!selection || !editableSpanRef.current || !editableSpanRef.current.textContent) return 0
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange()
        preCaretRange.selectNodeContents(editableSpanRef.current as HTMLSpanElement)
        preCaretRange.setEnd(range.endContainer, range.endOffset)
        return preCaretRange.toString().length
    }

    const setCursorPosition = (position: number) => {
        const selection = window.getSelection();
        const editableSpan = editableSpanRef.current;
        if (!selection || !editableSpan) return;
      
        const textNode = editableSpan.firstChild;
      
        // Ensure the text node exists and is a text node
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const textContent = textNode.textContent || '';
          
          // Clamp the position to be within the text content length
          const clampedPosition = Math.max(0, Math.min(position, textContent.length));
          const range = document.createRange();
          range.setStart(textNode, clampedPosition);
          range.setEnd(textNode, clampedPosition);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      };

    function handleInput(text : string){
        cursorPosition.current = getCursorPosition()
        setTextareaValue(text)
        askAutoComplete(text)
    }
    
    return(
        <>
            <span className="textAreaTitle">Input</span>
            <div className="textArea" role="textbox" ref={fakeTextareaRef}
                onClick={(e) => {
                    if (editableSpanRef.current) {
                        e.currentTarget.style.outline = '2px solid #2292ee'
                        editableSpanRef.current.focus();
                        // setCursorAtEnd()
                    }
                }}>
                    <div id="editableSpan" style={{border:'none', outline:'none', color:'#000'}} ref={editableSpanRef} contentEditable="true" suppressContentEditableWarning={true}
                    onInput={(e) => handleInput((e.target as HTMLDivElement).innerText)}
                    onBlur={() => {(fakeTextareaRef.current as HTMLDivElement).style.outline = 'none'}}
                    >{textareaValue}</div>
                    <span style={{color:'#000000aa'}}>{suggestion}</span>
            </div>
        </>
    )
}

export default CustomTextarea

interface IProps{
    textareaValue : string
    setTextareaValue : React.Dispatch<React.SetStateAction<string>>
    currentContext : number[]
}


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

// https://phuoc.ng/collection/html-dom/get-or-set-the-cursor-position-in-a-content-editable-element/