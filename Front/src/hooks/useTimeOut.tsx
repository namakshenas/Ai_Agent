import { useRef, useEffect } from "react";

export default function useTimeOut(callback : () => unknown, delay : number) {

    const timeoutRef = useRef<null | NodeJS.Timeout>(null);
  
    useEffect(() => {
      timeoutRef.current = setTimeout(callback, delay);
  
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [callback, delay]);
  
    return timeoutRef;
  }