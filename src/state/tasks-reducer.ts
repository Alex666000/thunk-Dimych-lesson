import {TasksStateType} from '../App';
import {v1} from 'uuid';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {
    AddTodolistActionType, removeTodolistAC,
    RemoveTodolistActionType,
    setTodolistAC,
    SetTodolistsActionType
} from './todolists-reducer';
import {Dispatch} from 'redux';
import {AppRootStateType} from './store';

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}
export type AddTaskActionType = {
    type: 'ADD-TASK',
    task: TaskType
}
export type UpdateTaskActionType = {
    type: 'UPDATE-TASK',
    todolistId: string
    taskId: string
    // status: TaskStatuses
    model: UpdateDomainTaskModelType
}
export type ChangeTaskTitleActionType = {
    type: 'CHANGE-TASK-TITLE',
    todolistId: string
    taskId: string
    title: string
}
export type SetTasksActionType = {
    type: 'SET-TASKS'
    tasks: Array<TaskType>
    todolistId: string
}
type ActionsType =
    | RemoveTaskActionType
    | AddTaskActionType | SetTasksActionType
    | UpdateTaskActionType
    | ChangeTaskTitleActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType

const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id != action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'ADD-TASK': {
            // теперь редюсер не формирует новую таску - она приходит из action готовая
            const stateCopy = {...state}
            const newTask = action.task
            const tasks = stateCopy[newTask.todoListId];
            const newTasks = [newTask, ...tasks];
            stateCopy[newTask.todoListId] = newTasks;
            return stateCopy;
        }
        case 'UPDATE-TASK': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, ...action.model} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            // найдём нужную таску:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolist.id]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        case 'SET-TODOLISTS': {
            const copyState = {...state}
            // в этом стейте создать свойство на основе тех туду что к нам прилетели - должны пробежаться по всем туду что прилетели и на основе тудулистов зафиксировать в этом объекте свойство:
            //  forEach - просто пробегается и с каждым элементом что-то делает или на основе каждого эл.что-то делает
            // берем и в объекте copyState создаем дополнительное свойство:
            action.todolists.forEach(tl => {
                copyState[tl.id] = []
            })
        }
        case 'SET-TASKS':
            const copyState = {...state}
            if (action.type !== 'SET-TODOLISTS') {
                copyState[action.todolistId] = action.tasks
            }
            return copyState
        default:
            return state;
    }
}
export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType): AddTaskActionType => {
    return {type: 'ADD-TASK', task}
}
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string): UpdateTaskActionType => {
    return {type: 'UPDATE-TASK', model, todolistId, taskId}
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string): ChangeTaskTitleActionType => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}
}
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string): SetTasksActionType => {
    return {type: 'SET-TASKS', tasks, todolistId}
}
// thunk
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            const action = setTasksAC(tasks, todolistId)
            dispatch(action)
        })
}
export const removeTaskTC = (todolistId: string, taskId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then((res) => {
            dispatch(removeTaskAC(taskId, todolistId))
        })
}
export const addTaskTC = (todolistId: string, taskId: string) => (dispatch: Dispatch) => {
    todolistsAPI.createTask(todolistId, taskId)
        .then((res) => {
            dispatch(addTaskAC(res.data.data.item))
        })
}
/*
export const changeTaskStatusTC = (taskId: string, status: TaskStatuses, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        // достали state
        const state = getState()
        // получили таски конкретного туду и там ищем таску по которой кликнули:
        // нам вернулась таска и у нее можем покопировать все что нам надо

        // нашли кликнутую таску
        const task = state.tasks[todolistId].find(t => t.id === taskId)

        if (!task) {
            // сделаем прерывание если ее нет и дадим предупреждение ворнинг:
            console.warn('task не найдена в state')
            return
        }
        // отправляем модельку - см документацию что за объект отправим:
        // из вернувшейся с бизнеса кликнутой таски копируем все что нам надо
        const model: UpdateTaskModelType = {
            title: task.title,
            deadline: task.deadline,
            priority: task.priority,
            startDate: task.startDate,
            description: task.description,
            status: status,

        }
        // 2 способ - все копируем и меняем только статус
        /!* const model: UpdateTaskModelType = {
             ...task,
             status: status,
         }*!/
        todolistsAPI.updateTask(todolistId, taskId, model)
            .then((res) => {
                dispatch(changeTaskStatusAC(taskId, status, todolistId))
            })
    }
*/

// ----------------------------------------------------------------------------------
// общая санка - вместо changeTaskStatusTC - так как моделька одна и та же только tittle меняется на status

// создадим тип модельки(скопировали с АПИ) - и переназовем
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: number
    priority?: number
    startDate?: string
    deadline?: string
}
// тут domainModel пришла в параметры из UI при вызове ТС
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)

        if (!task) {
            console.warn('task не найдена в state')
            return
        }
        const apiModel: UpdateTaskModelType = {
            title: task.title,
            deadline: task.deadline,
            priority: task.priority,
            startDate: task.startDate,
            description: task.description,
            status: task.status,
            // скажем берем ДоменМодел которая пришла к нам из UI и у нее все заберем
            ...domainModel
            // мы понимаем что у этой domainModel  может быть только 1 свойство - значит только его и перезатрем остальные оставим как есть
        }
        // передаем на сервер apiModel
        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then((res) => {
                dispatch(updateTaskAC(taskId, domainModel, todolistId))
            })
    }



