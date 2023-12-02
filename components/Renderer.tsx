import dynamic from 'next/dynamic';

export default dynamic(
  async () => {
    const {update} = await import('@/build/release.wasm');

    update(true, false, false, false);

    return function Renderer() {
      return <span>Hi</span>
    };
  },
);
