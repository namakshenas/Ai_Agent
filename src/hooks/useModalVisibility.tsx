import { useEffect, useState } from "react"

function useModalVisibility(){
    const [modalVisibility, setModalVisibility] = useState<boolean>(false)

    useEffect(() => {
        if(modalVisibility) { window.addEventListener('scroll', noScroll) }
            else { window.removeEventListener('scroll', noScroll) }
        return () => {
            window.removeEventListener('scroll', noScroll)
        }

    }, [modalVisibility])

    function noScroll(){
        window.scrollTo(0, 0)
    }

    return {modalVisibility, setModalVisibility}
}

export default useModalVisibility