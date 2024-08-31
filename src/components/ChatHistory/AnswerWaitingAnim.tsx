import { useEffect, useRef, useState } from "react"


export default function AnswerWaitingAnim() {

    const [dots, setDots] = useState<string>("...")
    const currentDots = useRef<string>("...")

    useEffect(() => {
        setInterval(() => {
            if(currentDots.current.length > 2){ currentDots.current = "" }
            setDots(currentDots.current + '.')
            currentDots.current += '.'
        }, 500);
    }, [])

    return (
        <div>{dots}</div>
    )
}
