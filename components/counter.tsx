import { cn } from "@/lib/utils"
import { MotionValue, motion, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface NumberProps {
  mv: MotionValue<number>
  number: number
  fontSize?: number
}

function Number({ mv, number, fontSize }: NumberProps) {
  let y = useTransform(mv, (latest: number) => {
    let placeValue = latest % 10
    let offset = (10 + number - placeValue) % 10
    let memo = offset * (fontSize || 10)
    if (offset > 5) {
      memo -= 10 * (fontSize || 10)
    }
    return memo
  })

  return (
    <motion.span
      className="absolute inset-0 flex items-center justify-center"
      style={{ y }}
    >
      {number}
    </motion.span>
  )
}

interface DigitProps {
  place: number
  value: number
}

function Digit({ place, value }: DigitProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState<number | undefined>(undefined)

  let valueRoundedToPlace = Math.floor(value / place)
  let animatedValue = useSpring(valueRoundedToPlace)

  useEffect(() => {
    if (ref.current) {
      const fz = parseInt(
        window.getComputedStyle(ref.current as HTMLSpanElement).fontSize,
        10,
      )
      setFontSize(fz)
    }
  }, [setFontSize, ref.current])

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace)
  }, [animatedValue, valueRoundedToPlace])

  return (
    <div
      className="relative h-12 w-[1ch] tabular-nums"
      style={{ height: fontSize || 12 }}
      ref={ref}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} fontSize={fontSize} />
      ))}
    </div>
  )
}

interface CounterProps {
  value: number
  places?: number[]
  className?: string
}

export function Counter({
  value,
  places = [100, 10, 1],
  className,
}: CounterProps) {
  return (
    <div className={cn("group relative inline-block", className)}>
      <div className="flex gap-2 overflow-hidden rounded px-2 leading-none font-bold text-inherit">
        {places.map((place) => (
          <Digit key={place} place={place} value={value} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="h-1/4 bg-linear-to-b from-black to-transparent" />
        <div className="absolute bottom-0 h-1/4 w-full bg-linear-to-t from-black to-transparent" />
      </div>
    </div>
  )
}
