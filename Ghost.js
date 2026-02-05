import { DIRECTIONS, OBJECT_TYPES } from "./setup.js";
import Character from "./Character.js";

class Ghost extends Character {
    constructor(speed, startPosition, movement, name) {
        super(speed, startPosition);
        this.name = name;
        this.startPosition = startPosition;
        this.movement = movement;
        this.direction = DIRECTIONS.ArrowRight;
        this.isScared = false;
    }

    shouldMove() {
        if (this.timer === this.speed) {
            this.timer = 0;
            return true;
        }
        this.timer++;
        return false;
    }

    getNextMove(objectExists) {
        const {nextMovePosition, direction} = this.movement(this.position, this.direction, objectExists);

        return {nextMovePosition, direction};
    }

    makeMove() {
        const classesToRemove = [OBJECT_TYPES.GHOST, `${OBJECT_TYPES.SCARED_GHOST}-${this.name}`];
        const classesToAdd = [OBJECT_TYPES.GHOST, `${OBJECT_TYPES.GHOST}-${this.name}`];
        
        if(this.isScared) {
            classesToAdd.push(OBJECT_TYPES.SCARED_GHOST);
        }

    }
}

export default Ghost;