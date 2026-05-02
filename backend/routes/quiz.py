from flask import Blueprint, request, jsonify
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('quiz', __name__)

@bp.route('/api/quiz', methods=['GET'])
def get_quiz():
    conn = get_db()
    rows = conn.execute('SELECT * FROM quiz_questions ORDER BY id').fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d['options'] = json.loads(d['options'])
        result.append(d)
    return jsonify(result)

@bp.route('/api/quiz', methods=['POST'])
def add_quiz():
    data = request.json
    if not data or not data.get('question'):
        return jsonify({'error': 'question required'}), 400
    options = json.dumps(data.get('options', []))
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO quiz_questions (question, options, answer) VALUES (?,?,?)',
        (data['question'], options, data.get('answer', 0))
    )
    conn.commit()
    row = conn.execute('SELECT * FROM quiz_questions WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    d = dict(row)
    d['options'] = json.loads(d['options'])
    return jsonify(d), 201

@bp.route('/api/quiz/<int:qid>', methods=['PUT'])
def update_quiz(qid):
    data = request.json
    options = json.dumps(data.get('options', []))
    conn = get_db()
    conn.execute(
        'UPDATE quiz_questions SET question=?, options=?, answer=? WHERE id=?',
        (data.get('question',''), options, data.get('answer', 0), qid)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM quiz_questions WHERE id=?', (qid,)).fetchone()
    conn.close()
    if not row: return jsonify({'error': 'Not found'}), 404
    d = dict(row); d['options'] = json.loads(d['options'])
    return jsonify(d)

@bp.route('/api/quiz/<int:qid>', methods=['DELETE'])
def delete_quiz(qid):
    conn = get_db()
    conn.execute('DELETE FROM quiz_questions WHERE id=?', (qid,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})

@bp.route('/api/quiz/bulk', methods=['POST'])
def bulk_quiz():
    items = request.json
    if not isinstance(items, list):
        return jsonify({'error': 'Expected array'}), 400
    conn = get_db()
    conn.execute('DELETE FROM quiz_questions')
    for item in items:
        if item.get('question'):
            conn.execute(
                'INSERT INTO quiz_questions (question, options, answer) VALUES (?,?,?)',
                (item['question'], json.dumps(item.get('options', [])), item.get('answer', 0))
            )
    conn.commit()
    rows = conn.execute('SELECT * FROM quiz_questions ORDER BY id').fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r); d['options'] = json.loads(d['options']); result.append(d)
    return jsonify(result)
