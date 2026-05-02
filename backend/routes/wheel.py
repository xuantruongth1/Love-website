from flask import Blueprint, request, jsonify
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('wheel', __name__)

@bp.route('/api/wheel', methods=['GET'])
def get_wheel():
    conn = get_db()
    rows = conn.execute('SELECT * FROM wheel_presets ORDER BY id').fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        opts = json.loads(d['options'])
        if isinstance(opts, str):
            opts = json.loads(opts)
        d['options'] = opts
        result.append(d)
    return jsonify(result)

@bp.route('/api/wheel', methods=['POST'])
def add_wheel():
    data = request.json
    if not data or not data.get('label'):
        return jsonify({'error': 'label required'}), 400
    import time
    preset_id = data.get('id') or f'custom_{int(time.time())}'
    incoming = data.get('options', [])
    options = json.dumps(incoming if isinstance(incoming, list) else json.loads(incoming))
    conn = get_db()
    conn.execute(
        'INSERT OR REPLACE INTO wheel_presets (id, label, options) VALUES (?,?,?)',
        (preset_id, data['label'], options)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM wheel_presets WHERE id=?', (preset_id,)).fetchone()
    conn.close()
    d = dict(row)
    opts = json.loads(d['options'])
    d['options'] = json.loads(opts) if isinstance(opts, str) else opts
    return jsonify(d), 201

@bp.route('/api/wheel/<preset_id>', methods=['PUT'])
def update_wheel(preset_id):
    data = request.json
    incoming = data.get('options', [])
    options = json.dumps(incoming if isinstance(incoming, list) else json.loads(incoming))
    conn = get_db()
    conn.execute(
        'UPDATE wheel_presets SET label=?, options=? WHERE id=?',
        (data.get('label',''), options, preset_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM wheel_presets WHERE id=?', (preset_id,)).fetchone()
    conn.close()
    if not row: return jsonify({'error': 'Not found'}), 404
    d = dict(row)
    opts = json.loads(d['options'])
    d['options'] = json.loads(opts) if isinstance(opts, str) else opts
    return jsonify(d)

@bp.route('/api/wheel/<preset_id>', methods=['DELETE'])
def delete_wheel(preset_id):
    conn = get_db()
    conn.execute('DELETE FROM wheel_presets WHERE id=?', (preset_id,))
    conn.commit(); conn.close()
    return jsonify({'ok': True})
