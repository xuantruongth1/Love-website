from flask import Blueprint, jsonify, session
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('stats', __name__)

def current_role():
    return session.get('role')

def _count(conn, table, where='', params=()):
    q = f'SELECT COUNT(*) as c FROM {table}'
    if where:
        q += f' WHERE {where}'
    return conn.execute(q, params).fetchone()['c']

@bp.route('/api/counts', methods=['GET'])
def get_counts():
    role = current_role()
    if not role:
        return jsonify({'error': 'Unauthorized'}), 401
    conn = get_db()
    counts = {
        'quiz':     _count(conn, 'quiz_questions'),
        'jar':      _count(conn, 'jar_messages'),
        'reasons':  _count(conn, 'reasons'),
        'timeline': _count(conn, 'timeline'),
        'photos':   _count(conn, 'photos'),
    }
    conn.close()
    return jsonify(counts)

@bp.route('/api/stats', methods=['GET'])
def get_stats():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401

    conn = get_db()

    ann = conn.execute("SELECT value FROM config WHERE key='anniversaryDate'").fetchone()

    stats = {
        'anniversary': ann['value'] if ann else '2024-11-05',

        # Anh
        'photos':          _count(conn, 'photos'),
        'timeline':        _count(conn, 'timeline'),

        # Nhat ky
        'diary_total':     _count(conn, 'diary_entries'),
        'diary_boy':       _count(conn, 'diary_entries', "role='boy'"),
        'diary_girl':      _count(conn, 'diary_entries', "role='girl'"),

        # Thu bi mat
        'letters_total':   _count(conn, 'secret_letters'),
        'letters_boy':     _count(conn, 'secret_letters', "from_role='boy'"),
        'letters_girl':    _count(conn, 'secret_letters', "from_role='girl'"),

        # Bucket list
        'bucket_total':    _count(conn, 'bucket_list'),
        'bucket_done':     _count(conn, 'bucket_list', "status='done'"),

        # Jar
        'jar_messages':    _count(conn, 'jar_messages'),

        # Challenges
        'challenges_total':     _count(conn, 'challenges'),
        'challenges_both_done': _count(conn, 'challenges', 'boy_done=1 AND girl_done=1'),

        # Ly do
        'reasons':         _count(conn, 'reasons'),

        # Pings
        'ping_boy':        _count(conn, 'pings', "from_role='boy'"),
        'ping_girl':       _count(conn, 'pings', "from_role='girl'"),
    }

    conn.close()
    return jsonify(stats)
