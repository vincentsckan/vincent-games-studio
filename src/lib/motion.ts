import type { Transition, Variants } from 'framer-motion'

export const easeOut: Transition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
}

export const fadeUp = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: reduced ? { duration: 0 } : easeOut,
  },
})

export const fadeIn = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1 } : { opacity: 0 },
  show: {
    opacity: 1,
    transition: reduced ? { duration: 0 } : { duration: 0.45 },
  },
})

export const stagger = (reduced: boolean, gap = 0.08): Variants => ({
  hidden: {},
  show: {
    transition: reduced ? { staggerChildren: 0 } : { staggerChildren: gap },
  },
})

export const scaleIn = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: reduced ? { duration: 0 } : easeOut,
  },
})
