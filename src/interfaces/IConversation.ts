import { IChatHistoryQAPair } from "./IChatHistoryQAPair"

export interface IConversation{
    name : string
    history : Array<IChatHistoryQAPair>
}