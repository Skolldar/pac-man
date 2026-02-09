import { DIRECTIONS, OBJECT_TYPE } from './setup.js';
import GameBoard from './GameBoard.js';

// Primitive random movement.
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