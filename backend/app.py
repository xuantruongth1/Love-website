import os, sys, uuid
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS

# Duong dan
BASE_DIR      = os.path.dirname(__file__)
UPLOAD_DIR    = os.path.join(BASE_DIR, 'uploads')
EMBE_DIR      = os.path.join(BASE_DIR, '..', 'public', 'embe')
FRONTEND_DIST = os.path.join(BASE_DIR, '..', 'dist')

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Init DB
sys.path.insert(0, BASE_DIR)
from database import init_db
init_db()

# Flask app
app = Flask(__name__, static_folder=None)
app.secret_key = 'love-2805-secret-key-do-not-change'

# CORS: cho phep credentials (session cookie)
CORS(app,
     resources={r'/api/*': {'origins': ['http://localhost:5173', 'http://localhost:5000', 'http://192.168.1.*']},
                r'/uploads/*': {'origins': '*'}},
     supports_credentials=True)

# ── Blueprints ───────────────────────────────────────────────────
from routes.auth         import bp as auth_bp
from routes.photos       import bp as photos_bp
from routes.config_routes import bp as config_bp
from routes.reasons      import bp as reasons_bp
from routes.quiz         import bp as quiz_bp
from routes.wheel        import bp as wheel_bp
from routes.timeline     import bp as timeline_bp
from routes.jar          import bp as jar_bp
from routes.letters      import bp as letters_bp
from routes.diary        import bp as diary_bp
from routes.challenges   import bp as challenges_bp
from routes.bucket       import bp as bucket_bp
from routes.pings        import bp as pings_bp
from routes.stats        import bp as stats_bp
from routes.wishes       import bp as wishes_bp
from routes.mood         import bp as mood_bp
from routes.calendar     import bp as calendar_bp
from routes.music        import bp as music_bp

app.register_blueprint(auth_bp)
app.register_blueprint(photos_bp)
app.register_blueprint(config_bp)
app.register_blueprint(reasons_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(wheel_bp)
app.register_blueprint(timeline_bp)
app.register_blueprint(jar_bp)
app.register_blueprint(letters_bp)
app.register_blueprint(diary_bp)
app.register_blueprint(challenges_bp)
app.register_blueprint(bucket_bp)
app.register_blueprint(pings_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(wishes_bp)
app.register_blueprint(mood_bp)
app.register_blueprint(calendar_bp)
app.register_blueprint(music_bp)

# Bỏ qua Upload ảnh nội bộ (đã chuyển sang dùng ImgBB ở frontend)

# ── Serve embe photos ────────────────────────────────────────────
@app.route('/embe/<path:filename>')
def serve_embe(filename):
    return send_from_directory(EMBE_DIR, filename)

@app.route('/api/embe-photos')
def list_embe_photos():
    import random
    exts = {'.jpg', '.jpeg', '.png', '.webp'}
    if not os.path.isdir(EMBE_DIR):
        return jsonify([])
    files = [f for f in os.listdir(EMBE_DIR) if os.path.splitext(f)[1].lower() in exts]
    random.shuffle(files)
    return jsonify([f'/embe/{f}' for f in files[:50]])

# ── Serve uploads ────────────────────────────────────────────────
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# ── Serve React SPA ──────────────────────────────────────────────
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if os.path.exists(FRONTEND_DIST):
        target = os.path.join(FRONTEND_DIST, path)
        if path and os.path.isfile(target):
            return send_from_directory(FRONTEND_DIST, path)
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return (
        '<h2 style="font-family:sans-serif;color:#c0392b">React chua duoc build!</h2>'
        '<p style="font-family:sans-serif">Chay: <code>npm run build</code> trong thu muc goc</p>',
        200
    )

if __name__ == '__main__':
    print('\n[Love Website Backend]')
    print('   API:      http://localhost:5000/api/')
    print('   Uploads:  http://localhost:5000/uploads/')
    print('   Frontend: http://localhost:5000/\n')
    app.run(host='0.0.0.0', port=5000, debug=True)
