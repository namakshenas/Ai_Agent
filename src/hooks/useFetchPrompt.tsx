import { useState, useEffect } from "react";
import IPrompt from "../interfaces/IPrompt";
import IPromptResponse from "../interfaces/responses/IPromptResponse";
import PromptService from "../services/API/PromptService";

function useFetchPrompt(name : string | undefined){

    const genericPrompt : IPrompt = {name : "", prompt : "", version : "0.0.1"}
    const [prompt, setPrompt] = useState<IPrompt | IPromptResponse>({name : "", prompt : "", version : "0.0.1"});

    useEffect(() => {

        async function fetchPrompt(name : string) {
            const retrievedPrompt = await PromptService.getByName(name)
            if(retrievedPrompt == undefined) {
                return setPrompt(genericPrompt)
            }
            return setPrompt({...retrievedPrompt})
        }
        
        if(!name || name == "") return setPrompt(genericPrompt)
        fetchPrompt(name)
    }, []);

    return { prompt, setPrompt };
}

export default useFetchPrompt