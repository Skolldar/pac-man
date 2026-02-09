import { LEVEL, OBJECT_TYPE } from "./setup.js";
import { randomMove } from "./ghostmove.js";

import GameBoard from "./GameBoard.js";
import Pacman from "./Pacman.js";
import Ghost from "./Ghost.js";

//DOM elements
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');

//Game constants
const POWER_PILL_DURATION = 10000; //10 seconds
const GLOBAL_SPEED = 80; //milliseconds between each movement of the ghosts
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL); //create the game board and populate it with the level layout


//initial game state
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillEndTime = 0;
let ghosts = [];

//Game over function
function gameOver(pacman, grid) {
    //remove the event listener to prevent further movement
    document.removeEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
    );

    gameBoard.showGameStatus(gameWin);

    //stop the game loop
    clearInterval(timer);

    startButton.classList.remove('hide');
}

//check collision function
function checkCollision(pacman, ghosts) {
    const collisionGhost = ghosts.find((ghost) => pacman.position === ghost.position);

    if (collisionGhost) {
        if (pacman.powerPillActive && collisionGhost.isScared) {
            gameBoard.removeObject(collisionGhost.position, [
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collisionGhost.name
            ]);
            collisionGhost.position = collisionGhost.startPosition;
            collisionGhost.isScared = false; // Ghost returns to base in normal state
            score += 100;
        } else {
            gameBoard.removeObject(pacman.position, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.position, 0); //reset rotation
            gameOver(pacman, gameGrid);
        }
    }
}

//game loop function
function gameLoop(pacman, ghosts) {
    //move packman
    gameBoard.moveCharacter(pacman);

    //move ghosts
    ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);

    //check if pacman eats a dot
    if (gameBoard.objectExist(pacman.position, OBJECT_TYPE.DOT)) {
        gameBoard.removeObject(pacman.position, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score += 10;
    }

    //check if pacman eats a power pill
    if (gameBoard.objectExist(pacman.position, OBJECT_TYPE.PILL)) {
        gameBoard.removeObject(pacman.position, [OBJECT_TYPE.PILL]);
        pacman.powerPillActive = true;
        powerPillActive = true;
        powerPillEndTime = Date.now() + POWER_PILL_DURATION;
        score += 50;
        ghosts.forEach((ghost) => (ghost.isScared = true));
    }

    // Power pill timer logic
    if (pacman.powerPillActive) {
        if (Date.now() >= powerPillEndTime) {
            pacman.powerPillActive = false;
            powerPillActive = false;
            ghosts.forEach((ghost) => (ghost.isScared = false));
        }
    }

    //check if all dots are eaten
    if (gameBoard.dotCount === 0) {
        gameWin = true;
        gameOver(pacman, ghosts);
    }

    //Show the score
    scoreTable.textContent = `Score: ${score}`;
}

function startGame() {
  gameWin = false;
  powerPillActive = false;
  score = 0;

  startButton.classList.add('hide');

  gameBoard.createGrid(LEVEL);

  const pacman = new Pacman(2, 287);
  gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
  document.addEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );

  const ghosts = [
    new Ghost(5, 188, randomMove, OBJECT_TYPE.BLINKY),
    new Ghost(4, 209, randomMove, OBJECT_TYPE.PINKY),
    new Ghost(3, 230, randomMove, OBJECT_TYPE.INKY),
    new Ghost(2, 251, randomMove, OBJECT_TYPE.CLYDE)
  ];

  // Gameloop
  timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

// Initialize game
startButton.addEventListener('click', startGame);

