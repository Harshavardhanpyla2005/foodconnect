import type { Transition, Variants } from "motion/react"

export const motionDurations = {
  instant: 0.1,
  fast: 0.18,
  normal: 0.28,
  gentle: 0.45,
  journey: 0.65,
} as const

export const motionTransitions = {
  easeDecelerate: [0.16, 1, 0.3, 1] as [number, number, number, number],
  springResponsive: {
    type: "spring",
    stiffness: 380,
    damping: 28,
  } satisfies Transition,
  springGentle: {
    type: "spring",
    stiffness: 220,
    damping: 24,
  } satisfies Transition,
} as const

export const sectionEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDurations.gentle,
      ease: motionTransitions.easeDecelerate,
    },
  },
}

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionDurations.normal },
  },
}

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export const statusTransitionVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: motionDurations.fast,
      ease: motionTransitions.easeDecelerate,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: motionDurations.fast },
  },
}

export const journeyStepVariants: Variants = {
  inactive: {
    opacity: 0.5,
    scale: 0.98,
  },
  active: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: motionDurations.gentle,
      ease: motionTransitions.easeDecelerate,
    },
  },
  completed: {
    opacity: 0.9,
    scale: 1,
    transition: { duration: motionDurations.normal },
  },
}

export const subtleHoverTap = {
  hover: { y: -1, transition: { duration: 0.15 } },
  tap: { scale: 0.99, transition: { duration: 0.1 } },
}

export const cardElevateHover: Variants = {
  hover: {
    y: -3,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  tap: {
    scale: 0.985,
    transition: { duration: 0.1 },
  },
}

export const editorialRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
}

export const tactileTapPreset = {
  whileTap: { scale: 0.985, transition: { duration: 0.1 } },
}

