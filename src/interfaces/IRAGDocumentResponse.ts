import { IRAGDocument } from "./IRAGDocument"

export interface IRAGDocumentResponse extends IRAGDocument{
    id : number
    filename : string
    size : number
    selected : boolean
    meta : {revision : number, created? : number, version? : number}
    $loki  : number
}