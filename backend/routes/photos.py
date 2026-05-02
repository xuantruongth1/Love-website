from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('photos', __name__)

@bp.route('/api/photos', methods=['GET'])
def get_photos():
    conn = get_db()
    rows = conn.execute('SELECT * FROM photos ORDER BY sort_order ASC, id ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/photos', methods=['POST'])
def add_photo():
    data = request.json
    if not data or not data.get('src'):
        return jsonify({'error': 'src is required'}), 400
    conn = get_db()
    max_order = conn.execute('SELECT COALESCE(MAX(sort_order), 0) FROM photos').fetchone()[0]
    cur = conn.execute(
        'INSERT INTO photos (src, caption, album, date, sort_order) VALUES (?,?,?,?,?)',
        (data['src'], data.get('caption',''), data.get('album','special'),
         data.get('date',''), max_order + 1)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM photos WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/photos/<int:photo_id>', methods=['PUT'])
def update_photo(photo_id):
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE photos SET src=?, caption=?, album=?, date=? WHERE id=?',
        (data.get('src'), data.get('caption',''), data.get('album','special'),
         data.get('date',''), photo_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM photos WHERE id=?', (photo_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict(row))

@bp.route('/api/photos/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    conn = get_db()
    conn.execute('DELETE FROM photos WHERE id=?', (photo_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@bp.route('/api/photos/reorder', methods=['POST'])
def reorder_photos():
    orders = request.json  # [{id: N, sort_order: M}, ...]
    if not isinstance(orders, list):
        return jsonify({'error': 'Expected list'}), 400
    conn = get_db()
    for item in orders:
        conn.execute('UPDATE photos SET sort_order=? WHERE id=?',
                     (item['sort_order'], item['id']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
