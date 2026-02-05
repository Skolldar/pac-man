import { DIRECTIONS, OBJECT_TYPE } from "./setup.js";
import Character from "./Character.js";

class Pacman extends Character {
    constructor(speed, position) {
        super(speed, position); //super() calls the constructor of the parent class (Character) and passes the speed and position arguments to it
        this.powerPillActive = false;
        this.rotation = true;
    }

    getNextMove(objectExists) {
        let nextMovePosition = this.position + this.direction.movement;

        if(objectExists(nextMovePosition, OBJECT_TYPE.WALL) || objectExists(nextMovePosition, OBJECT_TYPE.GHOSTLAIR)) {
            nextMovePosition = this.position;
        }

        return {nextMovePosition, direction: this.direction};
    }

    makeMove() {
        const classesToRemove = [OBJECT_TYPE.PACMAN];
        const classesToAdd = [OBJECT_TYPE.PACMAN];

        return {classesToRemove, classesToAdd};
    }

    handleKeyInput(e, objectExists) {
        let direction;
        if(e.keyCode >= 37 && e.keyCode <= 40) {
            direction = DIRECTIONS[e.key];
        } else {
            return;
        }

        const nextMovePosition = this.position + direction.movement;

        if(objectExists(nextMovePosition, OBJECT_TYPE.WALL) || objectExists(nextMovePosition, OBJECT_TYPE.GHOSTLAIR)) return;
        
        this.direction = direction;
    }
}
export default Pacman;