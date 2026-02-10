import { DIRECTIONS, OBJECT_TYPE, LEVEL } from './setup.js';
import GameBoard from './GameBoard.js';

export function randomMove(position, direction, objectExist) {
  let dir = direction;
  let nextMovePosition = GameBoard.getNextPositionWithPortal(position, dir);
  // Create an array from the diretions objects keys
  const keys = Object.keys(DIRECTIONS);

  while (
    objectExist(nextMovePosition, OBJECT_TYPE.WALL) ||
    objectExist(nextMovePosition, OBJECT_TYPE.GHOST)
  ) {
    // Get a random key from that array
    const key = keys[Math.floor(Math.random() * keys.length)];
    // Set the new direction
    dir = DIRECTIONS[key];
    // Set the next move
    nextMovePosition = GameBoard.getNextPositionWithPortal(position, dir);
  }

  return { nextMovePosition, direction: dir };
}

export function chasePacman(position, direction, objectExist, pacmanPosition) {
  const possibleDirections = Object.values(DIRECTIONS);
  let bestDirection = direction;
  let bestDistance = Infinity;

  possibleDirections.forEach((dir) => {
    const nextMovePosition = GameBoard.getNextPositionWithPortal(position, dir);
    if (
      !objectExist(nextMovePosition, OBJECT_TYPE.WALL) &&
      !objectExist(nextMovePosition, OBJECT_TYPE.GHOST)
    ) {
      const distance = Math.abs(nextMovePosition % 20 - pacmanPosition % 20) + Math.abs(Math.floor(nextMovePosition / 20) - Math.floor(pacmanPosition / 20));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = dir;
      }
    }
  });

  return { nextMovePosition: GameBoard.getNextPositionWithPortal(position, bestDirection), direction: bestDirection };
}

function getDirectionFromMove(currentPosition, nextPosition) {
  const movement = nextPosition - currentPosition;
  const direction = Object.values(DIRECTIONS).find((dir) => dir.movement === movement);
  return direction || DIRECTIONS.ArrowRight;
}

function getNeighbors(position) {
  return Object.values(DIRECTIONS).map((dir) => {
    const next = GameBoard.getNextPositionWithPortal(position, dir);
    return { next, dir };
  });
}

export function chasePacmanSmart(position, direction, objectExist, pacmanPosition) {
  const totalCells = LEVEL.length;
  const visited = new Array(totalCells).fill(false);
  const queue = [];

  visited[position] = true;
  queue.push({ pos: position, prev: null });

  let foundNode = null;

  while (queue.length) {
    const node = queue.shift();
    if (node.pos === pacmanPosition) {
      foundNode = node;
      break;
    }

    getNeighbors(node.pos).forEach(({ next, direction }) => {
      if (next < 0 || next >= totalCells) return;
      if (visited[next]) return;
      if (objectExist(next, OBJECT_TYPE.WALL)) return;
      if (objectExist(next, OBJECT_TYPE.GHOST)) return;

      visited[next] = true;
      queue.push({ pos: next, prev: node });
    });
  }

  if (!foundNode) {
    return chasePacman(position, direction, objectExist, pacmanPosition);
  }

  let current = foundNode;
  let previous = current.prev;
  while (previous && previous.prev) {
    current = previous;
    previous = current.prev;
  }

  const nextMovePosition = current.pos === position ? position : current.pos;
  const nextDirection = current.pos === position
    ? direction
    : getDirectionFromMove(position, nextMovePosition);

  return { nextMovePosition, direction: nextDirection };
}