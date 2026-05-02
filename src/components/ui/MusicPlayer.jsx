import { useState, useEffect, useRef } from 'react'
import { Music, Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { config } from '@/data/config'

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying]   = useState(false)
  const [isMuted, setIsMuted]       = useState(false)
  const [currentIndex, setCurrent]  = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [volume, setVolume]         = useState(0.6)
  const audioRef = useRef(null)
  const playlist = config.defaultMusic

  // Khi đổi bài: load src mới, play nếu đang phát
  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return
    audioRef.current.src = playlist[currentIndex]?.src
    audioRef.current.volume = volume
    audioRef.current.loop = playlist.length === 1
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false))
  }, [currentIndex])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Autoplay khi nhận event từ Landing page (sau khi đăng nhập)
  useEffect(() => {
    const startMusic = () => {
      if (!audioRef.current || playlist.length === 0 || isPlaying) return
      audioRef.current.src = playlist[currentIndex]?.src
      audioRef.current.volume = volume
      audioRef.current.loop = playlist.length === 1
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }

    // Lắng nghe event từ Landing page (trigger người dùng có gesture)
    window.addEventListener('music:autoplay', startMusic)

    return () => {
      window.removeEventListener('music:autoplay', startMusic)
    }
  }, [playlist, currentIndex, volume, isPlaying])

  const togglePlay = () => {
    if (!audioRef.current || playlist.length === 0) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
    setIsPlaying(p => !p)
  }

  const skipNext = () => {
    setCurrent(i => (i + 1) % playlist.length)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const next = !isMuted
    audioRef.current.muted = next
    setIsMuted(next)
  }

  if (playlist.length === 0) return null

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={skipNext}
        src={playlist[currentIndex]?.src}
        preload="none"
      />
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mb-2 bg-[var(--surface)] border border-[var(--border)]
                         rounded-2xl p-4 shadow-pink-lg w-56"
            >
              <p className="text-xs text-[var(--text-sub)] mb-0.5 font-body">Đang phát</p>
              <p className="text-sm font-semibold font-body text-[var(--text-main)] truncate mb-3">
                {playlist[currentIndex]?.title || 'Nhạc của chúng mình'}
              </p>

              {/* Controls */}
              <div className="flex items-center gap-3 mb-3">
                <button onClick={toggleMute}
                  className="text-[var(--text-sub)] hover:text-primary transition-colors">
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button onClick={togglePlay}
                  className="flex-1 flex justify-center text-primary hover:text-accent transition-colors">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                {playlist.length > 1 && (
                  <button onClick={skipNext}
                    className="text-[var(--text-sub)] hover:text-primary transition-colors">
                    <SkipForward size={16} />
                  </button>
                )}
              </div>

              {/* Volume slider */}
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => { setVolume(+e.target.value); setIsMuted(false) }}
                className="w-full h-1 accent-primary cursor-pointer"
              />

              {/* Playlist nav dots */}
              {playlist.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {playlist.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all
                                   ${i === currentIndex ? 'bg-primary scale-125' : 'bg-[var(--border)]'}`} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <motion.button
          onClick={() => setIsExpanded(p => !p)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-full bg-primary text-white shadow-pink-lg
                     flex items-center justify-center relative"
          aria-label="Music player"
        >
          {isPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            >
              <Music size={20} />
            </motion.div>
          ) : (
            <Music size={20} />
          )}
          {isPlaying && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full
                             border-2 border-white animate-pulse" />
          )}
        </motion.button>
      </div>
    </>
  )
}
