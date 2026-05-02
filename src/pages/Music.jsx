import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2, Film, Check, ExternalLink, Play } from 'lucide-react'
import { useConfig } from '@/context/ConfigContext'
import * as api from '@/services/api'

const genreColors = {
  'Tình cảm':             'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  'Hoạt hình / Tình cảm': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'Hài / Tình cảm':       'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'Nhạc kịch / Tình cảm': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  'Tình cảm / Kỳ ảo':     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
}
const defaultGenreColor = 'bg-[var(--surface-alt)] text-[var(--text-sub)]'

export default function Music() {
  const config = useConfig()
  const [tab, setTab] = useState('music')
  const [songs, setSongs]   = useState([])
  const [movies, setMovies] = useState([])
  const [watchedList, setWatchedList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('watched_movies') || '[]') } catch { return [] }
  })
  const [randomMovie, setRandomMovie] = useState(null)

  useEffect(() => {
    api.getSongs().then(setSongs).catch(console.error)
    api.getMovies().then(setMovies).catch(console.error)
  }, [])

  const toggleWatched = (id) => {
    const next = watchedList.includes(id)
      ? watchedList.filter(i => i !== id)
      : [...watchedList, id]
    setWatchedList(next)
    localStorage.setItem('watched_movies', JSON.stringify(next))
  }

  const suggestRandom = () => {
    const unwatched = movies.filter(m => !watchedList.includes(m.id))
    const pool = unwatched.length > 0 ? unwatched : movies
    setRandomMovie(pool[Math.floor(Math.random() * pool.length)])
  }

  const watchedCount = watchedList.length
  const totalMovies = movies.length

  return (
    <div className="page-wrapper min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title">Rạp Nhạc & Phim</h1>
          <p className="section-subtitle">Không gian giải trí của chúng mình 🎬</p>
        </motion.div>

        {/* Tab */}
        <div className="flex justify-center gap-2 mb-8">
          {[['music', <Music2 size={16}/>, 'Nhạc'], ['film', <Film size={16}/>, 'Phim']].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-sm transition-all
                           ${tab === id
                            ? 'bg-primary text-white shadow-pink'
                            : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-sub)] hover:border-primary'}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Spotify embed */}
              {config.spotifyPlaylistUrl ? (
                <iframe
                  src={config.spotifyPlaylistUrl}
                  width="100%" height="380"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-2xl shadow-pink mb-8"
                />
              ) : (
                <div className="card text-center py-10 mb-8">
                  <Music2 size={48} className="mx-auto text-primary/40 mb-4" />
                  <p className="font-body text-[var(--text-sub)]">Thêm Spotify playlist URL vào</p>
                  <code className="text-xs bg-[var(--surface-alt)] px-2 py-1 rounded mt-2 inline-block">
                    src/data/config.js → spotifyPlaylistUrl
                  </code>
                </div>
              )}

              {/* Our songs */}
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--text-main)] mb-4 text-center">
                  🎵 Những bài hát của chúng mình
                </h3>
                <div className="space-y-3">
                  {songs.map((song, i) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card flex items-start gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Play size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-[var(--text-main)] text-sm">{song.title}</p>
                        <p className="font-body text-xs text-[var(--text-sub)]">{song.artist}</p>
                        {song.note && (
                          <p className="font-handwriting text-sm text-primary/80 mt-1 italic leading-snug">
                            "{song.note}"
                          </p>
                        )}
                      </div>
                      {(song.youtube_id || song.youtubeId) && (
                        <a
                          href={`https://youtu.be/${song.youtube_id || song.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-1.5 text-[var(--text-sub)] hover:text-primary transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'film' && (
            <motion.div
              key="film"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Stats + Random */}
              <div className="flex items-center justify-between mb-5">
                <p className="font-body text-sm text-[var(--text-sub)]">
                  Đã xem: <span className="text-primary font-semibold">{watchedCount}/{totalMovies}</span> phim
                </p>
                <button
                  onClick={suggestRandom}
                  className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
                >
                  🎲 Gợi ý ngẫu nhiên
                </button>
              </div>

              {/* Random suggestion */}
              <AnimatePresence>
                {randomMovie && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card bg-primary/5 border border-primary/20 mb-5 flex items-start gap-3"
                  >
                    <span className="text-2xl">🎬</span>
                    <div>
                      <p className="font-body text-xs text-[var(--text-sub)] mb-0.5">Gợi ý tối nay:</p>
                      <p className="font-heading font-bold text-[var(--text-main)]">{randomMovie.title}</p>
                      <p className="font-body text-xs text-[var(--text-sub)]">{randomMovie.year} · {randomMovie.genre}</p>
                    </div>
                    <button onClick={() => setRandomMovie(null)} className="ml-auto text-[var(--text-sub)] text-lg leading-none">×</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Movie list */}
              <div className="space-y-2.5">
                {movies.map((m, i) => {
                  const watched = watchedList.includes(m.id)
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => toggleWatched(m.id)}
                      className={`card flex items-start gap-4 cursor-pointer transition-all hover:shadow-pink-lg
                                   ${watched ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                                        border-2 transition-all mt-0.5
                                        ${watched ? 'bg-primary border-primary' : 'border-[var(--border)]'}`}>
                        {watched && <Check size={13} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-body font-semibold text-[var(--text-main)] text-sm ${watched ? 'line-through' : ''}`}>
                          {m.title}
                        </p>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className="font-body text-xs text-[var(--text-sub)]">{m.year}</span>
                          <span className={`font-body text-xs px-2 py-0.5 rounded-full
                                             ${genreColors[m.genre] || defaultGenreColor}`}>
                            {m.genre}
                          </span>
                        </div>
                        {m.note && (
                          <p className="font-handwriting text-sm text-primary/80 mt-1 italic">"{m.note}"</p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
