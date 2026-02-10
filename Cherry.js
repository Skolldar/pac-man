import { DIRECTIONS, OBJECT_TYPE } from './setup.js';

class Cherry {
    constructor() {
        this.position = null;
        this.isVisible = false;
        this.visibleDuration = 10000;
        this.timer = null;
        //Cherry interval for random movement every 20 seconds
        this.movementInterval = 20000;
    }

    showCherry(gameBoard, soundCallback) {

        if (this.isVisible) return;
        // Find all valid positions where dots were removed
        const validPositions = [];
        const dotPositions = gameBoard.dotPositions || new Set();
        dotPositions.forEach((i) => {
            if (
                !gameBoard.objectExist(i, OBJECT_TYPE.WALL) &&
                !gameBoard.objectExist(i, OBJECT_TYPE.GHOSTLAIR) &&
                !gameBoard.objectExist(i, OBJECT_TYPE.PACMAN) &&
                !gameBoard.objectExist(i, OBJECT_TYPE.GHOST) &&
                !gameBoard.objectExist(i, OBJECT_TYPE.PILL) &&
                !gameBoard.objectExist(i, OBJECT_TYPE.DOT)
            ) {
                validPositions.push(i);
            }
        });
        if (validPositions.length === 0) return;
        // Randomly select a valid position for the cherry
        const randomPosition = validPositions[Math.floor(Math.random() * validPositions.length)];
        this.position = randomPosition;
        this.isVisible = true;
        gameBoard.addObject(this.position, [OBJECT_TYPE.CHERRY]);
        
        // Play sound when cherry appears
        if (soundCallback) soundCallback();
        // Set a timer to hide the cherry after the visible duration
        this.timer = setTimeout(() => {
            this.hideCherry(gameBoard);
        }, this.visibleDuration);
    }

    hideCherry(gameBoard) {
        if (!this.isVisible) return;

        gameBoard.removeObject(this.position, [OBJECT_TYPE.CHERRY]);
        this.position = null;
        this.isVisible = false;

        // Clear the timer if it's still running
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    // Method to randomly move the cherry to a new position every 20 seconds
    startRandomMovement(gameBoard, soundCallback) {
        setInterval(() => {
            if (this.isVisible) {
                this.hideCherry(gameBoard);
                this.showCherry(gameBoard, soundCallback);
            }
        }, this.movementInterval);
    }
}

export default Cherry;