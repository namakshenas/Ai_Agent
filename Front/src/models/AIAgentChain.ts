/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIAgent } from "./AIAgent";

// chain of responsability design pattern
export default class AgentChain{
    private static agents: AIAgent[] = [];

    static process(){
        this.agents[0].update("")
    }
}