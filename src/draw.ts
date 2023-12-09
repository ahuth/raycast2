export default function draw(context: CanvasRenderingContext2D, data: DataView, numRays: number) {
  // Clear the canvas.
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  // Draw a vertical line for each ray.
  for (let i = 0; i < numRays; i++) {
    const distance = data.getFloat32(i << 2, true);
    const width = context.canvas.width / numRays;
    const height = Math.min(context.canvas.height, distance * 255);
    const x = i * width;
    const y = context.canvas.height / 2 - height / 2;

    context.fillRect(x, y, width, height);
  }
}
