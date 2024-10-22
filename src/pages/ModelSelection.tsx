/* eslint-disable @typescript-eslint/no-unused-vars */
import Select, { IOption } from "../components/CustomSelect/Select";
import useFetchModelsList from "../hooks/useFetchModelsList";
import '../style/ModelSelection.css'
import { useNavigate } from 'react-router-dom'
import osspitabanner from '../assets/osspitabanner3.png'
import { useEffect, useState } from "react";
import AgentService from "../services/API/AgentService";
import useFetchAgentsList from "../hooks/useFetchAgentsList";

export default function ModelSelection(){

    const modelsList = useFetchModelsList("includes-embedding-models")
    const { AIAgentsList } = useFetchAgentsList()

    const navigate = useNavigate()

    const [selectedModels, setSelectedModels] = useState({complex : "", trivial : "", embedding : ""})
    useEffect(() => {
        setSelectedModels({
            complex : AIAgentsList.find(agent => agent.getName() == "baseAssistant")?.getModelName() || modelsList[0], 
            trivial : AIAgentsList.find(agent => agent.getName() == "searchQueryOptimizer")?.getModelName() || modelsList[0], 
            embedding : modelsList[0]
        })
    }, [AIAgentsList])

    function handleSwitchComplexModel(option : IOption){
        setSelectedModels(prevModels => ({...prevModels, complex : option.value}))
    }

    function handleSwitchTrivialModel(option : IOption){
        setSelectedModels(prevModels => ({...prevModels, trivial : option.value}))
    }

    function handleSwitchEmbeddingModel(option : IOption){
        setSelectedModels(prevModels => ({...prevModels, embedding : option.value}))
    }

    async function handleSave(e : React.MouseEvent){
        e.preventDefault();
        // const agentsName = AgentService.getAgentsNameList()
        AgentService.updateAgentsConfig({advancedModel : selectedModels.complex, basicModel : selectedModels.trivial, embeddingModel : selectedModels.embedding})
        navigate('/chat')
    }

    return(
        <main className="selectPage">
            <div className="panelsContainer">
                <div style={{textAlign:'left'}} className="containerLeft">
                    <img src={osspitabanner}></img>
                    {/*<figure><span>OSspita for</span> <img src={ollama}/></figure>*/}
                    <h1 style={{fontSize:'24px', color:'#252525', textAlign:'center', margin:'1.25rem 0 1rem 0', opacity:'0.9'}}>Welcome, Stranger!</h1>
                    <p>I - You don't know where to start? Our models recommendations :</p>
                    <table style={{marginTop:'0.25rem'}}>
                        <thead><tr><th>GPU VRAM</th><th>Model</th><th>Purpose</th><th>Link</th></tr></thead>
                        <tbody>
                            <tr><td>4GB</td><td>Llama 3.2:3b</td><td>Conversational</td><td><a target="_blank" href="https://ollama.com/library/llama3.2">Llama 3.2 on Ollama</a></td></tr>
                            <tr><td>8GB</td><td>Llama 3.1:8b</td><td>Conversational</td><td><a target="_blank" href="https://ollama.com/library/llama3.1">Llama 3.1 on Ollama</a></td></tr>
                            <tr><td>12GB</td><td>Mistral Nemo:12b</td><td>Conversational</td><td><a target="_blank" href="https://ollama.com/library/mistral-nemo">Mistal Nemo on Ollama</a></td></tr>
                            <tr><td>4GB</td><td>starcoder2:3b</td><td>Coding</td><td><a target="_blank" href="https://ollama.com/library/starcoder2">Starcoder 2 on Ollama</a></td></tr>
                            <tr><td>8GB & 12GB</td><td>qwen2.5-coder:7b</td><td>Coding</td><td><a target="_blank" href="https://ollama.com/library/qwen2.5-coder">Qwen 2.5 Coder on Ollama</a></td></tr>
                            <tr><td>N/A</td><td>nomic-embed-text</td><td>RAG</td><td><a target="_blank" href="https://ollama.com/library/nomic-embed-text">Nomic Embed Text on Ollama</a></td></tr>
                        </tbody>
                    </table>
                    <p style={{textAlign:'left', marginTop: '1rem'}}>II - The backend of Osspita isn't installed yet?</p>
                    <div className="pullCommands">
                                &gt; cd back<br/>
                                &gt; npm install<br/>
                                &gt; ./run
                    </div>
                </div>
                <div className="containerRight">
                {modelsList?.length > 0 && 
                        <>
                            <h2 style={{textAlign:'left', opacity:'0.9'}}>Initial Configuration</h2>
                            <p style={{textAlign:'left', marginTop:'0'}}>Our default prompts work best with <b>mistral-nemo:12b</b>, <b>llama3.2:3b</b> & <b>nomic-embed-text</b>.</p>
                            <p style={{textAlign:'left'}}>Use these command lines to retrieve the models you selected :</p>
                            <div className="pullCommands">
                                &gt; ollama pull llama3.2:3b<br/>
                                &gt; ollama pull nomic-embed-text<br/>
                                &gt; ollama pull mistral-nemo
                            </div>
                            <hr style={{marginTop:'1rem', borderStyle:"dashed", opacity:'0.2', borderTop:'none'}}/>
                            <label id="labelComplexModelName">1. Complex tasks model <span style={{fontWeight:'400'}}>// [ mistral-nemo:12b & 12GB VRAM recommended ]</span></label>
                            <Select 
                                width="100%"
                                options={modelsList.map((model) => ({ label: model, value: model }))} 
                                defaultOption={selectedModels.complex}
                                labelledBy="labelComplexModelName" 
                                id="complexModelName"
                                onValueChange={handleSwitchComplexModel}
                            />
                            <hr style={{marginTop:'1.5rem', borderStyle:"dashed", opacity:'0.2', borderTop:'none'}}/>
                            <label id="labelTrivialModelName">2. Trivial tasks model <span style={{fontWeight:'400'}}>// [ llama3.2:3b recommended ]</span></label>
                            <Select 
                                width="100%"
                                options={modelsList.map((model) => ({ label: model, value: model }))} 
                                defaultOption={selectedModels.trivial}
                                labelledBy="labelTrivialModelName" 
                                id="trivialModelName"
                                onValueChange={handleSwitchTrivialModel}
                            />
                            <hr style={{marginTop:'1.5rem', borderStyle:"dashed", opacity:'0.2', borderTop:'none'}}/>
                            {/*<label id="labelTrivialModelName">3. Embeddings generation model <span style={{fontWeight:'400'}}>// [ nomic-embed-text recommended ]</span></label>
                            <Select 
                                width="100%"
                                options={modelsList.map((model) => ({ label: model, value: model }))} 
                                defaultOption={modelsList.includes("nomic-embed-text:latest") ? "nomic-embed-text:latest" : selectedModels.trivial}
                                labelledBy="labelTrivialModelName" 
                                id="trivialModelName"
                                onValueChange={handleSwitchEmbeddingModel}
                            />*/}
                            <button className="save purpleShadow" onClick={handleSave}>Save</button>
                        </>}
                    {
                        (!modelsList?.length || modelsList == null) && 
                        <div className="alert"><span>You need to install Ollama and at least one model to access OSspita.</span><br/>
                            <a style={{display:'block', marginTop:'0.75rem'}} target="_blank" href="https://ollama.com/download">Click here to download Ollama</a>
                            <hr style={{marginTop:'2.5rem'}}/>
                            <div>PS : If Ollama is already installed then execute : ollama serve and refresh the page.</div>
                        </div>
                    }
                </div>
            </div>
        </main>
    )
}