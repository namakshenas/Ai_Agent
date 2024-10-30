export default interface IPrompt {
    id? : string
    name : string
    prompt : string
    version : string
    /*meta? : {revision : number, created? : number, version? : number}
    $loki?  : number*/
}
// {"name":"defaultAssistantPrompt","prompt":"You are an helpful assistant.","meta":{"revision":0,"created":1727917753940,"version":0},"$loki":2}