import re

def create_new_db_py():
    with open("database.py.bak", "r", encoding="utf-8") as f:
        content = f.read()
    
    # We want to replace lines 1 to 226 (up to `REASONS_100 = [`)
    parts = content.split("REASONS_100 = [")
    if len(parts) < 2:
        return "ERROR"
        
    bottom_half = "REASONS_100 = [" + parts[1]
    
    top_half = """import psycopg2
import psycopg2.extras
import json
import os
import sys
from dotenv import load_dotenv

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("WARNING: DATABASE_URL not found in .env")

class DBCursorWrapper:
    def __init__(self, cursor):
        self.cursor = cursor
        self.lastrowid = None

    def execute(self, query, params=()):
        if not query:
            return self

        # 1. Handle PRAGMA (SQLite specific, ignore for Postgres)
        if query.strip().upper().startswith('PRAGMA'):
            return self

        # 2. Handle ? to %s
        pg_query = query.replace('?', '%s')
        
        # 3. Handle SQLite specific types to Postgres types
        pg_query = pg_query.replace("datetime('now')", "CURRENT_TIMESTAMP")
        pg_query = pg_query.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
        
        # 4. Handle RETURNING id for INSERT
        has_auto_id = False
        upper_q = pg_query.upper()
        if upper_q.startswith('INSERT'):
            auto_id_tables = ['photos', 'reasons', 'quiz_questions', 'timeline', 'jar_messages', 
                          'wishes', 'secret_letters', 'diary_entries', 'challenges', 'pings', 
                          'diary_reactions', 'bucket_list', 'calendar_events', 'jar_history', 
                          'songs', 'movies']
            for table in auto_id_tables:
                if f"INTO {table.upper()}" in upper_q or f"INTO {table}" in pg_query:
                    has_auto_id = True
                    break
            
            if has_auto_id and 'RETURNING' not in upper_q:
                pg_query += " RETURNING id"
        
        # Execute query
        try:
            self.cursor.execute(pg_query, params)
            if has_auto_id and self.cursor.description:
                res = self.cursor.fetchone()
                if res:
                    self.lastrowid = res['id']
        except Exception as e:
            # If ignore/IF NOT EXISTS fails, just print and rollback
            print(f"DB Error on: {pg_query} -> {e}")
            self.cursor.connection.rollback()
            raise
            
        return self

    def executemany(self, query, params_list):
        pg_query = query.replace('?', '%s')
        pg_query = pg_query.replace("datetime('now')", "CURRENT_TIMESTAMP")
        try:
            self.cursor.executemany(pg_query, params_list)
        except Exception as e:
            self.cursor.connection.rollback()
            raise
        return self

    def fetchone(self):
        try:
            return self.cursor.fetchone()
        except:
            return None

    def fetchall(self):
        try:
            return self.cursor.fetchall()
        except:
            return []

class DBConnectionWrapper:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        return DBCursorWrapper(self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor))

    def execute(self, query, params=()):
        c = self.cursor()
        return c.execute(query, params)

    def executemany(self, query, params_list):
        c = self.cursor()
        return c.executemany(query, params_list)

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()

def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    return DBConnectionWrapper(conn)

def init_db():
    conn = get_db()
    c = conn.cursor()

    # ── Config ────────────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY, value TEXT
    )''')

    # ── Photos ────────────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        src TEXT NOT NULL,
        caption TEXT DEFAULT '',
        album TEXT DEFAULT 'special',
        date TEXT DEFAULT '',
        added_by TEXT DEFAULT 'boy',
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Reasons ───────────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS reasons (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        special INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0
    )''')

    # ── Quiz ──────────────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        answer INTEGER NOT NULL DEFAULT 0
    )''')

    # ── Wheel presets ─────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS wheel_presets (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        options TEXT NOT NULL
    )''')

    # ── Timeline / Ky niem ────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS timeline (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        icon TEXT DEFAULT 'heart',
        image TEXT DEFAULT NULL,
        highlight INTEGER DEFAULT 0,
        added_by TEXT DEFAULT 'boy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Jar messages ──────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS jar_messages (
        id SERIAL PRIMARY KEY,
        type TEXT DEFAULT 'love',
        text TEXT NOT NULL,
        added_by TEXT DEFAULT 'boy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Wishes / So luu but ──────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS wishes (
        id SERIAL PRIMARY KEY,
        name TEXT DEFAULT 'An danh',
        message TEXT NOT NULL,
        color TEXT DEFAULT '#FFE8EE',
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Thu bi mat / Secret Letters ───────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS secret_letters (
        id SERIAL PRIMARY KEY,
        from_role TEXT NOT NULL,
        to_role TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT DEFAULT NULL,
        mood TEXT DEFAULT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Nhat ky chung / Shared Diary ─────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS diary_entries (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Thu thach tinh yeu / Love Challenges ─────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        type TEXT DEFAULT 'daily',
        deadline TEXT DEFAULT NULL,
        boy_done INTEGER DEFAULT 0,
        girl_done INTEGER DEFAULT 0,
        boy_done_at TEXT DEFAULT NULL,
        girl_done_at TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Ping / Nho Em ─────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS pings (
        id SERIAL PRIMARY KEY,
        from_role TEXT NOT NULL,
        to_role TEXT NOT NULL,
        is_seen INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Diary Reactions ───────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS diary_reactions (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        emoji TEXT NOT NULL DEFAULT '❤️',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(entry_id, role)
    )''')

    # ── Bucket List chung ─────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS bucket_list (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'experience',
        added_by TEXT NOT NULL,
        done INTEGER DEFAULT 0,
        done_by TEXT DEFAULT NULL,
        done_image TEXT DEFAULT NULL,
        done_date TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'todo'
    )''')

    # ── Mood Tracker ─────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS mood_tracker (
        role TEXT PRIMARY KEY,
        mood TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Calendar Events ───────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        note TEXT DEFAULT '',
        color TEXT DEFAULT '#FF6B9D',
        created_by TEXT DEFAULT 'boy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # ── Jar History (daily open tracking) ────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS jar_history (
        id SERIAL PRIMARY KEY,
        role TEXT NOT NULL,
        date TEXT NOT NULL,
        message_id INTEGER NOT NULL,
        opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role, date)
    )''')

    # ── Songs ─────────────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT DEFAULT '',
        note TEXT DEFAULT '',
        youtube_id TEXT DEFAULT '',
        spotify_url TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0
    )''')

    # ── Movies ────────────────────────────────────────────────────
    c.execute('''CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        year INTEGER DEFAULT 0,
        genre TEXT DEFAULT '',
        note TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0
    )''')

    conn.commit()
    conn.close()
    _seed_defaults()
    print('[DB] Initialized PostgreSQL successfully')

"""
    
    with open("database.py", "w", encoding="utf-8") as f:
        f.write(top_half + bottom_half)

if __name__ == "__main__":
    create_new_db_py()
