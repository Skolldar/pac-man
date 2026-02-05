import { LEVEL, OBJECT_TYPES } from "./setup.js";
import GameBoard from "./GameBoard.js";

//DOM elements
const gameGrid = document.querySelector('#game');

const scoreTable = document.querySelector('.score');

const startButton = document.querySelector('.start-button');

//Game constants
const POWER_PILL_DURATION = 10000; //10 seconds
const GLOBAL_SPEED = 80; //milliseconds between each movement of the ghosts
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL); //create the game board and populate it with the level layout


//initial game state
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

//Game over function
function gameOver(pacman, grid) {
    //
}

//check collision function
function checkCollision(pacman, ghosts) {
    //
}

//game loop function
function gameLoop(pacman, ghosts) {
    //
}

//start game function
function startGame() {
}