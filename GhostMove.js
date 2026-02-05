import { DIRECTIONS, OBJECT_TYPES } from "./setup.js";

//primitive ghost movement - ghosts will move in their current direction until they hit a wall, then they will choose a new random direction

export function randomMove(position, direction, objectExists) {
    let direction = direction;
    let nextMovePosition = position + direction.movement;

    //create an array from the directions object to get random direction keys
    const keys = Object.keys(DIRECTIONS);

    while (
        objectExists(nextMovePosition, OBJECT_TYPES.WALL) ||
        objectExists(nextMovePosition, OBJECT_TYPES.GHOST)
    ) {
        //get a random direction key from the keys array
        const key = keys[Math.floor(Math.random() * keys.length)];
        //set the direction to the random direction
        direction = DIRECTIONS[key];
        //calculate the next move position based on the new random direction
        nextMovePosition = position + direction.movement;
    }

    return { nextMovePosition, direction: direction }; 

}