import { motion } from 'framer-motion'

export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-none"
          style={{ width: 7, height: 7, background: `hsl(${240 + i * 20}, 80%, 65%)` }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.14,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
