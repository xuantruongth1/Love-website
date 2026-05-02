import { motion } from 'framer-motion'

export default function LoadingHeart({ text = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            className="text-2xl"
          >
            ❤️
          </motion.div>
        ))}
      </div>
      <p className="font-body text-sm text-[var(--text-sub)]">{text}</p>
    </div>
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="h-4 bg-[var(--surface-alt)] rounded-full w-3/4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={`h-3 bg-[var(--surface-alt)] rounded-full ${i % 2 === 0 ? 'w-full' : 'w-5/6'}`} />
      ))}
    </div>
  )
}
