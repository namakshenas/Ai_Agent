/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useReducer } from "react"
import { INewConversation } from "../interfaces/INewConversation"

export function useConversationReducer() {

    const conversationStateRef = useRef<INewConversation>({name : "conversation0", history : []})

    function conversationReducer(state : INewConversation, action : TAction){
        switch(action.type){
            case ActionType.NEWBASEHISTORYELEMENT : {
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

            case ActionType.UPDATELASTHISTORYANSWER : {
                const newState = {...state, 
                    history : [...state.history]
                }
                const historyId = newState.history.length -1
                newState.history[historyId].answer = {asHTML : action.payload.html, asMarkdown : action.payload.markdown}
                conversationStateRef.current = {...newState}
                return {...newState}
            }

            case ActionType.UPDATELASTHISTORYCONTEXT : {
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

            case ActionType.SETCONVERSATION : {
                conversationStateRef.current = {...action.payload}
                return {...action.payload}
            }
            
            default : return state
        }
    }

    const [conversationState, dispatch] = useReducer(conversationReducer, {name : "conversation0", history : []})

    return {conversationState, dispatch, conversationStateRef}
}

export type reducerDispatchType = React.Dispatch<{type: string, payload: any}>

export enum ActionType {
    NEWBASEHISTORYELEMENT = "NEWBASEHISTORYELEMENT",
    UPDATELASTHISTORYANSWER = "UPDATELASTHISTORYANSWER",
    PUSHNEWHISTORYELEMENT = "PUSHNEWHISTORYELEMENT",
    SETCONVERSATION = "SETCONVERSATION",
    UPDATELASTHISTORYCONTEXT = "UPDATELASTHISTORYCONTEXT",
}

type TAction = 
    | { type: ActionType.NEWBASEHISTORYELEMENT; payload: string }
    | { type: ActionType.UPDATELASTHISTORYANSWER; payload: { html : string, markdown : string }}
    | { type: ActionType.UPDATELASTHISTORYCONTEXT; payload: number[]}
    | { type: ActionType.PUSHNEWHISTORYELEMENT; payload: { question : string, html : string, markdown : string, context : number[] }}
    | { type: ActionType.SETCONVERSATION; payload: INewConversation};