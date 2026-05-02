from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('music', __name__)

# ── Songs ──────────────────────────────────────────────────────────────

@bp.route('/api/songs', methods=['GET'])
def get_songs():
    conn = get_db()
    rows = conn.execute('SELECT * FROM songs ORDER BY sort_order ASC, id ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/songs', methods=['POST'])
def add_song():
    data = request.json
    if not data or not data.get('title'):
        return jsonify({'error': 'title is required'}), 400
    conn = get_db()
    max_order = conn.execute('SELECT COALESCE(MAX(sort_order), 0) FROM songs').fetchone()[0]
    cur = conn.execute(
        'INSERT INTO songs (title, artist, note, youtube_id, spotify_url, sort_order) VALUES (?,?,?,?,?,?)',
        (data['title'], data.get('artist', ''), data.get('note', ''),
         data.get('youtube_id', ''), data.get('spotify_url', ''), max_order + 1)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM songs WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/songs/<int:song_id>', methods=['PUT'])
def update_song(song_id):
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE songs SET title=?, artist=?, note=?, youtube_id=?, spotify_url=? WHERE id=?',
        (data.get('title', ''), data.get('artist', ''), data.get('note', ''),
         data.get('youtube_id', ''), data.get('spotify_url', ''), song_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM songs WHERE id=?', (song_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict(row))

@bp.route('/api/songs/<int:song_id>', methods=['DELETE'])
def delete_song(song_id):
    conn = get_db()
    conn.execute('DELETE FROM songs WHERE id=?', (song_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# ── Movies ─────────────────────────────────────────────────────────────

@bp.route('/api/movies', methods=['GET'])
def get_movies():
    conn = get_db()
    rows = conn.execute('SELECT * FROM movies ORDER BY sort_order ASC, id ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/movies', methods=['POST'])
def add_movie():
    data = request.json
    if not data or not data.get('title'):
        return jsonify({'error': 'title is required'}), 400
    conn = get_db()
    max_order = conn.execute('SELECT COALESCE(MAX(sort_order), 0) FROM movies').fetchone()[0]
    cur = conn.execute(
        'INSERT INTO movies (title, year, genre, note, sort_order) VALUES (?,?,?,?,?)',
        (data['title'], data.get('year', 0), data.get('genre', ''),
         data.get('note', ''), max_order + 1)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM movies WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/movies/<int:movie_id>', methods=['PUT'])
def update_movie(movie_id):
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE movies SET title=?, year=?, genre=?, note=? WHERE id=?',
        (data.get('title', ''), data.get('year', 0), data.get('genre', ''),
         data.get('note', ''), movie_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM movies WHERE id=?', (movie_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict(row))

@bp.route('/api/movies/<int:movie_id>', methods=['DELETE'])
def delete_movie(movie_id):
    conn = get_db()
    conn.execute('DELETE FROM movies WHERE id=?', (movie_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
