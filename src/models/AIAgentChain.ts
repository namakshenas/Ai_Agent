import { AIAgent } from "./AIAgent";

// chain of responsability design pattern
export default class AgentChain{
    private firstAgent: AIAgent | null = null;

    addAgent(agent: AIAgent): AgentChain {
        if (!this.firstAgent) {
            this.firstAgent = agent
        } else {
            let currentAgent = this.firstAgent
            while (currentAgent.getNextAgent() != null) {
                currentAgent = currentAgent.getNextAgent() as AIAgent
            }
            currentAgent.setNextAgent(agent)
        }
        return this
    }

    process(request: string): Promise<string> {
        if (this.firstAgent) {
            return this.firstAgent.process(request)
        }
        throw new Error("The chain is empty.")
    }
}