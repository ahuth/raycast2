'use client';

import dynamic from 'next/dynamic';

export default dynamic(
  async () => {
    const {cast, update, memory, NUM_RAYS} = await import('@/build/release.wasm');
    const memoryArray = new Float32Array(memory.buffer);

    cast();

    return function Renderer() {
      const mem = memoryArray.slice(0, NUM_RAYS.value);
      console.log('@@@', mem);
      return <span>Hi</span>
    };
  }
);
