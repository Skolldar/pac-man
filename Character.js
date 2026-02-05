import { DIRECTIONS } from "./setup.js";

class Character {
    constructor(speed, position) {
        this.position = position;
        this.speed = speed;
        this.direction = null;
        this.timer = 0;
        this.rotation = false;
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

    setNewPosition(nextMovePosition) {
        this.position = nextMovePosition;
    }
}

export default Character;
