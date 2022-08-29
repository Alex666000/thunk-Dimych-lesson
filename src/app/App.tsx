import React, {useCallback, useEffect} from 'react'
import './App.css';
import {TodolistList} from '../features/Todolists/Todolist/TodolistList';
import {AddItemForm} from '../components/AddItemForm/AddItemForm';
import {AppBar, Button, Container, Grid, IconButton, Paper, Toolbar, Typography} from '@material-ui/core';
import {Menu} from '@material-ui/icons';
import {
    addTodolistTC,
    changeTodolistFilterAC,
    changeTodolistTitleTC,
    fetchTodolistTC,
    FilterValuesType,
    removeTodolistTC,
    TodolistDomainType
} from '../features/Todolists/todolists-reducer'
import {addTaskTC, removeTaskTC, TasksStateType, updateTaskTC,} from '../features/Todolists/tasks-reducer';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStateType} from './store';
import {TaskStatuses, TaskType} from '../api/todolists-api'
import {TodolistsList} from '../features/Todolists/TodolistsList';

function App() {
    return (
        <div className="App">
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <Menu/>
                    </IconButton>
                    <Typography variant="h6">
                        News
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>
            <Container fixed>
                <TodolistsList/>
            </Container>
        </div>
    );
}
export default App;


