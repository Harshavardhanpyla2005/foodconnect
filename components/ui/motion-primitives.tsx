"use client"

import * as React from "react"
import {
  motion,
  animate,
  AnimatePresence,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react"
import { cn } from "cn"
import {
  sectionEntranceVariants,
  statusTransitionVariants,
  subtleHoverTap,
  staggerContainerVariants,
} from "@/lib/motion"
import { Check, Clock, Circle } from "lucide-react"

const motionElementMap = {
  section: motion.section,
  div: motion.div,
  article: motion.article,
  main: motion.main,
} as const

export interface MotionSectionProps extends HTMLMotionProps<"div"> {
  as?: keyof typeof motionElementMap
  delay?: number
}

export function MotionSection({
  children,
  className,
  as = "section",
  delay = 0,
  ...props
}: MotionSectionProps) {
  const shouldReduceMotion = useReducedMotion()
  const MotionComp = motionElementMap[as] ?? motion.section

  return (
    <MotionComp
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-40px" }}
      variants={shouldReduceMotion ? undefined : sectionEntranceVariants}
      transition={
        shouldReduceMotion ? { duration: 0 } : { delay }
      }
      className={className}
      {...props}
    >
      {children}
    </MotionComp>
  )
}

export function MotionStaggerContainer({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      variants={shouldReduceMotion ? undefined : staggerContainerVariants}
      transition={shouldReduceMotion ? { duration: 0 } : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.2,
  className,
}: AnimatedCounterProps) {
  const shouldReduceMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = React.useState(0)
  const prevValueRef = React.useRef(0)

  React.useEffect(() => {
    if (shouldReduceMotion) {
      prevValueRef.current = value
      return
    }

    const start = prevValueRef.current
    const controls = animate(start, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest))
      },
      onComplete: () => {
        prevValueRef.current = value
      },
    })

    return () => controls.stop()
  }, [value, duration, shouldReduceMotion])

  const renderedValue = shouldReduceMotion ? value : displayValue

  return (
    <span className={cn("tabular-nums font-semibold", className)}>
      {prefix}
      {renderedValue.toLocaleString()}
      {suffix}
    </span>
  )
}

export function AnimatedStatusTransition({
  children,
  statusKey,
  className,
}: {
  children: React.ReactNode
  statusKey: string
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={statusKey}
        variants={statusTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function MotionCardInteractive({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : subtleHoverTap.hover}
      whileTap={shouldReduceMotion ? undefined : subtleHoverTap.tap}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface JourneyStep {
  id: string
  title: string
  description?: string
  status: "completed" | "current" | "upcoming"
}

export function JourneyProgress({
  steps,
  className,
}: {
  steps: JourneyStep[]
  className?: string
}) {
  return (
    <nav aria-label="Rescue Journey Progress" className={cn("w-full py-2", className)}>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed"
          const isCurrent = step.status === "current"
          const isUpcoming = step.status === "upcoming"

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center gap-2.5 sm:flex-col sm:items-start"
            >
              <div className="flex items-center gap-2 w-full">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent &&
                      "bg-primary/15 text-primary border-2 border-primary ring-2 ring-primary/20",
                    isUpcoming && "bg-muted text-muted-foreground border border-border"
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <Check className="size-3.5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Clock className="size-3 stroke-[2.5]" />
                  ) : (
                    <Circle className="size-2 fill-current" />
                  )}
                </span>

                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "hidden sm:block h-0.5 w-full flex-1 rounded transition-colors",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-xs font-medium tracking-tight",
                    isCurrent && "text-foreground font-semibold",
                    isCompleted && "text-foreground/90",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[0.7rem] text-muted-foreground leading-tight">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
