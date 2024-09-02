import { IChatHistoryQAPair } from "../interfaces/IChatHistoryQAPair";


export class ChatSessionsService{

    static chatSessions : IChatHistoryQAPair[] = [];
    // lastContext should be added too

    static pushSession(chatHistory : IChatHistoryQAPair){
        this.chatSessions.push(chatHistory);
        return;
    }

    static getSession(id : number) : IChatHistoryQAPair{
        return this.chatSessions[id]
    }

    static deleteSession(id : number){
        this.chatSessions.splice(id,1);
        return;
    }

    static updateSession(id : number, chatHistory : IChatHistoryQAPair) {
        this.chatSessions[id] = chatHistory;
        return;
    }
}