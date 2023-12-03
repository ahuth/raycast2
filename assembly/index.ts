const STEP_SIZE: f32 = 0.045;

// https://www.assemblyscript.org/concepts.html#special-imports
// Provide an implementation for abort. AssemblyScript provides one itself in release.js, but I
// can't figure out how to get that file working in Next.JS.
function abort(message: usize, fileName: usize, line: u32, column: u32): void {}

// The map, stored as a list of 16-bit numbers, where each bit encodes whether a "cell" is a wall
// or not.
//
// Note that this does mean our Y axis is flipped from what you would normally expect.
const MAP: u16[] = [
  0b1111111111111111,
  0b1000001010000101,
  0b1011100000110101,
  0b1000111010010001,
  0b1010001011110111,
  0b1011101001100001,
  0b1000100000001101,
  0b1111111111111111,
];

let stateX: f32 = 1.5;
let stateY: f32 = 1.5;
let stateΘ: f32 = 0.0;

export function update(up: bool, down: bool, left: bool, right: bool): void {
  let prevX = stateX;
  let prevY = stateY;

  if (up) {
    stateX += NativeMathf.cos(stateΘ) * STEP_SIZE;
    stateY -= NativeMathf.sin(stateΘ) * STEP_SIZE;
  }

  if (down) {
    stateX -= NativeMathf.cos(stateΘ) * STEP_SIZE;
    stateY += NativeMathf.sin(stateΘ) * STEP_SIZE;
  }

  if (right) {
    stateΘ -= STEP_SIZE;
  }

  if (left) {
    stateΘ += STEP_SIZE;
  }

  // If moving put the player in a wall revert the change.
  if (isWall(stateX, stateY)) {
    stateX = prevX;
    stateY = prevY;
  }
}

function isWall(x: f32, y: f32): bool {
  const row = MAP[u16(y)];
  if (!row) { return true; }
  const col = 0b1 << u16(x);
  const val = row & col;
  return val != 0;
}
