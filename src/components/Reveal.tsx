import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp, stagger } from '../lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article'
}

export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion() ?? false
  const Mot = motion[as]

  return (
    <Mot
      className={className}
      variants={fadeUp(reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={reduced ? { duration: 0 } : { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Mot>
  )
}

export function RevealGroup({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'ul' | 'section'
}) {
  const reduced = useReducedMotion() ?? false
  const Mot = motion[as]

  return (
    <Mot
      className={className}
      variants={stagger(reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </Mot>
  )
}

export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li' | 'article'
}) {
  const reduced = useReducedMotion() ?? false
  const Mot = motion[as]

  return (
    <Mot className={className} variants={fadeUp(reduced)}>
      {children}
    </Mot>
  )
}
