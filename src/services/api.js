/**
 * api.js — Centralized API service
 * Tat ca goi Flask backend deu di qua day.
 * credentials: 'include' bat buoc cho Flask session cookie.
 */
import { uploadImageToImgBB } from './imgbb.js'

const BASE = ''

async function req(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + url, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────
export const getMe      = ()           => req('GET',  '/api/auth/me')
export const login      = (password)   => req('POST', '/api/auth/login', { password })
export const logout     = ()           => req('POST', '/api/auth/logout')
export const getUnread  = ()           => req('GET',  '/api/auth/unread')

// ── Photos ────────────────────────────────────────────────────────
export const getPhotos      = ()           => req('GET',    '/api/photos')
export const addPhoto       = (data)       => req('POST',   '/api/photos', data)
export const updatePhoto    = (id, data)   => req('PUT',    `/api/photos/${id}`, data)
export const deletePhoto    = (id)         => req('DELETE', `/api/photos/${id}`)
export const reorderPhotos  = (orders)     => req('POST',   '/api/photos/reorder', orders)

// ── Image Upload ──────────────────────────────────────────────────
export async function uploadImage(file) {
  try {
    const url = await uploadImageToImgBB(file)
    // Trả về định dạng giống hệt backend cũ để các UI components không bị lỗi
    return { url: url, filename: file.name }
  } catch (err) {
    throw new Error(err.message || 'Lỗi upload ảnh lên ImgBB')
  }
}

// ── Config ────────────────────────────────────────────────────────
export const getConfig  = ()     => req('GET',  '/api/config')
export const saveConfig = (data) => req('POST', '/api/config', data)

// ── Reasons ───────────────────────────────────────────────────────
export const getReasons   = ()          => req('GET',    '/api/reasons')
export const addReason    = (data)      => req('POST',   '/api/reasons', data)
export const updateReason = (id, data)  => req('PUT',    `/api/reasons/${id}`, data)
export const deleteReason = (id)        => req('DELETE', `/api/reasons/${id}`)
export const bulkReasons  = (items)     => req('POST',   '/api/reasons/bulk', items)

// ── Quiz ──────────────────────────────────────────────────────────
export const getQuiz    = ()          => req('GET',    '/api/quiz')
export const addQuiz    = (data)      => req('POST',   '/api/quiz', data)
export const updateQuiz = (id, data)  => req('PUT',    `/api/quiz/${id}`, data)
export const deleteQuiz = (id)        => req('DELETE', `/api/quiz/${id}`)

// ── Wheel ─────────────────────────────────────────────────────────
export const getWheel    = ()          => req('GET',    '/api/wheel')
export const addWheel    = (data)      => req('POST',   '/api/wheel', data)
export const updateWheel = (id, data)  => req('PUT',    `/api/wheel/${id}`, data)
export const deleteWheel = (id)        => req('DELETE', `/api/wheel/${id}`)

// ── Timeline ──────────────────────────────────────────────────────
export const getTimeline    = ()          => req('GET',    '/api/timeline')
export const addTimeline    = (data)      => req('POST',   '/api/timeline', data)
export const updateTimeline = (id, data)  => req('PUT',    `/api/timeline/${id}`, data)
export const deleteTimeline = (id)        => req('DELETE', `/api/timeline/${id}`)

// ── Jar ───────────────────────────────────────────────────────────
export const getJar    = ()     => req('GET',    '/api/jar')
export const addJar    = (data) => req('POST',   '/api/jar', data)
export const deleteJar = (id)   => req('DELETE', `/api/jar/${id}`)

// ── Secret Letters ────────────────────────────────────────────────
export const getLetters  = ()           => req('GET',  '/api/letters')
export const getInbox    = ()           => req('GET',  '/api/letters/inbox')
export const sendLetter  = (data)       => req('POST', '/api/letters', data)
export const markRead    = (id)         => req('POST', `/api/letters/${id}/read`)
export const deleteLetter= (id)         => req('DELETE', `/api/letters/${id}`)

// ── Shared Diary ──────────────────────────────────────────────────
export const getDiary       = (date)       => req('GET',  `/api/diary${date ? `?date=${date}` : ''}`)
export const getDiaryDates  = ()           => req('GET',  '/api/diary/dates')
export const addDiary       = (data)       => req('POST', '/api/diary', data)
export const updateDiary    = (id, data)   => req('PUT',  `/api/diary/${id}`, data)
export const deleteDiary    = (id)         => req('DELETE', `/api/diary/${id}`)

// ── Love Challenges ───────────────────────────────────────────────
export const getChallenges   = ()    => req('GET',  '/api/challenges')
export const addChallenge    = (data)=> req('POST', '/api/challenges', data)
export const markChallDone   = (id)  => req('POST', `/api/challenges/${id}/done`)
export const markChallUndone = (id)  => req('POST', `/api/challenges/${id}/undone`)
export const deleteChallenge = (id)  => req('DELETE', `/api/challenges/${id}`)

// ── Bucket List ───────────────────────────────────────────────────
export const getBucket       = ()          => req('GET',    '/api/bucket')
export const addBucket       = (data)      => req('POST',   '/api/bucket', data)
export const updateBucket    = (id, data)  => req('PUT',    `/api/bucket/${id}`, data)
export const markBucketDone  = (id)        => req('POST',   `/api/bucket/${id}/done`)
export const markBucketUndone= (id)        => req('POST',   `/api/bucket/${id}/undone`)
export const deleteBucket    = (id)        => req('DELETE', `/api/bucket/${id}`)

// ── Diary Reactions ───────────────────────────────────────────────
export const reactDiary      = (id, emoji) => req('POST', `/api/diary/${id}/react`, { emoji })
export const getDiaryReactions = (id)      => req('GET',  `/api/diary/${id}/reactions`)

// ── On This Day ───────────────────────────────────────────────────
export const getMemoriesToday = ()         => req('GET',  '/api/memories/today')

// ── Ping / Nho Em ─────────────────────────────────────────────────
export const sendPing         = ()         => req('POST', '/api/ping')
export const getLatestPing    = ()         => req('GET',  '/api/ping/latest')
export const markPingSeen     = (id)       => req('POST', `/api/ping/${id}/seen`)

// ── Stats ─────────────────────────────────────────────────────────
export const getStats         = ()         => req('GET',  '/api/stats')
export const getCounts        = ()         => req('GET',  '/api/counts')

// ── Wishes / So luu but ───────────────────────────────────────────
export const getWishes    = ()      => req('GET',    '/api/wishes')
export const addWish      = (data)  => req('POST',   '/api/wishes', data)
export const likeWish     = (id)    => req('POST',   `/api/wishes/${id}/like`)
export const deleteWish   = (id)    => req('DELETE', `/api/wishes/${id}`)

// ── Mood Tracker ──────────────────────────────────────────────────
export const getMoods  = ()              => req('GET',  '/api/mood')
export const saveMood  = (role, mood)    => req('POST', '/api/mood', { role, mood })

// ── Love Calendar ─────────────────────────────────────────────────
export const getCalendar         = ()    => req('GET',    '/api/calendar')
export const addCalendarEvent    = (data)=> req('POST',   '/api/calendar', data)
export const deleteCalendarEvent = (id)  => req('DELETE', `/api/calendar/${id}`)

// ── Jar History ───────────────────────────────────────────────────
export const getJarHistory  = (role, date)          => req('GET',  `/api/jar/history?role=${role}&date=${date}`)
export const saveJarHistory = (role, date, msgId)   => req('POST', '/api/jar/history', { role, date, messageId: msgId })

// ── Songs ─────────────────────────────────────────────────────────────
export const getSongs    = ()          => req('GET',    '/api/songs')
export const addSong     = (data)      => req('POST',   '/api/songs', data)
export const updateSong  = (id, data)  => req('PUT',    `/api/songs/${id}`, data)
export const deleteSong  = (id)        => req('DELETE', `/api/songs/${id}`)

// ── Movies ────────────────────────────────────────────────────────────
export const getMovies   = ()          => req('GET',    '/api/movies')
export const addMovie    = (data)      => req('POST',   '/api/movies', data)
export const updateMovie = (id, data)  => req('PUT',    `/api/movies/${id}`, data)
export const deleteMovie = (id)        => req('DELETE', `/api/movies/${id}`)

// ── Bulk seed ─────────────────────────────────────────────────────
export const bulkQuiz         = (items)    => req('POST', '/api/quiz/bulk',    items)
export const bulkJar          = (items)    => req('POST', '/api/jar/bulk',     items)
