export const NUM_RAYS: u32 = 320;
const FOV: f32 = NativeMathf.PI / 2.7;
const FOV_HALF: f32 = FOV / 2;
const PI_1_2: f32 = NativeMathf.PI / 2;
const PI_3_2: f32 = NativeMathf.PI * 3 / 2;
const STEP_SIZE: f32 = 0.045;
const ANGLE_STEP = FOV / f32(NUM_RAYS);

// The map, stored as a list of 16-bit numbers, where each bit encodes whether a "cell" is a wall
// or not.
//
// Note that this means both axes are flipped from what you'd normally expected.
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
  const prevX = stateX;
  const prevY = stateY;

  if (up) {
    stateX += NativeMathf.cos(stateΘ) * STEP_SIZE;
    stateY -= NativeMathf.sin(stateΘ) * STEP_SIZE;
  }

  if (down) {
    stateX -= NativeMathf.cos(stateΘ) * STEP_SIZE;
    stateY += NativeMathf.sin(stateΘ) * STEP_SIZE;
  }

  if (right) {
    // Subtract instead of add because our coordinate system is reversed due to how the map is
    // being represented.
    stateΘ -= STEP_SIZE;
  }

  if (left) {
    // Add instead of subtract because our coordinate system is reversed due to how the map is
    // being represented.
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

  for (let i: u32 = 0; i < u32(NUM_RAYS); i++) {
    const angle = startingAngle - f32(i) * ANGLE_STEP;

    // Get both the horizontal and verticle intersections and pick the closest.
    const h_dist = getHorizontalIntersection(angle);
    const v_dist = getVerticalIntersection(angle);
    const distance = NativeMathf.min(h_dist, v_dist);

    // Adjust the distance to prevent a fishbowl effect.
    const adjustedDistance = distance * NativeMathf.cos(angle - stateΘ);

    // Store the distance in memory. Use the `--memoryBase` compiler flag to make sure
    // AssemblyScript doesn't overwrite this memory for the data structures it allocates for.
    store<f32>(i << 2, adjustedDistance);
  }
}

/**
 * Is a point inside a wall.
 */
function isWall(x: f32, y: f32): bool {
  if (x < 0 || x >= 16) { return true; }
  if (y < 0 || y >= 8) { return true; }
  const row = MAP[u16(y)];
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
  // Whether an angle is facing "up" or not. Think the top half of a unit circle, although in our
  // coordinate system this is actually facing down.
  const up = angle > 0 && angle < NativeMathf.PI;

  // The Y coordinate of the first vertical grid line this ray intersects with. This is easy to get
  // because in our coordinate system all grid lines are on whole number values, so we can get it
  // by using `ceil` or `floor`.
  const firstY: f32 = up ? NativeMathf.ceil(stateY) : NativeMathf.floor(stateY);
  // Get the X coordinate of the first vertical grid line intersection via tan(a) = opp / adj.
  const opp = firstY - stateY;
  const adj = opp / NativeMathf.tan(angle);
  const firstX = stateX + adj;

  const deltaY: f32 = up ? 1.0 : -1.0;
  const deltaX: f32 = deltaY / NativeMathf.tan(angle);

  return findWall(firstX, firstY, deltaX, deltaY);
}

// Return the nearest wall a ray intersects with a vertical grid line.
function getVerticalIntersection(angle: f32): f32 {
  // Whether an angle is facing "right" or not. Think the right half of a unit circle, although in
  // our coordinate system this is actually facing left.
  const right = angle < PI_1_2 || angle > PI_3_2;

  // The X coordinate of the first vertical grid line this ray intersects with. This is easy to get
  // because in our coordinate system all grid lines are on whole number values, so we can get it
  // by using `ceil` or `floor`.
  const firstX: f32 = right ? NativeMathf.ceil(stateX) : NativeMathf.floor(stateX);
  // Get the Y coordinate of the first vertical grid line intersection via tan(a) = opp / adj.
  const adj = firstX - stateX;
  const opp = adj * NativeMathf.tan(angle);
  const firstY = stateY + opp;

  const deltaX: f32 = right ? 1.0 : -1.0;
  const deltaY: f32 = deltaX * NativeMathf.tan(angle);

  return findWall(firstX, firstY, deltaX, deltaY);
}

/**
 * Move in discrete steps until a wall is found.
 */
function findWall(x: f32, y: f32, deltaX: f32, deltaY: f32): f32 {
  // Stop looking after 255 iterations if we haven't found a wall.
  for (let i = 0; i < 256; i++) {
    if (isWall(x, y)) {
      break;
    }

    // Didn't hit a wall, so advance.
    x += deltaX;
    y += deltaY;
  }

  // Return the distance between the original coordinate and the wall intersection.
  return distance(x, y);
}
