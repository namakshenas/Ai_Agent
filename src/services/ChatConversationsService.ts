import { IChatHistoryQAPair } from "../interfaces/IChatHistoryQAPair";


export class ChatConversationsService{

    static chatConversations : TChatConversation[] = [];
    // lastContext should be added too !!!! >> all context in reality so question can be modified

    static pushConversation(chatHistory : IChatHistoryQAPair[]){
        this.chatConversations.push(chatHistory);
        return;
    }

    static getConversation(id : number) : IChatHistoryQAPair[]{
        return this.chatConversations[id]
    }

    static deleteConversation(id : number){
        this.chatConversations.splice(id,1);
        return;
    }

    static updateConversation(id : number, chatHistory : IChatHistoryQAPair[]) {
        this.chatConversations[id] = chatHistory;
        return;
    }

    static getConversations(){
        return this.chatConversations;
    }

    static getNumberOfConversations() : number{
        return this.chatConversations.length
    }

    static clearAll(){
        this.chatConversations = []
    }
}

type TChatConversation = IChatHistoryQAPair[]