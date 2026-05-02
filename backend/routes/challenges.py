from flask import Blueprint, request, jsonify, session
from datetime import datetime
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('challenges', __name__)

def current_role():
    return session.get('role')

@bp.route('/api/challenges', methods=['GET'])
def get_challenges():
    if not current_role():
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    rows = conn.execute('SELECT * FROM challenges ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/challenges', methods=['POST'])
def add_challenge():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    data = request.json or {}
    if not data.get('title'):
        return jsonify({'error': 'Can co tieu de'}), 400
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO challenges (title, description, type, deadline) VALUES (?,?,?,?)',
        (data['title'], data.get('description',''), data.get('type','daily'), data.get('deadline'))
    )
    conn.commit()
    row = conn.execute('SELECT * FROM challenges WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/challenges/<int:cid>/done', methods=['POST'])
def mark_done(cid):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    now = datetime.now().isoformat()
    conn = get_db()
    if role == 'boy':
        conn.execute(
            'UPDATE challenges SET boy_done=1, boy_done_at=? WHERE id=?', (now, cid)
        )
    else:
        conn.execute(
            'UPDATE challenges SET girl_done=1, girl_done_at=? WHERE id=?', (now, cid)
        )
    conn.commit()
    row = conn.execute('SELECT * FROM challenges WHERE id=?', (cid,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@bp.route('/api/challenges/<int:cid>/undone', methods=['POST'])
def mark_undone(cid):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    if role == 'boy':
        conn.execute('UPDATE challenges SET boy_done=0, boy_done_at=NULL WHERE id=?', (cid,))
    else:
        conn.execute('UPDATE challenges SET girl_done=0, girl_done_at=NULL WHERE id=?', (cid,))
    conn.commit()
    row = conn.execute('SELECT * FROM challenges WHERE id=?', (cid,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@bp.route('/api/challenges/<int:cid>', methods=['DELETE'])
def delete_challenge(cid):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    conn.execute('DELETE FROM challenges WHERE id=?', (cid,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
