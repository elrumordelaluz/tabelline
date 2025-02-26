import { Game } from "./game"

export default function Home() {
  return (
    <div className="mx-auto max-w-lg">
      <Game tables={tables} />
    </div>
  )
}

const tables = Array.from({ length: 10 })
  .map((_, index) => index + 1)
  .reduce((acc, next) => {
    const m = Array.from({ length: 10 }).map((_, mIndex) => [
      `${mIndex} × ${next}`,
      mIndex * next,
    ])
    return { ...acc, [next]: m }
  }, {})
