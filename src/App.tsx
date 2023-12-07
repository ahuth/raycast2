import {memory} from '../build/release';

export default function App() {
  const mem = new DataView(memory.buffer);
  console.log(mem);

  return (
    <>
      <p>Hello world</p>
      <canvas id="canvas" />
    </>
  )
}
