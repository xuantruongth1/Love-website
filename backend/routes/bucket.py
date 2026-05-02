from flask import Blueprint, request, jsonify, session
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('bucket', __name__)

def current_role():
    return session.get('role')

@bp.route('/api/bucket', methods=['GET'])
def get_bucket():
    if not current_role():
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM bucket_list ORDER BY CASE status WHEN 'done' THEN 2 WHEN 'doing' THEN 1 ELSE 0 END, created_at DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/bucket', methods=['POST'])
def add_bucket():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    data = request.json or {}
    if not data.get('title'):
        return jsonify({'error': 'Can co tieu de'}), 400
    status = data.get('status', 'todo')
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO bucket_list (title, category, status, added_by) VALUES (?,?,?,?)',
        (data['title'], data.get('category', 'experience'), status, role)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM bucket_list WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/bucket/<int:bid>', methods=['PUT'])
def update_bucket(bid):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    data = request.json or {}
    conn = get_db()
    conn.execute(
        'UPDATE bucket_list SET title=?, category=?, status=? WHERE id=?',
        (data.get('title', ''), data.get('category', 'experience'), data.get('status', 'todo'), bid)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM bucket_list WHERE id=?', (bid,)).fetchone()
    conn.close()
    return jsonify(dict(row)) if row else (jsonify({'error': 'Not found'}), 404)

@bp.route('/api/bucket/<int:bid>/done', methods=['POST'])
def mark_done(bid):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    from datetime import datetime
    conn = get_db()
    conn.execute(
        "UPDATE bucket_list SET status='done', done=1, done_by=?, done_date=? WHERE id=?",
        (role, datetime.now().strftime('%Y-%m-%d'), bid)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM bucket_list WHERE id=?', (bid,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@bp.route('/api/bucket/<int:bid>/undone', methods=['POST'])
def mark_undone(bid):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    conn.execute(
        "UPDATE bucket_list SET status='todo', done=0, done_by=NULL, done_date=NULL WHERE id=?",
        (bid,)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM bucket_list WHERE id=?', (bid,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@bp.route('/api/bucket/<int:bid>', methods=['DELETE'])
def delete_bucket(bid):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    if role == 'boy':
        conn.execute('DELETE FROM bucket_list WHERE id=?', (bid,))
    else:
        conn.execute('DELETE FROM bucket_list WHERE id=? AND added_by=?', (bid, role))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
