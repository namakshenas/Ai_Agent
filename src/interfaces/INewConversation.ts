// conversation = {question, answer : {md, html}, context}

export interface INewConversation {
    name : string
    history : IConversationElement[]
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