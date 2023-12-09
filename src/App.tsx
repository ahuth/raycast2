import {useEffect, useRef} from 'react';
import {memory, cast, NUM_RAYS} from '../build/release';
import draw from './draw';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d')!;
      const data = new DataView(memory.buffer);
      cast();
      draw(context, data, NUM_RAYS.value);
    }
  }, []);

  return (
    <>
      <canvas ref={canvasRef} height="200" width="320" style={{maxHeight: "100vh", width: "100%"}} />
    </>
  )
}
