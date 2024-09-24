import { IModelDetails } from "./IModelDetails";

export interface IListModelResponse {
        models : IModelInfos[]
}

interface IModelInfos{
        name: string;
        model: string;
        modifiedAt: Date;
        size: number;
        digest: string;
        details?: IModelDetails;  
}