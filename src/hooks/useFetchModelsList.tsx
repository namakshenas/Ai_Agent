import { useEffect, useState } from "react";
import { OllamaService } from "../services/OllamaService";

function useFetchModelsList(){
    const [modelsList, setModelsList] = useState<string[]>([])

    useEffect(() => {

        async function fetchModelsList () {
            try {
                // listing all the models installed on the users machine
                const modelList = await OllamaService.getModelList()
                if(modelList != null) {
                    const ml = modelList?.models.map((model) => model?.model)
                    setModelsList(ml.filter((model : string) => !model.includes("embed")))
                }
            } catch (error) {
                console.error("Error fetching models list:", error)
            }
        }
        
        fetchModelsList()
    }, []);

    return modelsList;
}

export default useFetchModelsList;