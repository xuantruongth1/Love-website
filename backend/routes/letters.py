from flask import Blueprint, request, jsonify, session
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('letters', __name__)

def current_role():
    return session.get('role')

@bp.route('/api/letters', methods=['GET'])
def get_letters():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    # Lay ca thu gui va thu nhan
    rows = conn.execute(
        '''SELECT * FROM secret_letters
           WHERE from_role=? OR to_role=?
           ORDER BY created_at DESC''',
        (role, role)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/letters/inbox', methods=['GET'])
def get_inbox():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM secret_letters WHERE to_role=? ORDER BY created_at DESC',
        (role,)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/letters', methods=['POST'])
def send_letter():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    data = request.json or {}
    if not data.get('content', '').strip():
        return jsonify({'error': 'Noi dung khong duoc trong'}), 400

    to_role = 'girl' if role == 'boy' else 'boy'
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO secret_letters (from_role, to_role, content, image_url, mood) VALUES (?,?,?,?,?)',
        (role, to_role, data['content'], data.get('image_url'), data.get('mood'))
    )
    conn.commit()
    row = conn.execute('SELECT * FROM secret_letters WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/letters/<int:letter_id>/read', methods=['POST'])
def mark_read(letter_id):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    conn.execute(
        'UPDATE secret_letters SET is_read=1 WHERE id=? AND to_role=?',
        (letter_id, role)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@bp.route('/api/letters/<int:letter_id>', methods=['DELETE'])
def delete_letter(letter_id):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    # Chi xoa duoc thu cua minh (from_role) hoac admin (boy) xoa het
    if role == 'boy':
        conn.execute('DELETE FROM secret_letters WHERE id=?', (letter_id,))
    else:
        conn.execute('DELETE FROM secret_letters WHERE id=? AND from_role=?', (letter_id, role))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
