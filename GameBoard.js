import { GRID_SIZE, CELL_SIZE, OBJECT_TYPES, CLASS_LIST } from "./setup.js";

class GameBoard {
    constructor(DOMGrid) {
        this.dotCount = 0;
        this.grid = [];
        this.DOMGrid = DOMGrid;
    }

    showGameStatus(gameWin) {
        const div = document.createElement('div');
        div.classList.add('game-status');
        div.innerHTML = `${gameWin ? 'You Win!' : 'Game Over!'}`;
        this.DOMGrid.appendChild(div);
    }

    createGrid(level) {
        this.dotCount = 0;
        this.grid = [];
        this.DOMGrid.innerHTML = '';

        this.DOMGrid.style.cssText = `grid-template-columns: repeat(${GRID_SIZE}, ${CELL_SIZE}px);`;

        level.forEach((square) => {
            const div = document.createElement('div');
            div.classList.add('square', CLASS_LIST[square]);
            div.style.cssText = `width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`;
            this.DOMGrid.appendChild(div);
            this.grid.push(div);

            if(CLASS_LIST[square] === OBJECT_TYPES.DOT) this.dotCount++;
        })
    }

    //function to add className to a square on the grid
    addObject(position, className) {
        this.grid[position].classList.add(...className);
    }

    removeObject(position, className) {
        this.grid[position].classList.remove(...className);
    }

    objectExists = (position, object) => {
        return this.grid[position].classList.contains(object);
    }

    //rotate the pacman div to face the direction of movement
    rotateDiv(position, rotation) {
        this.grid[position].style.transform = `rotate(${rotation}deg)`;
    }

    moveCharacter(character) {
        if(character.shouldMove()) {
            const {nextMovePosition, direction} = character.getNextMove(this.objectExists);
            const {classesToRemove, classesToAdd} = character.makeMove();
            
            //rotate the character if it has a rotation property and is moving to a new position
            if(character.rotation && nextMovePosition !== character.position) {
                this.rotateDiv(nextMovePosition, character.direction.rotation);
                this.rotateDiv(character.position, 0);
            }
            
            //remove the character from the old position on the grid
            this.removeObject(character.position, classesToRemove);
            //add the character to the new position on the grid
            this.addObject(nextMovePosition, classesToAdd);
            //set new position for the character
            character.setNewPosition(nextMovePosition);
        }
    }

    //static method to create a new game board and populate it with the level layout
    static createGameBoard(DOMGrid, level) {
        const board = new this(DOMGrid);
        board.createGrid(level);
        return board;
    }
};

export default GameBoard;