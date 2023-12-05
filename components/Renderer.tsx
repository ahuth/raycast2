'use client';

import dynamic from 'next/dynamic';

export default dynamic(
  async () => {
    const {cast, update, memory, NUM_RAYS} = await import('@/build/release');
    const memoryArray = new Float32Array(memory.buffer);

    cast();

    return function Renderer() {
      const mem = memoryArray.slice(0, NUM_RAYS.value);
      console.log('@@@', mem);
      return <span>Hi</span>
    };
  },
  {
    // Next can run wasm on the server, but the JS file that asc generates to load the wasm file
    // does not run there. Instead of either figuring out how to get that file running in Node or
    // loading the wasm directly, let's just not even server-side render this component.
    ssr: false,
  },
);
