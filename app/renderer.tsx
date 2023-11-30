import dynamic from 'next/dynamic';

export default dynamic(
  async () => {
    const {add} = await import('@/build/release.wasm');

    return function Renderer() {
      return <span>{add(1, 2)}</span>
    };
  },
);
