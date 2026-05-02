from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('timeline', __name__)

@bp.route('/api/timeline', methods=['GET'])
def get_timeline():
    conn = get_db()
    rows = conn.execute('SELECT * FROM timeline ORDER BY date ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/timeline', methods=['POST'])
def add_timeline():
    data = request.json
    if not data or not data.get('title') or not data.get('date'):
        return jsonify({'error': 'title and date are required'}), 400
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO timeline (date, title, description, icon, image, highlight) VALUES (?,?,?,?,?,?)',
        (data['date'], data['title'], data.get('description',''),
         data.get('icon','heart'), data.get('image'), 1 if data.get('highlight') else 0)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM timeline WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/timeline/<int:item_id>', methods=['PUT'])
def update_timeline(item_id):
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE timeline SET date=?, title=?, description=?, icon=?, image=?, highlight=? WHERE id=?',
        (data.get('date'), data.get('title'), data.get('description',''),
         data.get('icon','heart'), data.get('image'), 1 if data.get('highlight') else 0, item_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM timeline WHERE id=?', (item_id,)).fetchone()
    conn.close()
    return jsonify(dict(row)) if row else (jsonify({'error': 'Not found'}), 404)

@bp.route('/api/timeline/<int:item_id>', methods=['DELETE'])
def delete_timeline(item_id):
    conn = get_db()
    conn.execute('DELETE FROM timeline WHERE id=?', (item_id,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})
