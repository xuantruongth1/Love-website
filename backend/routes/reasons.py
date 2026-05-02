from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('reasons', __name__)

@bp.route('/api/reasons', methods=['GET'])
def get_reasons():
    conn = get_db()
    rows = conn.execute('SELECT * FROM reasons ORDER BY sort_order, id').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/reasons', methods=['POST'])
def add_reason():
    data = request.json
    if not data or not data.get('text'):
        return jsonify({'error': 'text is required'}), 400
    conn = get_db()
    max_order = conn.execute('SELECT COALESCE(MAX(sort_order),0) FROM reasons').fetchone()[0]
    cur = conn.execute(
        'INSERT INTO reasons (text, special, sort_order) VALUES (?,?,?)',
        (data['text'], 1 if data.get('special') else 0, max_order + 1)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM reasons WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/reasons/<int:reason_id>', methods=['PUT'])
def update_reason(reason_id):
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE reasons SET text=?, special=? WHERE id=?',
        (data.get('text',''), 1 if data.get('special') else 0, reason_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM reasons WHERE id=?', (reason_id,)).fetchone()
    conn.close()
    return jsonify(dict(row)) if row else (jsonify({'error': 'Not found'}), 404)

@bp.route('/api/reasons/<int:reason_id>', methods=['DELETE'])
def delete_reason(reason_id):
    conn = get_db()
    conn.execute('DELETE FROM reasons WHERE id=?', (reason_id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@bp.route('/api/reasons/bulk', methods=['POST'])
def bulk_replace_reasons():
    """Thay thế toàn bộ danh sách lý do (dùng khi import từ file cũ)"""
    items = request.json or []
    conn = get_db()
    conn.execute('DELETE FROM reasons')
    for i, item in enumerate(items):
        conn.execute(
            'INSERT INTO reasons (id, text, special, sort_order) VALUES (?,?,?,?)',
            (item.get('id', i+1), item['text'], 1 if item.get('special') else 0, i)
        )
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'count': len(items)})
