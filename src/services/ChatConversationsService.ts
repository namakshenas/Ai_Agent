import { IChatHistoryQAPair } from "../interfaces/IChatHistoryQAPair";
import { IConversation } from "../interfaces/IConversation";


export class ChatConversationsService{

    static chatConversations : IConversation[] = [];
    // lastContext should be added too !!!! >> all context in reality so question can be modified

    static pushNewConversation(name : string, history : IChatHistoryQAPair[]){
        this.chatConversations.push({name, history})
        return
    }

    static getConversation(id : number) : IConversation{
        return this.chatConversations[id]
    }

    static deleteConversation(id : number){
        this.chatConversations.splice(id,1)
        return
    }

    static replaceConversationHistory(conversationId : number, history : IChatHistoryQAPair[]) {
        this.chatConversations[conversationId].history = history
        return
    }

    static pushHistoryToConversation(id : number, history : IChatHistoryQAPair[]) {
        this.chatConversations[id] = {...this.getConversation(id), history}
        return
    }

    static getConversations(){
        return this.chatConversations;
    }

    static renameConversation(id : number, newName : string){
        this.chatConversations[id] = {...this.getConversation(id), name : newName }
        return
    }

    static getNumberOfConversations() : number{
        return this.chatConversations.length
    }

    static clearAll(){
        this.chatConversations = []
    }
}