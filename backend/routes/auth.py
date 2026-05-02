from flask import Blueprint, request, jsonify, session
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

bp = Blueprint('auth', __name__)

# Hai tai khoan cua he thong
ACCOUNTS = {
    '05112024': {'role': 'girl', 'name': 'PhLien',    'emoji': '👧'},
    '28052005': {'role': 'boy',  'name': 'MaiTruongg', 'emoji': '👦'},
}

def _get_avatar(role):
    conn = get_db()
    key = 'boyAvatar' if role == 'boy' else 'girlAvatar'
    row = conn.execute('SELECT value FROM config WHERE key=?', (key,)).fetchone()
    conn.close()
    return row['value'] if row else None

@bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    password = data.get('password', '').strip()

    account = ACCOUNTS.get(password)
    if not account:
        return jsonify({'error': 'Mat khau khong dung!'}), 401

    session['role']  = account['role']
    session['name']  = account['name']
    session['emoji'] = account['emoji']

    return jsonify({
        'ok':      True,
        'role':    account['role'],
        'name':    account['name'],
        'emoji':   account['emoji'],
        'avatar':  _get_avatar(account['role']),
        'isAdmin': True,
    })

@bp.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})

@bp.route('/api/auth/me', methods=['GET'])
def me():
    role = session.get('role')
    if not role:
        return jsonify({'loggedIn': False}), 200
    return jsonify({
        'loggedIn': True,
        'role':     role,
        'name':     session.get('name'),
        'emoji':    session.get('emoji'),
        'avatar':   _get_avatar(role),
        'isAdmin':  True,
    })

@bp.route('/api/auth/unread', methods=['GET'])
def unread_count():
    """Kiem tra so thu chua doc cua nguoi dang dang nhap"""
    role = session.get('role')
    if not role:
        return jsonify({'count': 0})
    conn = get_db()
    count = conn.execute(
        'SELECT COUNT(*) FROM secret_letters WHERE to_role=? AND is_read=0',
        (role,)
    ).fetchone()[0]
    conn.close()
    return jsonify({'count': count})
