/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useReducer } from "react"
import { INewConversation } from "../interfaces/INewConversation"

export function useConversationReducer() {

    const conversationStateRef = useRef<INewConversation>({name : "conversation0", history : []})

    function conversationReducer(state : INewConversation, action : TAction){
        switch(action.type){
            case ActionType.NEW_BLANK_HISTORY_ELEMENT : {
                const newState = {...state, 
                    history : [...state.history, {
                        question : action.payload, 
                        answer : {asMarkdown : "", asHTML : ""}, 
                        context : [],
                        sources : [],
                    }]
                }
                conversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.UPDATE_LAST_HISTORY_ANSWER : {
                const newState = {...state, 
                    history : [...state.history]
                }
                const historyId = newState.history.length -1
                newState.history[historyId].answer = {asHTML : action.payload.html, asMarkdown : action.payload.markdown}
                conversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.UPDATE_LAST_HISTORY_CONTEXT : {
                const newState = {...state, 
                    history : [...state.history]
                }
                const historyId = newState.history.length -1
                newState.history[historyId].context = [...action.payload]
                conversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.PUSH_NEW_HISTORY_ELEMENT : {
                const newState = {...state, 
                    history : [...state.history, {
                        question : action.payload.question, 
                        answer : {asMarkdown : action.payload.markdown, asHTML : action.payload.html}, 
                        context : action.payload.context,
                        sources : []
                    }]
                }
                conversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.SET_CONVERSATION : {
                conversationStateRef.current = {...action.payload}
                return {...action.payload}
            }

            case ActionType.DELETE_LAST_HISTORY_ELEMENT : {
                if(state.history.length < 1 ) return {...state}
                const newState = {...state, 
                    history : [...state.history].slice(0, -1)
                }
                conversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.ADD_SOURCES_TO_LAST_ANSWER : {
                const newState = {...state}
                newState.history[newState.history.length -1].sources = [...action.payload].map((source) => ({asMarkdown : source, asHTML : convertSourceToHTMLSpan(source)}))
                conversationStateRef.current = {...newState}
                /*const payload = [...action.payload]
                newState.history[newState.history.length -1].answer.asMarkdown += convertSourcesArrayToMarkdown(payload)
                newState.history[newState.history.length -1].answer.asHTML += convertSourcesArrayToHTML(payload) // !!! create ScrapedPage class with such methods*/
                return {...newState}
            }
            
            default : return {...state}
        }
    }

    const [conversationState, dispatch] = useReducer(conversationReducer, {name : "conversation0", history : []})

    return {conversationState, dispatch, conversationStateRef}
}

export type reducerDispatchType = React.Dispatch<{type: string, payload: any}>

export enum ActionType {
    NEW_BLANK_HISTORY_ELEMENT = "NEW_BLANK_HISTORY_ELEMENT",
    UPDATE_LAST_HISTORY_ANSWER = "UPDATE_LAST_HISTORY_ANSWER",
    PUSH_NEW_HISTORY_ELEMENT = "PUSHNEWHISTORYELEMENT",
    SET_CONVERSATION = "SET_CONVERSATION",
    UPDATE_LAST_HISTORY_CONTEXT = "UPDATE_LAST_HISTORY_CONTEXT",
    DELETE_LAST_HISTORY_ELEMENT = "DELETE_LAST_HISTORY_ELEMENT",
    ADD_SOURCES_TO_LAST_ANSWER = "ADD_SOURCES_TO_LAST_ANSWER",
}

type TAction = 
    | { type: ActionType.NEW_BLANK_HISTORY_ELEMENT; payload: string }
    | { type: ActionType.UPDATE_LAST_HISTORY_ANSWER; payload: { html : string, markdown : string }}
    | { type: ActionType.UPDATE_LAST_HISTORY_CONTEXT; payload: number[]}
    | { type: ActionType.PUSH_NEW_HISTORY_ELEMENT; payload: { question : string, html : string, markdown : string, context : number[] }}
    | { type: ActionType.SET_CONVERSATION; payload: INewConversation}
    | { type: ActionType.DELETE_LAST_HISTORY_ELEMENT }
    | { type: ActionType.ADD_SOURCES_TO_LAST_ANSWER; payload: string[] }
    ;


function convertSourceToHTMLSpan(source : string){
    return `<span class="source"><a href="${source}">${source}</a></span>`
}

/*function convertSourcesArrayToMarkdown(sourcesArray : string[]){
    return sourcesArray.reduce((acc, source) => acc + "\n" + source, "\nSources :\n\n").slice(0, -1)
}

/*
function convertSourcesArrayToHTML(sourcesArray : string[]){
    return sourcesArray.reduce((acc, source) => acc + '<span class="source">' + source + '</span><br>', '<br><span style="font-weight:600; text-decoration:underline;">Sources :</span><br>').slice(0, -4)
}*/