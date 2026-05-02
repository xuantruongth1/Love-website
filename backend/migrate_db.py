import sqlite3
import psycopg2
import os
import sys
from dotenv import load_dotenv

load_dotenv()

SQLITE_DB = 'love.db'
DATABASE_URL = os.getenv('DATABASE_URL')

def migrate():
    if not os.path.exists(SQLITE_DB):
        print(f"Error: Could not find {SQLITE_DB}")
        return

    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in .env")
        return

    print("Connecting to SQLite...")
    sl_conn = sqlite3.connect(SQLITE_DB)
    sl_conn.row_factory = sqlite3.Row
    sl_cur = sl_conn.cursor()

    print("Connecting to PostgreSQL (Supabase)...")
    try:
        pg_conn = psycopg2.connect(DATABASE_URL)
        pg_cur = pg_conn.cursor()
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")
        return

    # First, let's initialize the Supabase DB schema
    try:
        import database
        database.init_db()
        print("PostgreSQL schema initialized.")
    except Exception as e:
        print(f"Error initializing schema: {e}")

    # Tables to migrate
    tables = [
        'config', 'photos', 'reasons', 'quiz_questions', 'wheel_presets',
        'timeline', 'jar_messages', 'wishes', 'secret_letters', 'diary_entries',
        'challenges', 'pings', 'diary_reactions', 'bucket_list', 'mood_tracker',
        'calendar_events', 'jar_history', 'songs', 'movies'
    ]

    for table in tables:
        print(f"Migrating table: {table}...")
        try:
            sl_cur.execute(f"SELECT * FROM {table}")
            rows = sl_cur.fetchall()
            if not rows:
                print(f"  -> Empty table. Skipping.")
                continue

            columns = rows[0].keys()
            col_names = ', '.join(columns)
            placeholders = ', '.join(['%s'] * len(columns))
            
            insert_query = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"

            # For tables with ID, we might have conflicts. Let's just catch exceptions.
            # Truncate first to avoid duplicates
            pg_cur.execute(f"TRUNCATE {table} RESTART IDENTITY CASCADE")
            pg_conn.commit()

            count = 0
            for row in rows:
                values = tuple(row[col] for col in columns)
                try:
                    pg_cur.execute(insert_query, values)
                    count += 1
                except Exception as e:
                    print(f"  -> Error inserting row: {e}")
                    pg_conn.rollback()

            pg_conn.commit()
            print(f"  -> Migrated {count} rows.")

            # Update serial sequences if table has 'id'
            if 'id' in columns:
                try:
                    pg_cur.execute(f"SELECT setval('{table}_id_seq', (SELECT MAX(id) FROM {table}))")
                    pg_conn.commit()
                except Exception:
                    pg_conn.rollback()

        except Exception as e:
            print(f"  -> Error on table {table}: {e}")
            pg_conn.rollback()

    sl_conn.close()
    pg_conn.close()
    print("Migration completed successfully!")

if __name__ == '__main__':
    migrate()
