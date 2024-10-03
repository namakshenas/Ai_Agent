/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, useEffect, useRef } from 'react'
import './Modal.css'

function Modal({children, modalVisibility, memoizedSetModalStatus, /*modalContent,*/ containerCSSClass} : IProps){

    const dialogRef = useRef<HTMLDialogElement>(null)
    const modalVisibilityRef = useRef<boolean>(modalVisibility)
    
    useEffect(() => {
        if(modalVisibilityRef && !dialogRef.current?.open) return dialogRef.current?.showModal()
        if(!modalVisibilityRef && dialogRef.current?.open) return dialogRef.current?.close()
    })
    
    // needs to pass setModalVisibility to modalContent
    return (
        <dialog data-testid="modal" ref={dialogRef} 
            onClick={(e) => { if (e.target === dialogRef.current) memoizedSetModalStatus({visibility : false}) }} 
            onCancel={(e) => e.preventDefault()}>
                <div className='modalHorizPadding'></div>
                <div className='modalVertPaddingNChildrenContainer'>
                    <div className='modalVertPadding'></div>
                    {children}
                    <div className='modalVertPadding'></div>
                </div>
                <div className='modalHorizPadding'></div>
        </dialog> 
    )
}

export default Modal

interface IProps{
    children: ReactNode
    modalVisibility : boolean
    // modalContent : JSX.Element
    containerCSSClass? : string
    memoizedSetModalStatus : ({visibility, contentId} : {visibility : boolean, contentId? : string}) => void
}