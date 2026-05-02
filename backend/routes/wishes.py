from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('wishes', __name__)

@bp.route('/api/wishes', methods=['GET'])
def get_wishes():
    conn = get_db()
    rows = conn.execute('SELECT * FROM wishes ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/wishes', methods=['POST'])
def add_wish():
    data = request.json
    if not data or not data.get('message'):
        return jsonify({'error': 'message required'}), 400
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO wishes (name, message, color) VALUES (?,?,?)',
        (data.get('name', 'Ẩn danh'), data['message'], data.get('color', '#FFE8EE'))
    )
    conn.commit()
    row = conn.execute('SELECT * FROM wishes WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/wishes/<int:wid>/like', methods=['POST'])
def like_wish(wid):
    conn = get_db()
    conn.execute('UPDATE wishes SET likes = likes + 1 WHERE id=?', (wid,))
    conn.commit()
    row = conn.execute('SELECT * FROM wishes WHERE id=?', (wid,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict(row))

@bp.route('/api/wishes/<int:wid>', methods=['DELETE'])
def delete_wish(wid):
    conn = get_db()
    conn.execute('DELETE FROM wishes WHERE id=?', (wid,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
