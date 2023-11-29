import {add} from '../build/release';

export default function Home() {
  return (
    <main>
      <h1>hello world</h1>
      <span>{add(1, 2)}</span>
    </main>
  )
}
