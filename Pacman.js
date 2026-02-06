import { DIRECTIONS, OBJECT_TYPE } from "./setup.js";

class Pacman {
    constructor(speed, startPosition) {
        this.position = startPosition;
        this.speed = speed;
        this.direction = null;
        this.timer = 0;
        this.powerPillActive = false;
        this.rotation = true;
    }

    shouldMove() {
        if (!this.direction) return false;

        if (this.timer === this.speed) {
            this.timer = 0;
            return true;
        }
        this.timer++;
        return false;
    }

    getNextMove(objectExists) {
        let nextMovePosition = this.position + this.direction.movement;

        // Check for wall collisions; allow entering ghost lair
        if(
            objectExists(nextMovePosition, OBJECT_TYPE.WALL)) {
            nextMovePosition = this.position;
        }

        return {nextMovePosition, direction: this.direction};
    }

    makeMove() {
        const classesToRemove = [OBJECT_TYPE.PACMAN];
        const classesToAdd = [OBJECT_TYPE.PACMAN];

        return {classesToRemove, classesToAdd};
    }

    setNewPosition(nextMovePosition) {
        this.position = nextMovePosition;
    }

    handleKeyInput(e, objectExists) {
        let direction;
        if(e.keyCode >= 37 && e.keyCode <= 40) {
            direction = DIRECTIONS[e.key];
        } else {
            return;
        }

        const nextMovePosition = this.position + direction.movement;

        if(objectExists(nextMovePosition, OBJECT_TYPE.WALL)) return;
        
        this.direction = direction;
    }
}
export default Pacman;