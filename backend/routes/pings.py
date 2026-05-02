from flask import Blueprint, jsonify, session
from datetime import datetime
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('pings', __name__)

def current_role():
    return session.get('role')

@bp.route('/api/ping', methods=['POST'])
def send_ping():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    to_role = 'girl' if role == 'boy' else 'boy'
    conn = get_db()
    conn.execute(
        'INSERT INTO pings (from_role, to_role, is_seen) VALUES (?,?,0)',
        (role, to_role)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'from_role': role, 'to_role': to_role})

@bp.route('/api/ping/latest', methods=['GET'])
def get_latest_ping():
    role = current_role()
    if not role:
        return jsonify({'ping': None})
    conn = get_db()
    row = conn.execute(
        'SELECT * FROM pings WHERE to_role=? AND is_seen=0 ORDER BY created_at DESC LIMIT 1',
        (role,)
    ).fetchone()
    conn.close()
    return jsonify({'ping': dict(row) if row else None})

@bp.route('/api/ping/<int:pid>/seen', methods=['POST'])
def mark_ping_seen(pid):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    conn.execute('UPDATE pings SET is_seen=1 WHERE id=? AND to_role=?', (pid, role))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
