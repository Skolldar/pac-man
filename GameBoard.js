import { GRID_SIZE, CELL_SIZE, OBJECT_TYPE, CLASS_LIST } from './setup.js';

class GameBoard {
  constructor(DOMGrid) {
    this.dotCount = 0;
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
    this.grid = [];
    this.DOMGrid.innerHTML = '';
    // First set correct amount of columns based on Grid Size and Cell Size
    this.DOMGrid.style.cssText = `grid-template-columns: repeat(${GRID_SIZE}, ${CELL_SIZE}px);`;

    level.forEach((square) => {
      const div = document.createElement('div');
      div.classList.add('square', CLASS_LIST[square]);
      div.style.cssText = `width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`;
      this.DOMGrid.appendChild(div);
      this.grid.push(div);

      // Add dots
      if (CLASS_LIST[square] === OBJECT_TYPE.DOT) this.dotCount++;
    });
  }

  addObject(pos, classes) {
    if (!this.grid[pos]) return;
    this.grid[pos].classList.add(...classes);
  }

  removeObject(pos, classes) {
    if (!this.grid[pos]) return;
    this.grid[pos].classList.remove(...classes);
  }
  // Can have an arrow function here cause of this binding
  objectExist(pos, object) {
    if (!this.grid[pos]) return false;
    return this.grid[pos].classList.contains(object);
  };

  rotateDiv(pos, deg) {
    if (!this.grid[pos]) return;
    this.grid[pos].style.transform = `rotate(${deg}deg)`;
  }

  moveCharacter(character) {
    if (!character.shouldMove || !character.shouldMove()) return;

    // Get move result
    const moveResult = character.getNextMove
      ? character.getNextMove(this.objectExist.bind(this))
      : {};
    const nextMove = 'nextMovePosition' in moveResult ? moveResult.nextMovePosition : moveResult.nextMovePos;
    const direction = moveResult.direction ?? moveResult.dir;

    if (typeof nextMove === 'undefined') return;

    const { classesToRemove = [], classesToAdd = [] } = typeof character.makeMove === 'function'
      ? character.makeMove()
      : { classesToRemove: [], classesToAdd: [] };

    const currentPos = typeof character.position !== 'undefined' ? character.position : character.pos;

    if (character.rotation && nextMove !== currentPos) {
      const rotationDeg = (character.direction ?? character.dir)?.rotation ?? 0;
      this.rotateDiv(nextMove, rotationDeg);
      this.rotateDiv(currentPos, 0);
    }

    this.removeObject(currentPos, classesToRemove);
    this.addObject(nextMove, classesToAdd);

    if (typeof character.setNewPosition === 'function') {
      character.setNewPosition(nextMove, direction);
      return;
    }

    if (typeof character.setNewPos === 'function') {
      character.setNewPos(nextMove, direction);
      return;
    }

    if (typeof character.position !== 'undefined') character.position = nextMove;
    else character.pos = nextMove;

    if (direction) {
      if (typeof character.direction !== 'undefined') character.direction = direction;
      else character.dir = direction;
    }
  }

  static createGameBoard(DOMGrid, level) {
    const board = new this(DOMGrid);
    board.createGrid(level);
    return board;
  }
}

export default GameBoard;