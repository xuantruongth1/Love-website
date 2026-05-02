from flask import Blueprint, request, jsonify, session
from datetime import datetime
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('diary', __name__)

def current_role():
    return session.get('role')

@bp.route('/api/diary', methods=['GET'])
def get_diary():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    date = request.args.get('date')  # YYYY-MM-DD, lay tat ca neu khong co
    conn = get_db()
    if date:
        rows = conn.execute(
            'SELECT * FROM diary_entries WHERE date=? ORDER BY created_at ASC', (date,)
        ).fetchall()
    else:
        rows = conn.execute(
            'SELECT * FROM diary_entries ORDER BY date DESC, created_at ASC'
        ).fetchall()
    result = []
    for row in rows:
        entry = dict(row)
        reactions = conn.execute(
            'SELECT * FROM diary_reactions WHERE entry_id=?', (entry['id'],)
        ).fetchall()
        entry['reactions'] = [dict(r) for r in reactions]
        result.append(entry)
    conn.close()
    return jsonify(result)

@bp.route('/api/diary/dates', methods=['GET'])
def get_diary_dates():
    """Tra ve danh sach ngay co entries (de hien calendar)"""
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    rows = conn.execute(
        'SELECT DISTINCT date FROM diary_entries ORDER BY date DESC'
    ).fetchall()
    conn.close()
    return jsonify([r['date'] for r in rows])

@bp.route('/api/diary', methods=['POST'])
def add_diary():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    data = request.json or {}
    if not data.get('content', '').strip() or not data.get('date'):
        return jsonify({'error': 'Thieu noi dung hoac ngay'}), 400
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO diary_entries (date, role, content) VALUES (?,?,?)',
        (data['date'], role, data['content'])
    )
    conn.commit()
    row = conn.execute('SELECT * FROM diary_entries WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@bp.route('/api/diary/<int:entry_id>', methods=['PUT'])
def update_diary(entry_id):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    data = request.json or {}
    conn = get_db()
    conn.execute(
        'UPDATE diary_entries SET content=? WHERE id=? AND role=?',
        (data.get('content', ''), entry_id, role)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM diary_entries WHERE id=?', (entry_id,)).fetchone()
    conn.close()
    return jsonify(dict(row)) if row else (jsonify({'error': 'Not found'}), 404)

@bp.route('/api/diary/<int:entry_id>', methods=['DELETE'])
def delete_diary(entry_id):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    if role == 'boy':
        conn.execute('DELETE FROM diary_entries WHERE id=?', (entry_id,))
    else:
        conn.execute('DELETE FROM diary_entries WHERE id=? AND role=?', (entry_id, role))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# ── Reactions ─────────────────────────────────────────────────────
@bp.route('/api/diary/<int:entry_id>/react', methods=['POST'])
def react_diary(entry_id):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    emoji = (request.json or {}).get('emoji', '❤️')
    conn = get_db()
    existing = conn.execute(
        'SELECT * FROM diary_reactions WHERE entry_id=? AND role=?', (entry_id, role)
    ).fetchone()
    if existing:
        if existing['emoji'] == emoji:
            conn.execute('DELETE FROM diary_reactions WHERE id=?', (existing['id'],))
        else:
            conn.execute('UPDATE diary_reactions SET emoji=? WHERE id=?', (emoji, existing['id']))
    else:
        conn.execute(
            'INSERT INTO diary_reactions (entry_id, role, emoji) VALUES (?,?,?)',
            (entry_id, role, emoji)
        )
    conn.commit()
    rows = conn.execute('SELECT * FROM diary_reactions WHERE entry_id=?', (entry_id,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@bp.route('/api/diary/<int:entry_id>/reactions', methods=['GET'])
def get_reactions(entry_id):
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    conn = get_db()
    rows = conn.execute('SELECT * FROM diary_reactions WHERE entry_id=?', (entry_id,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ── On This Day (Hom nay trong qua khu) ──────────────────────────
@bp.route('/api/memories/today', methods=['GET'])
def on_this_day():
    role = current_role()
    if not role:
        return jsonify({'error': 'Chua dang nhap'}), 401
    today_mmdd = datetime.now().strftime('%m-%d')
    conn = get_db()
    diary = conn.execute(
        "SELECT * FROM diary_entries WHERE strftime('%m-%d', date)=? AND date < date('now') ORDER BY date DESC LIMIT 6",
        (today_mmdd,)
    ).fetchall()
    timeline = conn.execute(
        "SELECT * FROM timeline WHERE strftime('%m-%d', date)=? ORDER BY date DESC LIMIT 3",
        (today_mmdd,)
    ).fetchall()
    photos = conn.execute(
        "SELECT * FROM photos WHERE strftime('%m-%d', date)=? ORDER BY date DESC LIMIT 4",
        (today_mmdd,)
    ).fetchall()
    conn.close()
    return jsonify({
        'diary':    [dict(r) for r in diary],
        'timeline': [dict(r) for r in timeline],
        'photos':   [dict(r) for r in photos],
    })
