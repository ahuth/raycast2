import {useEffect, useRef} from 'react';
import {memory, cast, update, NUM_RAYS} from '../build/release';
import draw from './draw';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});

  // Capture key ups and key downs.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      keysRef.current[event.key] = true;
    }

    function handleKeyUp(event: KeyboardEvent) {
      keysRef.current[event.key] = false;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Cast rays and draw to the canvas.
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d')!;
      const data = new DataView(memory.buffer);
      cast();
      draw(context, data, NUM_RAYS.value);

      let id = -1;

      // eslint-disable-next-line no-inner-declarations
      function raycast() {
        const {ArrowUp, ArrowDown, ArrowLeft, ArrowRight} = keysRef.current;
        update(ArrowUp, ArrowDown, ArrowLeft, ArrowRight);
        cast();
        draw(context, data, NUM_RAYS.value);
        id = window.requestAnimationFrame(raycast);
      }

      id =  window.requestAnimationFrame(raycast);

      return () => window.cancelAnimationFrame(id);
    }
  }, []);

  return (
    <>
      <canvas ref={canvasRef} height="200" width="320" style={{maxHeight: "100vh", width: "100%"}} />
    </>
  )
}
