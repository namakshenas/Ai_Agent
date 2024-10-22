import { IConversationElement, IConversation } from "../interfaces/IConversation";

export class ConversationsRepository{

    static chatConversations : IConversation[] = [];

    static pushNewConversation(name : string, history : IConversationElement[], lastAgentUsed : string, lastModelUsed : string){
        this.chatConversations.push({name, history, lastAgentUsed, lastModelUsed})
        return
    }

    static getConversation(id : number) : IConversation{
        return this.chatConversations[id]
    }

    static getConversationHistory(id : number){
        return this.chatConversations[id].history
    }

    static getConversationName(id : number){
        return this.chatConversations[id].name
    }

    static deleteConversation(id : number){
        this.chatConversations.splice(id,1)
        return
    }

    static replaceConversation(conversationId : number, conversation : IConversation) {
        this.chatConversations[conversationId] = conversation
        return
    }

    static replaceConversationHistoryById(id : number, history : IConversationElement[]){
        this.chatConversations[id].history = history
    }

    static pushConversationElementToTargetConversation(id : number, element : IConversationElement) {
        this.chatConversations[id].history.push(element)
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