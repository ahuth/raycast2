import {useEffect} from 'react';
import {cast, RAYS} from '../build/release';

export default function App() {
  useEffect(() => {
    const rays = RAYS.value;

    cast();

    for (let i = 0; i < rays.length; i++) {
      console.log('@@@', i, rays[i]);
    }
  }, []);


  return (
    <>
      <p>Hello world</p>
      <canvas id="canvas" />
    </>
  )
}
