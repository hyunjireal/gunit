import type { Variants } from 'framer-motion'

const premiumEase = [0.22, 1, 0.36, 1] as const

export const buddyInViewViewport = {
  once: true,
  amount: 0.18,
}

export const buddySectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.46,
      ease: premiumEase,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
}

export const buddyStaggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
}

export const buddyCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: premiumEase,
    },
  },
}

export const buddySurfaceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: premiumEase,
    },
  },
}

export const buddyChipVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: premiumEase,
    },
  },
}

export const buddyButtonHover = {
  scale: 1.02,
  transition: {
    duration: 0.18,
    ease: premiumEase,
  },
}

export const buddyButtonTap = {
  scale: 0.985,
  transition: {
    duration: 0.12,
    ease: premiumEase,
  },
}
