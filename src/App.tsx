import {useEffect} from 'react';
import {memory, cast, NUM_RAYS} from '../build/release';

export default function App() {
  useEffect(() => {
    const data = new DataView(memory.buffer);

    cast();

    for (let i = 0; i < NUM_RAYS.value; i++) {
      console.log('@@@', i, data.getFloat32(i << 2, true));
    }
  }, []);


  return (
    <>
      <p>Hello world</p>
      <canvas id="canvas" />
    </>
  )
}
