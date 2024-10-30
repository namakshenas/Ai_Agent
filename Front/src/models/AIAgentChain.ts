import { AIAgent } from "./AIAgent";

// chain of responsability design pattern
export default class AgentChain{
    private firstAgent: AIAgent | null = null;

    addAgent(agent: AIAgent): AgentChain {
        if (!this.firstAgent) {
            this.firstAgent = agent
        } else {
            // go down the chain as long as there is a next agent
            let currentAgent = this.firstAgent
            while (currentAgent.getNextAgent() != null) {
                currentAgent = currentAgent.getNextAgent() as AIAgent
            }
            // when there is no next agent, add a new agent to the last agent
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