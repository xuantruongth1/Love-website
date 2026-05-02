from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('jar', __name__)

@bp.route('/api/jar', methods=['GET'])
def get_jar():
    conn = get_db()
    rows = conn.execute('SELECT * FROM jar_messages ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/jar', methods=['POST'])
def add_jar():
    data = request.json
    if not data or not data.get('text'):
        return jsonify({'error': 'text required'}), 400
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO jar_messages (type, text) VALUES (?,?)',
        (data.get('type','love'), data['text'])
    )
    conn.commit()
    row = conn.execute('SELECT * FROM jar_messages WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/jar/<int:msg_id>', methods=['DELETE'])
def delete_jar(msg_id):
    conn = get_db()
    conn.execute('DELETE FROM jar_messages WHERE id=?', (msg_id,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

@bp.route('/api/jar/history', methods=['GET'])
def get_jar_history():
    role = request.args.get('role')
    date = request.args.get('date')
    if not role or not date:
        return jsonify({'error': 'role and date required'}), 400
    conn = get_db()
    row = conn.execute(
        'SELECT * FROM jar_history WHERE role=? AND date=?', (role, date)
    ).fetchone()
    conn.close()
    return jsonify(dict(row) if row else None)

@bp.route('/api/jar/history', methods=['POST'])
def save_jar_history():
    data = request.json or {}
    role = data.get('role')
    date = data.get('date')
    message_id = data.get('messageId')
    if not role or not date or message_id is None:
        return jsonify({'error': 'role, date, messageId required'}), 400
    conn = get_db()
    conn.execute(
        'INSERT OR IGNORE INTO jar_history (role, date, message_id) VALUES (?,?,?)',
        (role, date, message_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@bp.route('/api/jar/bulk', methods=['POST'])
def bulk_jar():
    items = request.json
    if not isinstance(items, list):
        return jsonify({'error': 'Expected array'}), 400
    conn = get_db()
    conn.execute('DELETE FROM jar_messages')
    for item in items:
        if item.get('text'):
            conn.execute(
                'INSERT INTO jar_messages (type, text) VALUES (?,?)',
                (item.get('type', 'love'), item['text'])
            )
    conn.commit()
    rows = conn.execute('SELECT * FROM jar_messages ORDER BY id').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])
