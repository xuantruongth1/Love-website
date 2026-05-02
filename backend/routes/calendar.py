from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('calendar', __name__)

@bp.route('/api/calendar', methods=['GET'])
def get_calendar():
    conn = get_db()
    rows = conn.execute('SELECT * FROM calendar_events ORDER BY date ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/calendar', methods=['POST'])
def add_calendar():
    data = request.json or {}
    if not data.get('date') or not data.get('title', '').strip():
        return jsonify({'error': 'date and title required'}), 400
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO calendar_events (date, title, note, color) VALUES (?,?,?,?)',
        (data['date'], data['title'].strip(), data.get('note', ''), data.get('color', '#FF6B9D'))
    )
    conn.commit()
    row = conn.execute('SELECT * FROM calendar_events WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/calendar/<int:event_id>', methods=['DELETE'])
def delete_calendar(event_id):
    conn = get_db()
    conn.execute('DELETE FROM calendar_events WHERE id=?', (event_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
