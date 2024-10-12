import { useEffect, useState } from "react";
import AgentService from "../services/API/AgentService";
import { AIAgent } from "../models/AIAgent";
import { ChatService } from "../services/ChatService";
import { AgentLibrary } from "../services/AgentLibrary";

function useFetchAgentsList(){
    const [AIAgentsList, setAIAgentsList] = useState<AIAgent[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {

        async function fetchAgentsList () {
            const retrievedAgentsList = await AgentService.getAll()
            if(retrievedAgentsList == null) return setAIAgentsList([])
            const AIAgents = retrievedAgentsList.map((agent) => new AIAgent({...agent, modelName : agent.model}))
            setAIAgentsList(AIAgents)
            AgentLibrary.addAgents(AIAgents)
            // set the first agent in DB as the active agent only if the agent currently active is the default one
            if(ChatService.getActiveAgent().getId() == "a0000000001") ChatService.setActiveAgent(AIAgents[0])
        }
        fetchAgentsList()
    }, [refreshTrigger]);

    const triggerAIAgentsListRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return { AIAgentsList, setAIAgentsList, triggerAIAgentsListRefresh };
}

export default useFetchAgentsList