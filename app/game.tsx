"use client"

import { Counter } from "@/components/counter"
import { ShootingStars } from "@/components/shooting-stars"
import { StarsBackground } from "@/components/stars-background"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"
import { useForm } from "react-hook-form"
import { useTimer } from "react-timer-hook"
import { z } from "zod"

interface Props {
  tables: { [t: number]: Step[] }
}

type Step = [string, number]

const FormSchema = z.object({
  value: z.string().min(1),
})

export function Game({ tables }: Props) {
  const [selected, setSelected] = useState([1, 2, 3])
  const [step, setStep] = useState(0)
  const [maxSteps, setMaxSteps] = useState(10)
  const [showConfetti, setShowConfetti] = useState<any>(null)
  const [results, setResults] = useState<(boolean | undefined)[]>(
    Array.from({ length: maxSteps }),
  )
  const [timedOut, setTimedOut] = useState(false)

  const selectedValuesToPlay = Object.keys(tables)
    .filter((v) => selected.includes(Number(v)))
    .map((tableOf) => tables[Number(tableOf)])
    .flat()

  const arr: Step[] = useMemo(
    () => shuffle(selectedValuesToPlay).slice(0, maxSteps),
    [selected, maxSteps],
  )

  const { seconds, restart } = useTimer({
    expiryTimestamp: new Date(
      new Date().setSeconds(new Date().getSeconds() + 10),
    ),
    onExpire: () => setTimedOut(true),
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit({ value }: z.infer<typeof FormSchema>) {
    if (Number(value) === arr[step][1]) {
      setShowConfetti(Date.now())
      nextStep()
      setResults((r) => r.map((r, index) => (index === step ? true : r)))
    }
  }

  function nextStep() {
    setStep((s) => s + 1)
    const time = new Date(new Date().setSeconds(new Date().getSeconds() + 10))
    setTimedOut(false)
    restart(time, true)
    form.reset({ value: "" })
  }

  return (
    <main className="relative z-50 flex min-h-screen flex-col">
      <ShootingStars />
      <StarsBackground />
      <header className="relative mt-4 flex gap-2">
        {Object.keys(tables).map((t) => (
          <Button
            key={t}
            variant={selected.includes(Number(t)) ? "outline" : "default"}
            onClick={() => {
              if (selected.includes(Number(t))) {
                setSelected((s) => s.filter((v) => v !== Number(t)))
              } else {
                setSelected((s) => [...s, Number(t)])
              }
            }}
          >
            {t}
          </Button>
        ))}
      </header>

      <div className="my-auto text-center">
        <h2 className="relative z-10 mx-auto my-4 bg-gradient-to-b from-neutral-400 via-white to-white bg-clip-text text-center text-7xl font-bold tracking-tight text-transparent">
          {arr[step][0]}
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="number" className="mx-auto w-20" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {timedOut ? (
              <Button
                variant="destructive"
                onClick={() => {
                  nextStep()

                  setResults((r) =>
                    r.map((r, index) => (index === step ? false : r)),
                  )
                }}
              >
                Prossimo
              </Button>
            ) : (
              <Button type="submit" variant="secondary">
                Submit
              </Button>
            )}
          </form>
        </Form>

        {showConfetti ? (
          <Fireworks
            key={showConfetti}
            autorun={{ speed: 3, duration: 50, delay: 3 }}
          />
        ) : null}
        <div className="my-12 flex justify-center gap-2">
          {results.map((r) => (
            <div
              className={cn(
                "h-2 w-2 rounded-full bg-neutral-600",
                r === true ? "bg-green-300" : r === false ? "bg-red-500" : "",
              )}
            />
          ))}
        </div>
        <div className="flex justify-center">
          {seconds ? (
            <Counter
              value={seconds}
              places={[10, 1]}
              className="text-5xl text-white"
            />
          ) : null}
        </div>
      </div>
    </main>
  )
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}
