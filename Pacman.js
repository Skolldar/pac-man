import { DIRECTIONS, OBJECT_TYPES } from "./setup.js";

class Pacman {
    constructor(speed, position) {
        this.position = position;
        this.speed = speed;
        this.direction = null;
        this.timer = 0;
        this.powerPillActive = false;
        this.rotation = true;
    }

    shouldMove() {
        if(!this.direction) return false;

        if(this.timer === this.speed) {
            this.timer = 0;
            return true;
        }
        this.timer++;
    }

    getNextMove(objectExists) {
        let nextMovePosition = this.position + DIRECTIONS[this.direction].movement;

        if(objectExists(nextMovePosition, OBJECT_TYPES.WALL) || objectExists(nextMovePosition, OBJECT_TYPES.GHOST_LAIR)) {
            nextMovePosition = this.position;
        }

        return {nextMovePosition, direction: this.direction};
    }

    makeMove() {
        const classesToRemove = [OBJECT_TYPES.PACMAN];
        const classesToAdd = [OBJECT_TYPES.PACMAN];

        return {classesToRemove, classesToAdd};
    }

    setNewPosition(nextMovePosition) {
        this.position = nextMovePosition;
    }

    hanldeKeyInput(e, objectExists) {
        let direction;
        if(e.keyCode >= 37 && e.keyCode <= 40) {
            direction = DIRECTIONS[e.key];
        } else {
            return;
        }

        const nextMovePosition = this.position + direction.movement;

        if(objectExists(nextMovePosition, OBJECT_TYPES.WALL)) return;
        
        this.direction = direction;
    }
}
export default Pacman;