import { LEVEL, OBJECT_TYPE } from "./setup.js";
import { randomMove, chasePacmanSmart } from "./ghostmove.js";

import GameBoard from "./GameBoard.js";
import Pacman from "./Pacman.js";
import Ghost from "./Ghost.js";
import Cherry from "./Cherry.js";

const munchSound = new Audio("./sounds/munch.wav");
const powerPillSound = new Audio("./sounds/pill.wav");
const eatGhostSound = new Audio("./sounds/eat_ghost.wav");
const gameOverSound = new Audio("./sounds/death.wav");
const winSound = new Audio("./sounds/game_start.wav");
const cherrySound = new Audio("./sounds/eat_cherry.mp3");
const itemSound = new Audio('./sounds/item.mp3');
const gameStartSound = new Audio("./sounds/game_start.wav");
const dangerSound = new Audio("./sounds/danger.mp3");

//DOM elements
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const pauseTable = document.querySelector('#pause');
const startButton = document.querySelector('#start-button');

//Game constants
const POWER_PILL_DURATION = 10000;
const GLOBAL_SPEED = 80; //milliseconds between each movement of the ghosts
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL); //create the game board and populate it with the level layout


//initial game state
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillEndTime = 0;
let powerPillRemaining = 0;
let cherry = new Cherry();
let cherryInterval = null;
let isPaused = false;
let pacman = null;
let ghosts = [];
let pacmanKeyHandler = null;

//audio
function playSound(sound) {
    if (!sound) return;
    if (sound instanceof HTMLAudioElement) {
        const soundEffect = sound.cloneNode(true);
        soundEffect.currentTime = 0;
        soundEffect.play();
        return;
    }
    const soundEffect = new Audio(sound);
    soundEffect.play();
}

//Game over function
function gameOver(pacman, grid) {
    playSound(gameWin ? winSound : gameOverSound);

    //remove the event listener to prevent further movement
    if (pacmanKeyHandler) {
        document.removeEventListener('keydown', pacmanKeyHandler);
        pacmanKeyHandler = null;
    }

    gameBoard.showGameStatus(gameWin);

    //stop the game loop
    clearInterval(timer);
    timer = null;
    if (cherryInterval) clearInterval(cherryInterval);
    cherryInterval = null;
    cherry.stopRandomMovement();
    cherry.hideCherry(gameBoard);
    isPaused = false;
    pauseTable.classList.add('hide'); 

    startButton.classList.remove('hide');
}

//check collision function
function checkCollision(pacman, ghosts) {
    const collisionGhost = ghosts.find((ghost) => pacman.position === ghost.position);

    if (collisionGhost) {
        if (collisionGhost.isScared) {
                playSound(eatGhostSound);
            gameBoard.removeObject(collisionGhost.position, [
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collisionGhost.name
            ]);
            collisionGhost.position = collisionGhost.startPosition;
            collisionGhost.isScared = false;
            score += 100;
        } else {
            // Remove pacman from its current cell and clear any pacman classes
            gameBoard.removeObject(pacman.position, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.position, 0);
            for (let i = 0; i < gameBoard.grid.length; i++) {
                gameBoard.removeObject(i, [OBJECT_TYPE.PACMAN]);
            }
            // Stop pacman movement and clear its position
            pacman.direction = null;
            pacman.position = null;
            gameOver(pacman, gameGrid);
        }
    }
}

//game loop function
function gameLoop(pacman, ghosts) {
    //move packman
    gameBoard.moveCharacter(pacman);

    //check collision immediately after pacman moves
    checkCollision(pacman, ghosts);

    //move ghosts
    ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost, pacman.position));
    checkCollision(pacman, ghosts);

    //check if pacman eats a dot
    if (gameBoard.objectExist(pacman.position, OBJECT_TYPE.DOT)) {
        playSound(munchSound);
        gameBoard.removeObject(pacman.position, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score += 10;
    }

    //check if pacman eats a power pill
    if (gameBoard.objectExist(pacman.position, OBJECT_TYPE.PILL)) {
        playSound(powerPillSound);
        gameBoard.removeObject(pacman.position, [OBJECT_TYPE.PILL]);
        gameBoard.dotCount--;
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
            ghosts.forEach((ghost) => {
                ghost.isScared = false;
                    gameBoard.moveCharacter(ghost, pacman.position);
            });
        }
    }

    //check if pacman eats a cherry
    if (gameBoard.objectExist(pacman.position, OBJECT_TYPE.CHERRY)) {
        playSound(cherrySound);
        gameBoard.removeObject(pacman.position, [OBJECT_TYPE.CHERRY]);
        score += 70;
        cherry.isVisible = false;
        cherry.position = null;
        if (cherry.timer) {
            clearTimeout(cherry.timer);
            cherry.timer = null;
        }
    }

    //check if all dots are eaten
    if (gameBoard.dotCount === 0) {
        gameWin = true;
        gameOver(pacman, ghosts);
    }
            scoreTable.textContent = `Score: ${score}`;

}

