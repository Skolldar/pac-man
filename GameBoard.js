import { GRID_SIZE, CELL_SIZE, OBJECT_TYPE, CLASS_LIST } from './setup.js';

class GameBoard {
  constructor(DOMGrid) {
    this.dotCount = 0;
    this.dotPositions = new Set();
    this.grid = [];
    this.DOMGrid = DOMGrid;
  }

  showGameStatus(gameWin) {
    // Create and show game win or game over
    const div = document.createElement('div');
    div.classList.add('game-status');
    div.innerHTML = `${gameWin ? 'WIN!' : 'GAME OVER!'}`;
    this.DOMGrid.appendChild(div);
  }

  createGrid(level) {
    this.dotCount = 0;
    this.dotPositions = new Set();
    this.grid = [];
    this.DOMGrid.innerHTML = '';
    this.DOMGrid.style.cssText = `grid-template-columns: repeat(${GRID_SIZE}, ${CELL_SIZE}px);`;

    level.forEach((square) => {
      const div = document.createElement('div');
      div.classList.add('square', CLASS_LIST[square]);
      div.style.cssText = `width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`;
      this.DOMGrid.appendChild(div);
      this.grid.push(div);

      // Add dots
      if (CLASS_LIST[square] === OBJECT_TYPE.DOT) {
        this.dotCount++;
        // Store the position of the dot for cherry placement
        this.dotPositions.add(this.grid.length - 1);
      }
    });
  }

  addObject(position, classes) {
    if (!this.grid[position]) return;
    this.grid[position].classList.add(...classes);
  }

  removeObject(position, classes) {
    if (!this.grid[position]) return;
    this.grid[position].classList.remove(...classes);
  }
  // Can have an arrow function here cause of this binding
  objectExist(position, object) {
    if (!this.grid[position]) return false;
    return this.grid[position].classList.contains(object);
  };

  rotateDiv(position, deg) {
    if (!this.grid[position]) return;
    this.grid[position].style.transform = `rotate(${deg}deg)`;
  }

  moveCharacter(character) {
    if (character.shouldMove()) {
      const { nextMovePosition, direction } = character.getNextMove(
        this.objectExist.bind(this)
      );
      const { classesToRemove, classesToAdd } = character.makeMove();

      if (character.rotation && nextMovePosition !== character.pos) {
        // Rotate
        this.rotateDiv(nextMovePosition, character.direction.rotation);
        // Rotate the previous div back
        this.rotateDiv(character.position, 0);
      }

      this.removeObject(character.position, classesToRemove);
      this.addObject(nextMovePosition, classesToAdd);

      character.setNewPosition(nextMovePosition, direction);
    }
  }

  static createGameBoard(DOMGrid, level) {
    const board = new this(DOMGrid);
    board.createGrid(level);
    return board;
  }
}

export default GameBoard;