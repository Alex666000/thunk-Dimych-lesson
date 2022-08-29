import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from 'redux';

const initialState: Array<TodolistDomainType> = []
//  let [tasks, setTasks] = useState<TasksStateType>({
//         [todolistId1]: [
//             {
//                 id: v1(), title: 'HTML&CSS', status: TaskStatuses.Completed, todoListId: todolistId1, description: '',
//                 startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
//             },
//             {
//                 id: v1(), title: 'JS', status: TaskStatuses.Completed, todoListId: todolistId1, description: '',
//                 startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
//             }
//         ],

// reducer
export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id != action.id)
        case 'ADD-TODOLIST':
            // перезаписываем объект todolist что пришел с сервера на тот что нам надо - со значением фильтра:
            return [...state, {...action.todolist, filter: 'all'}]
        case 'CHANGE-TODOLIST-TITLE':
            // если нашёлся - изменим ему заголовок или вернем без изменений
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            // если нашёлся - изменим ему заголовок
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        // копию state не надо map вернет новый массив
        case 'SET-TODOLISTS':
            return action.todolists.map((tl) => ({...tl, filter: 'all'})
            )
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
export const fetchTodolistTC = () => (dispatch: Dispatch<ActionsType>) => {
    todolistsAPI.getTodolists()
        .then((res) => {
            dispatch(setTodolistAC(res.data))
        })
}
export const removeTodolistTC = (todolistId: string) => (dispatch:  Dispatch<ActionsType>) => {
    todolistsAPI.deleteTodolist(todolistId)
        .then((res) => {
            // передаем id todolist который надо удалить:
            dispatch(removeTodolistAC(todolistId))
        })
}
export const addTodolistTC = (title: string) => (dispatch:  Dispatch<ActionsType>) => {
    todolistsAPI.createTodolist(title)
        .then((res) => {
            const todolist = res.data.data.item
            dispatch(addTodolistAC(todolist))
        })
}
export const changeTodolistTitleTC = (id: string, title: string) => (dispatch:  Dispatch<ActionsType>) => {
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
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
}

