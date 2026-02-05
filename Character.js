
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

    getNextMove(objectExists) {
        if (!this.direction) return { nextMovePosition: this.position, direction: this.direction };

        const nextMovePosition = this.position + this.direction.movement;
        return { nextMovePosition, direction: this.direction };
    }

    setNewPosition(nextMovePosition, direction = null) {
        this.position = nextMovePosition;
        if (direction) this.direction = direction;
    }
}

export default Character;
