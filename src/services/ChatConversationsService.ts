import { IConversationElement, INewConversation } from "../interfaces/INewConversation";


export class ChatConversationsService{

    static chatConversations : INewConversation[] = [];

    static pushNewConversation(name : string, history : IConversationElement[]){
        this.chatConversations.push({name, history})
        return
    }

    static getConversation(id : number) : INewConversation{
        return this.chatConversations[id]
    }

    static deleteConversation(id : number){
        this.chatConversations.splice(id,1)
        return
    }

    static replaceConversation(conversationId : number, conversation : INewConversation) {
        this.chatConversations[conversationId] = conversation
        return
    }

    static replaceTargetConversationHistory(id : number, history : IConversationElement[]){
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