export default interface IFormStructure{
    agentName : string
    modelName : string
    systemPrompt : string
    temperature : number
    maxContextLength : number
    webSearchEconomy : boolean
    maxTokensPerReply : number
}