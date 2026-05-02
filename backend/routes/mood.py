from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('mood', __name__)

@bp.route('/api/mood', methods=['GET'])
def get_moods():
    conn = get_db()
    rows = conn.execute('SELECT role, mood, updated_at FROM mood_tracker').fetchall()
    conn.close()
    result = {'boy': None, 'girl': None}
    for r in rows:
        result[r['role']] = {'mood': r['mood'], 'updated_at': r['updated_at']}
    return jsonify(result)

@bp.route('/api/mood', methods=['POST'])
def save_mood():
    data = request.json or {}
    role = data.get('role')
    mood = data.get('mood')
    if role not in ('boy', 'girl') or not mood:
        return jsonify({'error': 'role and mood required'}), 400
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO mood_tracker (role, mood, updated_at) VALUES (?,?,datetime('now'))",
        (role, mood)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
