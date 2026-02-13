import {
  GRID_SIZE,
  CELL_SIZE,
  OBJECT_TYPE,
  CLASS_LIST
} from './setup.js';

const MIN_CELL_SIZE = 8;
const MAX_CELL_SIZE = 25;
const GHOST_SCALE = 0.8;
const DOT_SCALE = 0.2;
const PACMAN_SCALE = 0.7;
const PILL_SCALE = 0.5;
const RESIZE_DEBOUNCE_MS = 120;

const debounce = (fn, wait = 100) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
};

class GameBoard {
  constructor(DOMGrid) {
    this.dotCount = 0;
    this.dotPositions = new Set();
    this.grid = [];
    this.DOMGrid = DOMGrid;
    this.onResize = debounce(() => this.updateBoardScale(), RESIZE_DEBOUNCE_MS);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);
  }

  static getNextPositionWithPortal(position, direction) {
    let nextMovePosition = position + direction.movement;

    if (direction.movement === -1 && position % GRID_SIZE === 0) {
      nextMovePosition = position + (GRID_SIZE - 1);
    } else if (direction.movement === 1 && position % GRID_SIZE === GRID_SIZE - 1) {
      nextMovePosition = position - (GRID_SIZE - 1);
    }

    return nextMovePosition;
  }

  updateBoardScale() {
    const container = this.DOMGrid.closest('.game-container') || document.body;
    const scoreEl = document.getElementById('score');
    const startButton = document.getElementById('start-button');
    const verticalUI =
      (scoreEl ? scoreEl.offsetHeight : 0) +
      (startButton ? startButton.offsetHeight : 0) +
      40;

    const availableWidth = Math.max(0, container.clientWidth - 16);
    const availableHeight = Math.max(0, window.innerHeight - verticalUI);
    const maxBoardSize = Math.min(availableWidth, availableHeight);

    let cellSize = Math.floor(maxBoardSize / GRID_SIZE);
    if (!Number.isFinite(cellSize) || cellSize <= 0) {
      cellSize = CELL_SIZE;
    }

    cellSize = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, cellSize));

    const ghostSize = Math.max(1, Math.round(cellSize * GHOST_SCALE));
    const dotSize = Math.max(1, Math.round(cellSize * DOT_SCALE));
    const pacmanSize = Math.max(1, Math.round(cellSize * PACMAN_SCALE));
    const pillSize = Math.max(1, Math.round(cellSize * PILL_SCALE));

    this.DOMGrid.style.setProperty('--cell-size', `${cellSize}px`);
    this.DOMGrid.style.setProperty('--ghost-size', `${ghostSize}px`);
    this.DOMGrid.style.setProperty('--dot-size', `${dotSize}px`);
    this.DOMGrid.style.setProperty('--pacman-size', `${pacmanSize}px`);
    this.DOMGrid.style.setProperty('--pill-size', `${pillSize}px`);

    this.DOMGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, var(--cell-size))`;
    this.DOMGrid.style.gridAutoRows = 'var(--cell-size)';
    this.DOMGrid.style.width = `${cellSize * GRID_SIZE}px`;
    this.DOMGrid.style.height = `${cellSize * GRID_SIZE}px`;
  }

  showGameStatus(gameWin) {
    const parent = this.DOMGrid.parentElement || this.DOMGrid;
    const winDiv = parent.querySelector('#win');
    const gameOverDiv = parent.querySelector('#game-over');

    if (gameWin) {
      if (winDiv) winDiv.classList.remove('hide');
      if (gameOverDiv) gameOverDiv.classList.add('hide');
    } else {
      if (gameOverDiv) gameOverDiv.classList.remove('hide');
      if (winDiv) winDiv.classList.add('hide');
    }
  }

  createGrid(level) {
    this.dotCount = 0;
    this.dotPositions = new Set();
    this.grid = [];
    this.DOMGrid.innerHTML = '';
    this.DOMGrid.style.cssText = `
      grid-template-columns: repeat(${GRID_SIZE}, var(--cell-size));
      grid-auto-rows: var(--cell-size);
      --cell-size: ${CELL_SIZE}px;
      --ghost-size: ${Math.round(CELL_SIZE * GHOST_SCALE)}px;
      --dot-size: ${Math.round(CELL_SIZE * DOT_SCALE)}px;
      --pacman-size: ${Math.round(CELL_SIZE * PACMAN_SCALE)}px;
      --pill-size: ${Math.round(CELL_SIZE * PILL_SCALE)}px;
    `;

    level.forEach((square) => {
      const div = document.createElement('div');
      div.classList.add('square', CLASS_LIST[square]);
      this.DOMGrid.appendChild(div);
      this.grid.push(div);

      // Add dots and pills
      if (CLASS_LIST[square] === OBJECT_TYPE.DOT) {
        this.dotCount++;
        // Store the position of the dot for cherry placement
        this.dotPositions.add(this.grid.length - 1);
      }
      if (CLASS_LIST[square] === OBJECT_TYPE.PILL) {
        this.dotCount++;
      }
    });

    this.updateBoardScale();
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

  moveCharacter(character, pacmanPosition) {
    if (character.shouldMove()) {
      const { nextMovePosition, direction } = character.getNextMove(
        this.objectExist.bind(this),
        pacmanPosition
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