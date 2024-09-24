// conversation = {question, answer : {md, html}, context}

export interface IConversation {
    name : string
    history : IConversationElement[]
    lastAgentUsed : string
    // should add displayed : yes/no so that intermediate COT steps could be hidden
    // should have last agent used
}

export interface IConversationElement{
    question : string
    answer : IConversationAnswer
    context : number[],
    sources : ISource[]
}

export interface IConversationAnswer{
    asMarkdown : string
    asHTML : string
}

export interface ISource{
    asMarkdown : string
    asHTML : string
}