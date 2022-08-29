import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from 'redux';

// reducer
export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id != action.id)
        }
        case 'ADD-TODOLIST': {
            // перезаписываем объект тудулиста что пришел с сервера на тот что нам надо - со значением фильтра:
            const newTodolist: TodolistDomainType = {...action.todolist, filter: 'all'}
            return [...state, newTodolist]
        }
        case 'CHANGE-TODOLIST-TITLE': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.title = action.title;
            }
            return [...state]
        }
        case 'CHANGE-TODOLIST-FILTER': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.filter = action.filter;
            }
            return [...state]
        }
        // копию state не надо map вернет новый массив
        case 'SET-TODOLISTS': {
            return action.todolists.map((tl) => {
                return {...tl, filter: 'all'}
            })
        }
        default:
            return state;
    }
}

// actions
export const removeTodolistAC = (id: string)  => ({type: 'REMOVE-TODOLIST', id} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist}  as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({type: 'CHANGE-TODOLIST-TITLE', id, title} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({type: 'CHANGE-TODOLIST-FILTER', id, filter} as const)
export const setTodolistAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists}  as const)

// thunk
export const fetchTodolistTC = () => (dispatch: Dispatch) => {
    todolistsAPI.getTodolists()
        .then((res) => {
            dispatch(setTodolistAC(res.data))
        })
}
export const removeTodolistTC = (todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTodolist(todolistId)
        .then((res) => {
            // передаем id todolist который надо удалить:
            dispatch(removeTodolistAC(todolistId))
        })
}
export const addTodolistTC = (title: string) => (dispatch: Dispatch) => {
    todolistsAPI.createTodolist(title)
        .then((res) => {
            const todolist = res.data.data.item
            dispatch(addTodolistAC(todolist))
        })
}
export const changeTodolistTitleTC = (id: string, title: string) => (dispatch: Dispatch) => {
    todolistsAPI.updateTodolist(id, title)
        .then((res) => {
           dispatch(changeTodolistTitleAC(id, title))
        })
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export type SetTodolistsActionType = ReturnType<typeof setTodolistAC>

type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof changeTodolistFilterAC>
    | ReturnType<typeof changeTodolistTitleAC>

const initialState: Array<TodolistDomainType> = []

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
}

