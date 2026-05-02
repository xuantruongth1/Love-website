from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('config_routes', __name__)

@bp.route('/api/config', methods=['GET'])
def get_config():
    conn = get_db()
    rows = conn.execute('SELECT key, value FROM config').fetchall()
    conn.close()
    return jsonify({r['key']: r['value'] for r in rows})

@bp.route('/api/config', methods=['POST'])
def save_config():
    data = request.json or {}
    conn = get_db()
    for key, value in data.items():
        conn.execute(
            'INSERT OR REPLACE INTO config (key, value) VALUES (?,?)',
            (key, str(value))
        )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
