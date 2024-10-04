import { useState, useEffect } from "react";

function usePingAPI(){
    const [isAPIOffline, setIsAPIOffline] = useState<boolean>(false);

    useEffect(() => {

        async function fetchPing() {
            try{
                const response = await fetch("http://127.0.0.1/ping", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if(response.ok) return setIsAPIOffline(false)
                return setIsAPIOffline(true)
            }catch(error){
                console.error("error : " + error)
                return setIsAPIOffline(true)
            }
        }
        fetchPing()
    }, []);

    return isAPIOffline;
}

export default usePingAPI