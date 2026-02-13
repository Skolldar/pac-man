import { DIRECTIONS } from "./setup.js";

/**
 * TouchControls: Handle on-screen button and swipe input for mobile
 */
export class TouchControls {
  constructor(pacman, objectExists) {
    this.pacman = pacman;
    this.objectExists = objectExists;
    this.isActive = false;
    this.setupButtonControls();
  }

  setupButtonControls() {
    const buttons = {
      up: document.getElementById('btn-up'),
      down: document.getElementById('btn-down'),
      left: document.getElementById('btn-left'),
      right: document.getElementById('btn-right'),
    };

    // Map buttons to directions
    const directionMap = {
      up: DIRECTIONS['ArrowUp'],
      down: DIRECTIONS['ArrowDown'],
      left: DIRECTIONS['ArrowLeft'],
      right: DIRECTIONS['ArrowRight'],
    };

    Object.entries(buttons).forEach(([dir, btn]) => {
      if (!btn) return;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleDirectionInput(directionMap[dir]);
      }, { passive: false });

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.handleDirectionInput(directionMap[dir]);
      });

      // Also support pointer events (more modern)
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleDirectionInput(directionMap[dir]);
      });
    });
  }

  handleDirectionInput(direction) {
    if (!this.pacman || !direction) return;

    this.pacman.direction = direction;
  }

  enable() {
    this.isActive = true;
  }

  disable() {
    this.isActive = false;
  }
}

export default TouchControls;
