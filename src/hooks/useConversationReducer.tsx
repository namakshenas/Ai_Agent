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
                        context : []
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

            case ActionType.PUSHNEWHISTORYELEMENT : {
                const newState = {...state, 
                    history : [...state.history, {
                        question : action.payload.question, 
                        answer : {asMarkdown : action.payload.markdown, asHTML : action.payload.html}, 
                        context : action.payload.context
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
            
            default : return state
        }
    }

    const [conversationState, dispatch] = useReducer(conversationReducer, {name : "conversation0", history : []})

    return {conversationState, dispatch, conversationStateRef}
}

export type reducerDispatchType = React.Dispatch<{type: string, payload: any}>

export enum ActionType {
    NEW_BLANK_HISTORY_ELEMENT = "NEW_BLANK_HISTORY_ELEMENT",
    UPDATE_LAST_HISTORY_ANSWER = "UPDATE_LAST_HISTORY_ANSWER",
    PUSHNEWHISTORYELEMENT = "PUSHNEWHISTORYELEMENT",
    SET_CONVERSATION = "SET_CONVERSATION",
    UPDATE_LAST_HISTORY_CONTEXT = "UPDATE_LAST_HISTORY_CONTEXT",
    DELETE_LAST_HISTORY_ELEMENT = "DELETE_LAST_HISTORY_ELEMENT",
}

type TAction = 
    | { type: ActionType.NEW_BLANK_HISTORY_ELEMENT; payload: string }
    | { type: ActionType.UPDATE_LAST_HISTORY_ANSWER; payload: { html : string, markdown : string }}
    | { type: ActionType.UPDATE_LAST_HISTORY_CONTEXT; payload: number[]}
    | { type: ActionType.PUSHNEWHISTORYELEMENT; payload: { question : string, html : string, markdown : string, context : number[] }}
    | { type: ActionType.SET_CONVERSATION; payload: INewConversation}
    | { type: ActionType.DELETE_LAST_HISTORY_ELEMENT }
    ;