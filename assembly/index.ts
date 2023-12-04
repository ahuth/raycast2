export const NUM_RAYS: f32 = 320;
const FOV: f32 = NativeMathf.PI / 2.7;
const FOV_HALF: f32 = FOV / 2;
const PI_2: f32 = NativeMathf.PI / 2;
const STEP_SIZE: f32 = 0.045;
const ANGLE_STEP = FOV / NUM_RAYS;

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

/**
 * Update the player state based on input.
 */
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

/**
 * Cast rays from the player acros their field of view. Write to memory the distance each ray went
 * before hitting a wall.
 */
export function cast(): void {
  // Start at the far left range of the player's FOV, and sweep across all the way to the right
  // casting rays.
  const startingAngle = stateΘ + FOV_HALF;

  for (let i: u16 = 0; i < NUM_RAYS; i++) {
    const angle = startingAngle - i * ANGLE_STEP;

    // Get both the horizontal and verticle intersections and pick the closest.
    const h_dist = getHorizontalIntersection(angle);
    const v_dist = getVerticalIntersection(angle);
    const distance = NativeMathf.min(h_dist, v_dist);

    // Adjust the distance to prevent a fishbowl effect.
    const adjustedDistance = distance * NativeMathf.cos(angle - stateΘ);

    // Store the distance in memory.
    store<f32>(i, adjustedDistance);
  }
}

/**
 * Is a point inside a wall.
 */
function isWall(x: f32, y: f32): bool {
  const row = MAP[u16(y)];
  if (!row) { return true; }
  const col = 0b1 << u16(x);
  const val = row & col;
  return val != 0;
}

/**
 * a^2 + b^2 = c^2
 */
function distance(a: f32, b: f32): f32 {
  return NativeMathf.sqrt(a * a + b * b);
}

// Return the nearest wall a ray intersects with a horizontal grid line.
function getHorizontalIntersection(angle: f32): f32 {
  // Whether an angle is facing "up" or not.
  const up = NativeMathf.abs(NativeMathf.floor((angle / 2) % 2)) !== 0;

  const firstY: f32 = up ? NativeMathf.ceil(stateY) - stateY : NativeMathf.floor(stateY) - stateY;
  const firstX: f32 = -firstY / NativeMathf.tan(stateΘ);

  const deltaY: f32 = up ? 1.0 : -1.0;
  const deltaX: f32 = -deltaY / NativeMathf.tan(stateΘ);

  return findWall(firstX, firstY, deltaX, deltaY);
}

// Return the nearest wall a ray intersects with a vertical grid line.
function getVerticalIntersection(angle: f32): f32 {
  // Whether an angle is facing "right" or not.
  const right = NativeMathf.abs(NativeMathf.floor((angle - PI_2) % 2)) !== 0;

  const firstX: f32 = right ? NativeMathf.ceil(stateX) - stateX : NativeMathf.floor(stateX) - stateX;
  const firstY: f32 = -NativeMathf.tan(stateΘ) / firstX;

  const deltaX: f32 = right ? 1.0 : -1.0;
  const deltaY: f32 = deltaX * -NativeMathf.tan(stateΘ);

  return findWall(firstX, firstY, deltaX, deltaY);
}

/**
 * Move in discrete steps until a wall is found.
 */
function findWall(x: f32, y: f32, deltaX: f32, deltaY: f32): f32 {
  let currentX: f32 = x;
  let currentY: f32 = y;

  // Stop looking after 255 iterations if we haven't found a wall.
  for (let i = 0; i < 256; i++) {
    if (isWall(currentX, currentY)) {
      break;
    }

    // Didn't hit a wall, so advance.
    currentX += deltaX;
    currentY += deltaY;
  }

  // Return the distance between the original coordinate and the wall intersection.
  return distance(currentX - x, currentY - y);
}