function setPausedState(paused) {
    if (paused === isPaused) return;
    isPaused = paused;

    if (isPaused) {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        if (powerPillActive) {
            powerPillRemaining = Math.max(0, powerPillEndTime - Date.now());
        }
        if (cherryInterval) {
            clearInterval(cherryInterval);
            cherryInterval = null;
        }
        if (cherry.timer) {
            clearTimeout(cherry.timer);
            cherry.timer = null;
        }
        cherry.stopRandomMovement();
        pauseTable.classList.remove('hide');
        return;
    }

    if (powerPillActive) {
        powerPillEndTime = Date.now() + powerPillRemaining;
    } else {
        powerPillRemaining = 0;
    }

    if (pacman && ghosts.length && !gameWin) {
        timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
    }
    cherryInterval = setInterval(() => {
        cherry.showCherry(gameBoard, () => playSound(itemSound));
    }, 20000);
    cherry.startRandomMovement(gameBoard, () => playSound(itemSound));
    if (cherry.isVisible) {
        cherry.restartVisibilityTimer(gameBoard);
    }
    pauseTable.classList.add('hide');
}

function handlePauseKey(e) {
    const isSpace = e.code === 'Space' || e.key === ' ' || e.keyCode === 32;
    if (!isSpace) return;
    if (!pacman || gameWin) return;
    e.preventDefault();
    setPausedState(!isPaused);
}

function startGame() {
        playSound(gameStartSound);
        gameWin = false;
        powerPillActive = false;
        powerPillRemaining = 0;
        score = 0;
        // Show score as 0 at the start
        scoreTable.textContent = 'Score: 0';
        pauseTable.classList.add('hide');
        isPaused = false;
        startButton.classList.add('hide');
        gameBoard.createGrid(LEVEL);
        // Ensure any previous game-over message is hidden at game start
        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) gameOverDiv.classList.add('hide');

        pacman = new Pacman(2, 287);
        gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
        if (pacmanKeyHandler) {
            document.removeEventListener('keydown', pacmanKeyHandler);
        }
        pacmanKeyHandler = (e) => {
            if (isPaused) return;
            pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard));
        };
        document.addEventListener('keydown', pacmanKeyHandler);

        ghosts = [
            new Ghost(5, 188, randomMove, OBJECT_TYPE.BLINKY),
            new Ghost(4, 209, randomMove, OBJECT_TYPE.PINKY),
            new Ghost(3, 230, randomMove, OBJECT_TYPE.INKY),
            new Ghost(2, 251, randomMove, OBJECT_TYPE.CLYDE)
        ];
        // when there are fewer than 10 dots left blinky chases; others stay random
       ghosts.forEach((ghost) => {
            if (ghost.name === OBJECT_TYPE.BLINKY) {
                ghost.baseSpeed = ghost.speed;
            }
            ghost.movement = (position, direction, objectExist, pacmanPosition) => {
                if (ghost.name !== OBJECT_TYPE.BLINKY) {
                    return randomMove(position, direction, objectExist, pacmanPosition);
                }
                const shouldChase = gameBoard.dotCount < 10 && !ghost.isScared;
                //set speed based on whether blinky should chase or not
                ghost.speed = shouldChase ? 3 : ghost.baseSpeed;
                playSound(shouldChase ? dangerSound : null);
                return shouldChase
                    ? chasePacmanSmart(position, direction, objectExist, pacmanPosition)
                    : randomMove(position, direction, objectExist, pacmanPosition);
            };
            gameBoard.addObject(ghost.position, [OBJECT_TYPE.GHOST, ghost.name]);
        });
        
        // Cherry appearance interval
        cherry.stopRandomMovement();
        if (cherryInterval) clearInterval(cherryInterval);
        cherryInterval = setInterval(() => {
            cherry.showCherry(gameBoard, () => playSound(itemSound));
        }, 20000);
        // Start random movement for cherry
        cherry.startRandomMovement(gameBoard, () => playSound(itemSound));

        // Gameloop
        timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

// Initialize game
startButton.addEventListener('click', startGame);
document.addEventListener('keydown', handlePauseKey);