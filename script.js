"use strict";

// Cell flags
const U = 1; // Can move up
const D = 2; // Can move down
const L = 4; // Can move left
const R = 8; // Can move right
const UDLR = U|D|L|R;
const UDL = U|D|L;
const UDR = U|D|R;
const UD = U|D;
const UL = U|L;
const UR = U|R;
const ULR = U|L|R;
const DLR = D|L|R;
const DL = D|L;
const DR = D|R;
const LR = L|R;
const W = 16; // Water

const cells = [
  // Row 0
  [DR,  DLR,  DLR,  DLR,  DLR,  DLR,  DLR,  L,    0,    0,    0,    0],
  // Row 1
  [UDR, ULR,  UDLR, UDLR, UDLR, UDLR, UDLR, DL,   0,    0,    0,    0],
  // Row 2
  [UDR, LR,   ULR,  UDLR, ULR,  ULR,  UDLR, UDL,  0,    DR|W, LR|W, L],
  // Row 3
  [UD,  0,    0,    UD,   0,    0,    UR,   UDLR, DLR,  UDL|W, 0,    0],
  // Row 4
  [UD,  0,    DR,   UDL,  0,    0,    0,    UDR,  UDLR, UDLR, DLR,  DL],
  // Row 5
  [UD,  0,    UDR,  UL,   0,    0,    R,    UDLR, UDLR, UDLR, UDLR, UDL],
  // Row 6
  [UD,  0,    UD,   0,    0,    0,    DR,   UDLR, UDLR, UDLR, UDLR, UDL],
  // Row 7
  [UDR, DLR,  UDLR, DLR,  DLR,  DLR,  UDLR, UDLR, UDLR, UDLR, UDLR, UDL ],
  // Row 8
  [UDR, UDLR, UDLR, UDLR, UDLR, UDLR, UDLR, UDLR, UDLR, UDLR, UDLR, UDL],
  // Row 9
  [UDR, UDLR, UDLR, UDLR, UDL,  UDR,  UDLR, UDLR, UDLR, UDLR, UDL,  UL],
  // Row 10
  [UR,  ULR,  ULR,  ULR,  ULR,  ULR,  ULR,  ULR,  ULR,  ULR,  ULR,  L]
]

const map = {
  element: document.getElementById("map"),
  animation: {
    timestamp: null,
  }
}

// Player character
const pc = {
  element: document.getElementById("pc"),
  animation: {
    current: null
  },
  cell: {
    x: 2,
    y: 4
  },
  canSwim: false,
}

// NPC
const npc1 = {
  element: document.getElementById("npc1"),
  animation: {
    current: null
  },
  cell: {
    x: 10,
    y: 9
  },
  canSwim: false,
}

const position = (cell) => {
  let cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--cell-size"));
  return {
    x: cell.x * cellSize,
    y: cell.y * cellSize
  }
}

const positionCharacter = (character) => {
  const characterPosition = position(character.cell);
  character.element.style.translate = `${characterPosition.x}vmin ${characterPosition.y}vmin`
}

positionCharacter(pc);

const nextCell = (cell, direction) => {
  const flag = cells[cell.y][cell.x];
  if (flag & direction) {
    switch (direction) {
      case L:
        return {
          x: cell.x - 1,
          y: cell.y
        }
      case R:
        return {
          x: cell.x + 1,
          y: cell.y
        }
      case U:
        return {
          x: cell.x,
          y: cell.y - 1,
        }
      case D:
        return {
          x: cell.x,
          y: cell.y + 1,
        }
    }
  }
  return cell;
}

const isSameCell = (cell1, cell2) => cell1.x == cell2.x && cell1.y == cell2.y;

const flipCharacter = (character, direction) => {
  if (direction == L) {
    character.element.style.scale = "-1 1";
  }
  else if (direction == R) {
    character.element.style.scale = "1 1";
  }
}

const newMapAnimation = (direction) => {
  const timeline = {
      duration: 750,
      fill: "forwards"
  };
  const effect = new Map([
      [U, [{ transform: "rotateX(15deg)" }, { transform: "rotateX(0deg)" }]],
      [D, [{ transform: "rotateX(-15deg)" }, { transform: "rotateX(0deg)" }]],
      [L, [{ transform: "rotateY(-15deg)" }, { transform: "rotateY(0deg)" }]],
      [R, [{ transform: "rotateY(15deg)" }, { transform: "rotateY(0deg)" }]],
  ]);
  return new Animation(new KeyframeEffect(map.element, effect.get(direction), timeline));
};

const newCharacterAnimation = (character, direction, action) => {
  const timeline = {
    duration: 750,
    fill: "forwards"
  }
  const fromCell = character.cell;
  const toCell = nextCell(fromCell, direction);
  const toPosition = position(toCell);
  let effect;
  switch (action) {
    case "move":
      if (isSameCell(fromCell, toCell)) {
        effect = {
          translate: `${toPosition.x}vmin ${toPosition.y}vmin`
        }    
      }
      else {
        effect = {
          translate: `${toPosition.x}vmin ${toPosition.y}vmin`
        }
      }
      break;
    case "jump":
      effect = {
        translate: `${toPosition.x}vmin ${toPosition.y}vmin`,
      }
      break;
  }
  return new Animation(new KeyframeEffect(character.element, effect,
    timeline));
};

const move = (character, direction) => {
}

const jump = (direction) => {
  const jumpCooldown = 1000;
  const mapAnimation = newMapAnimation(direction);
  const jumpAnimation = newCharacterAnimation(pc, direction, "jump");
  window.requestAnimationFrame((timestamp) => {
    const mapTimestamp = map.animation.timestamp;
    if (!mapTimestamp || timestamp - mapTimestamp > jumpCooldown) {
      mapAnimation.play();
      map.animation.timestamp = timestamp;
      flipCharacter(pc, direction);
      jumpAnimation.play();
      pc.cell = nextCell(pc.cell, direction)
    }
  })
}

document.addEventListener("keydown", function onEvent(event) {
  if (!event.repeat) {
    let direction;
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        direction = U;
        break;
      case "ArrowDown":
      case "KeyS":
        direction = D;
        break;
      case "ArrowLeft":
      case "KeyA":
        direction = L;
        break;
      case "ArrowRight":
      case "KeyD":
        direction = R;
      break;
      default:
        return;
    }
    jump(direction);
  }
});
