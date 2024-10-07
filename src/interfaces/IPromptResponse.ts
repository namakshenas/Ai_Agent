import IPrompt from "./IPrompt"

export default interface IPromptResponse extends IPrompt {
    meta : {revision : number, created? : number, version? : number}
    $loki  : number
}