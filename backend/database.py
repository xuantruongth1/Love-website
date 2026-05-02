import psycopg2
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

REASONS_100 = [
    'Vì ở cạnh em, anh thấy mọi thứ dễ chịu hơn.',
    'Không biết từ lúc nào, anh quen có em trong ngày rồi.',
    'Vì em làm anh bớt mệt, kiểu không cần cố gắng nhiều.',
    'Có em ở đó là thấy ổn.',
    'Vì nói chuyện với em không bị gượng, cứ tự nhiên thôi.',
    'Em kiểu… khiến anh thấy yên tâm một cách lạ.',
    'Vì em không làm anh phải giả vờ là người khác.',
    'Chỉ cần em ở đó thôi là đủ rồi.',
    'Vì em không phức tạp như nhiều người khác.',
    'Anh thích cái cách em xuất hiện đúng lúc.',
    'Vì em làm anh thấy mọi thứ không còn nặng nề như trước.',
    'Kiểu có em là thấy ngày đỡ chán hẳn.',
    'Vì em không tạo áp lực cho anh.',
    'Có em rồi thấy cuộc sống bình thường mà lại ổn.',
    'Vì em hiểu anh, dù anh không nói hết.',
    'Anh không giỏi nói, nhưng có em là thấy đúng.',
    'Vì em khiến anh muốn quay lại mỗi ngày.',
    'Kiểu không cần gì to tát, chỉ cần có em là được.',
    'Vì em làm anh bớt suy nghĩ linh tinh.',
    'Anh thấy mình ổn hơn khi có em.',
    'Vì em luôn hỏi anh "ổn không", dù là chuyện nhỏ thôi.',
    'Có thể em không để ý, nhưng mấy cái em quan tâm nhỏ nhỏ lại làm anh nhớ.',
    'Vì em biết lúc nào nên nói, lúc nào nên im lặng.',
    'Anh thích cái cách em quan tâm mà không làm quá lên.',
    'Vì em không bỏ anh một mình khi anh đang không ổn.',
    'Có em là kiểu… không thấy cô đơn nữa.',
    'Vì em luôn nghĩ cho anh, dù không nói ra.',
    'Em không hoàn hảo, nhưng với anh là đủ.',
    'Vì em không làm anh phải đoán em đang nghĩ gì.',
    'Kiểu em ở đó, là anh thấy an tâm.',
    'Vì em chịu nghe anh nói mấy chuyện linh tinh.',
    'Có em rồi, anh thấy mình có người để dựa vào.',
    'Vì em không rời đi khi mọi thứ không vui.',
    'Anh biết không phải lúc nào cũng dễ, nhưng em vẫn ở lại.',
    'Vì em làm anh cảm thấy mình quan trọng.',
    'Có em là kiểu… không cần tìm thêm ai nữa.',
    'Vì em không làm anh thấy bị bỏ rơi.',
    'Em làm anh thấy mối này đáng để giữ.',
    'Vì em không bỏ cuộc dễ dàng.',
    'Anh quý cái cách em chọn ở lại.',
    'Vì anh quen có em rồi, giờ bỏ cũng không được.',
    'Anh không nói nhiều, nhưng thật ra anh không muốn chia em cho ai.',
    'Vì em là người anh để ý nhất trong đám đông.',
    'Có thể anh không nói ra, nhưng anh muốn giữ em lại.',
    'Vì em không dễ thay thế như mấy người khác.',
    'Anh không phải kiểu dễ thích ai, nhưng em thì khác.',
    'Vì em làm anh nghiêm túc hơn với chuyện này.',
    'Kiểu không còn là "cho vui" nữa.',
    'Vì em làm anh không muốn tìm ai khác.',
    'Anh chọn em rồi.',
    'Vì em là ngoại lệ hiếm hoi của anh.',
    'Có em rồi, anh thấy đủ.',
    'Vì anh không muốn bắt đầu lại với ai khác nữa.',
    'Em kiểu… khó bỏ thật.',
    'Vì em làm anh nghĩ tới lâu dài.',
    'Anh không muốn mất em vì mấy chuyện nhỏ.',
    'Vì em là người anh ưu tiên.',
    'Anh hơi ích kỷ với em, nhưng chắc em hiểu.',
    'Vì em làm anh muốn giữ mọi thứ ổn định.',
    'Anh muốn em ở lại lâu hơn.',
    'Vì em đến đúng lúc anh cần một người như vậy.',
    'Anh không hoàn hảo, nhưng em vẫn ở lại.',
    'Vì em không bắt anh phải trở thành người khác.',
    'Có em, anh thấy mình không tệ như anh nghĩ.',
    'Vì em chấp nhận cả những lúc anh khó chịu.',
    'Anh không giỏi thể hiện, nhưng em vẫn hiểu.',
    'Vì em giúp anh tốt hơn một chút mỗi ngày.',
    'Không phải kiểu thay đổi lớn, nhưng đủ để anh nhận ra.',
    'Vì em làm anh muốn cố gắng hơn.',
    'Anh không muốn làm em thất vọng.',
    'Vì em làm anh tin vào mối này.',
    'Có em là thấy mọi thứ có ý nghĩa hơn.',
    'Vì em khiến anh thấy mình đáng để được yêu.',
    'Anh không quen được quan tâm như vậy trước đây.',
    'Vì em làm anh thấy mình không một mình.',
    'Anh biết không phải lúc nào cũng dễ, nhưng em vẫn ở đó.',
    'Vì em làm anh muốn giữ lại những gì đang có.',
    'Anh không muốn quay lại khoảng thời gian không có em.',
    'Vì em khiến anh thấy cuộc sống có hướng hơn.',
    'Anh thấy mình may khi gặp em.',
    'Vì anh muốn đi lâu với em, không phải kiểu vài tháng.',
    'Anh nghĩ về tương lai, và có em trong đó.',
    'Không cần gì lớn, chỉ cần vẫn có em bên cạnh là được.',
    'Vì anh muốn mỗi ngày đều có em trong cuộc sống.',
    'Anh không nói ra nhiều, nhưng anh nghiêm túc với em.',
    'Vì em là người anh muốn giữ lại lâu dài.',
    'Anh không muốn mất những gì đang có giữa mình.',
    'Vì em là người anh nghĩ tới khi nói "sau này".',
    'Không phải kiểu hứa hẹn, mà là anh thật sự nghĩ vậy.',
    'Vì anh muốn cùng em đi qua những chuyện bình thường nhất.',
    'Anh không cần quá hoàn hảo, chỉ cần có em là đủ.',
    'Vì em là người anh chọn, không phải ngẫu nhiên.',
    'Anh không muốn thay đổi người bên cạnh nữa.',
    'Vì em là người anh muốn ở lại cùng.',
    'Không phải vì em đặc biệt hoàn hảo, mà vì em là em.',
    'Và thế là đủ với anh.',
    'Anh không chắc tương lai thế nào, nhưng anh muốn có em trong đó.',
    'Vì em làm anh muốn giữ mối này tử tế.',
    'Anh không muốn làm lại từ đầu với ai khác.',
    'Và cuối cùng… vì là em, nên anh chọn.',
]

QUIZ_100 = [
    {'id':1,  'question':'Anh thích ăn sáng với món gì nhất?',                          'options':['Bánh mì','Phở','Xôi','Cháo'],                                                       'answer':0},
    {'id':2,  'question':'Anh hay đặt báo thức lúc mấy giờ?',                           'options':['5:30','6:00','6:30','7:00'],                                                        'answer':0},
    {'id':3,  'question':'Anh thích mùa nào nhất trong năm?',                            'options':['Xuân','Hạ','Thu','Đông'],                                                           'answer':0},
    {'id':4,  'question':'Môn thể thao anh yêu thích là gì?',                            'options':['Bóng đá','Cầu lông','Bơi lội','Gym'],                                              'answer':0},
    {'id':5,  'question':'Anh thích ăn cay không?',                                      'options':['Rất thích','Được thôi','Hơi sợ','Không ăn được'],                                  'answer':0},
    {'id':6,  'question':'Anh dùng điện thoại hệ điều hành gì?',                         'options':['iPhone (iOS)','Android','Cả hai','Không quan tâm'],                                'answer':0},
    {'id':7,  'question':'Anh hay ngủ theo tư thế nào?',                                 'options':['Nằm ngửa','Nằm nghiêng trái','Nằm nghiêng phải','Nằm sấp'],                        'answer':0},
    {'id':8,  'question':'Loại kem anh hay chọn là gì?',                                 'options':['Chocolate','Vanilla','Matcha','Dâu'],                                               'answer':0},
    {'id':9,  'question':'Anh thích xem phim ở rạp hay ở nhà?',                          'options':['Ở rạp','Ở nhà','Tùy tâm trạng','Không thích xem phim'],                            'answer':0},
    {'id':10, 'question':'Anh hay mua sắm online hay offline?',                          'options':['Online','Offline','Cả hai','Hầu như không mua'],                                   'answer':0},
    {'id':11, 'question':'Thời điểm anh tập trung làm việc tốt nhất?',                   'options':['Sáng sớm','Buổi trưa','Chiều tối','Đêm khuya'],                                    'answer':0},
    {'id':12, 'question':'Anh thích đồ uống nóng hay lạnh?',                             'options':['Nóng','Lạnh','Tùy thời tiết','Không quan trọng'],                                  'answer':0},
    {'id':13, 'question':'Anh hay đọc sách thể loại gì?',                                'options':['Tâm lý học','Kỹ năng sống','Tiểu thuyết','Không đọc sách'],                        'answer':0},
    {'id':14, 'question':'App mạng xã hội anh dùng nhiều nhất?',                         'options':['Facebook','Instagram','TikTok','Không dùng MXH'],                                  'answer':0},
    {'id':15, 'question':'Anh thích đi chơi lúc mấy giờ nhất?',                          'options':['Sáng','Chiều','Tối','Không quan trọng'],                                            'answer':0},
    {'id':16, 'question':'Khi stress, anh thường làm gì?',                               'options':['Ngủ nhiều hơn','Đi dạo một mình','Nói chuyện với người thân','Chơi game/nghe nhạc'],'answer':0},
    {'id':17, 'question':'Anh thuộc kiểu người nào?',                                    'options':['Hướng ngoại','Hướng nội','Tùy tình huống','Không biết'],                            'answer':0},
    {'id':18, 'question':'Anh hay thức khuya vì lý do gì?',                              'options':['Làm việc','Lướt điện thoại','Chơi game','Suy nghĩ nhiều thứ'],                      'answer':0},
    {'id':19, 'question':'Khi tức giận, anh có xu hướng gì?',                            'options':['Im lặng','Nói thẳng','Bỏ ra ngoài','Làm việc khác để quên'],                       'answer':0},
    {'id':20, 'question':'Anh là người có tổ chức hay tự phát?',                         'options':['Rất có kế hoạch','Khá có kế hoạch','Hơi lộn xộn','Spontaneous hoàn toàn'],         'answer':0},
    {'id':21, 'question':'Điều anh tự hào nhất ở bản thân?',                             'options':['Sự kiên nhẫn','Sự trung thực','Sự chăm chỉ','Sự hài hước'],                        'answer':0},
    {'id':22, 'question':'Anh hay hối hận không?',                                       'options':['Thường xuyên','Thỉnh thoảng','Hiếm khi','Không bao giờ'],                           'answer':0},
    {'id':23, 'question':'Anh cảm thấy thế nào với việc khóc?',                          'options':['Thoải mái khóc','Cố kìm lại','Không bao giờ khóc','Tùy hoàn cảnh'],                'answer':0},
    {'id':24, 'question':'Khi gặp vấn đề, anh làm gì đầu tiên?',                         'options':['Suy nghĩ một mình','Tìm người tâm sự','Tìm giải pháp ngay','Để đó rồi tính sau'],  'answer':0},
    {'id':25, 'question':'Anh hay nói "không" dễ không?',                                'options':['Rất dễ','Khó nói','Tùy người','Luôn cố ý kiếm cớ'],                                'answer':0},
    {'id':26, 'question':'Điều đầu tiên anh nhận ra ở em là gì?',                        'options':['Nụ cười','Ánh mắt','Giọng nói','Sự chân thành'],                                   'answer':0},
    {'id':27, 'question':'Anh thích được em bày tỏ tình cảm bằng cách nào?',             'options':['Lời nói','Hành động','Quà tặng','Thời gian bên nhau'],                             'answer':0},
    {'id':28, 'question':'Khi anh nhớ em, anh thường làm gì?',                           'options':['Nhắn tin ngay','Gọi điện','Nhìn ảnh em','Chờ em liên lạc trước'],                  'answer':0},
    {'id':29, 'question':'Anh nghĩ ngày kỷ niệm quan trọng không?',                      'options':['Rất quan trọng','Quan trọng','Bình thường','Không cần thiết'],                      'answer':0},
    {'id':30, 'question':'Anh thích đi hẹn hò kiểu nào?',                                'options':['Ăn tối lãng mạn','Xem phim cùng','Đi dạo/picnic','Ở nhà cùng nhau'],               'answer':0},
    {'id':31, 'question':'Anh muốn em gọi anh là gì?',                                   'options':['Anh','Tên thật','Biệt danh ngọt','Tùy em'],                                        'answer':0},
    {'id':32, 'question':'Điều anh lo nhất trong tình yêu là gì?',                       'options':['Hiểu lầm','Xa cách','Mất tin tưởng','Thay đổi cảm xúc'],                           'answer':0},
    {'id':33, 'question':'Anh thích thể hiện tình cảm công khai không?',                 'options':['Rất thích','Đôi khi','Hơi ngại','Không thích'],                                    'answer':0},
    {'id':34, 'question':'Khi hai đứa cãi nhau, anh hay làm hòa trước không?',           'options':['Hay làm hòa trước','Tùy lỗi ai','Chờ em trước','Để thời gian giải quyết'],         'answer':0},
    {'id':35, 'question':'Điều anh muốn em hiểu nhất về anh là gì?',                     'options':['Anh luôn cố gắng','Anh cần không gian','Anh rất để ý nhỏ nhặt','Anh yêu em theo cách riêng'],'answer':0},
    {'id':36, 'question':'Anh thấy tình yêu thể hiện qua điều gì nhất?',                 'options':['Lời nói yêu thương','Sự chăm sóc hàng ngày','Sự hy sinh','Sự trung thành'],        'answer':0},
    {'id':37, 'question':'Khi em vui, anh cảm thấy thế nào?',                            'options':['Hạnh phúc lây','Muốn chia sẻ niềm vui','Thấy cuộc đời đẹp hơn','Tất cả những điều trên'],'answer':0},
    {'id':38, 'question':'Anh thích ôm hay được ôm?',                                    'options':['Ôm em','Được em ôm','Cả hai','Không quan trọng'],                                   'answer':0},
    {'id':39, 'question':'Anh thường nhắn tin kiểu gì nhất?',                            'options':['Ngắn gọn','Dài dòng tâm sự','Emoji nhiều','Voice note/gọi luôn'],                  'answer':0},
    {'id':40, 'question':'Điều gì khiến anh cảm thấy được yêu nhất?',                   'options':['Em hỏi thăm mỗi ngày','Em nhớ những điều nhỏ','Em ưu tiên anh','Em tin tưởng anh'],'answer':0},
    {'id':41, 'question':'Anh và em gặp nhau lần đầu ở đâu?',                            'options':['Trường học','Qua mạng','Qua bạn chung','Nơi làm việc'],                             'answer':0},
    {'id':42, 'question':'Kỷ niệm đáng nhớ nhất của anh và em là gì?',                  'options':['Lần đầu gặp nhau','Chuyến đi chơi đầu tiên','Ngày yêu nhau','Lần đầu cãi rồi làm lành'],'answer':0},
    {'id':43, 'question':'Lần đầu anh nói "anh yêu em" ở đâu?',                         'options':['Qua tin nhắn','Gọi điện','Nói trực tiếp','Anh quên mất rồi'],                       'answer':0},
    {'id':44, 'question':'Món quà nào em tặng anh anh thích nhất?',                      'options':['Đồ ăn tự làm','Phụ kiện/đồ dùng','Thư tay/card','Chưa có quà nào cả'],             'answer':0},
    {'id':45, 'question':'Ngày đầu tiên anh nhận ra mình thích em là khi nào?',          'options':['Gặp lần đầu','Sau vài buổi nói chuyện','Khi em quan tâm anh','Không biết chính xác'],'answer':0},
    {'id':46, 'question':'Lần đầu anh em đi chơi cùng là ở đâu?',                       'options':['Quán cà phê','Công viên/ngoài trời','Rạp chiếu phim','Đi ăn'],                      'answer':0},
    {'id':47, 'question':'Điều gì anh muốn làm lại trong quá khứ với em?',              'options':['Confess sớm hơn','Đi đâu đó đặc biệt','Nói yêu nhiều hơn','Không có gì cần thay đổi'],'answer':0},
    {'id':48, 'question':'Ngày nào trong mỗi năm anh mong đợi nhất?',                   'options':['Sinh nhật em','Ngày kỷ niệm','Ngày lễ tình nhân','Ngày Giáng sinh'],                'answer':0},
    {'id':49, 'question':'Bài hát nào gợi nhắc anh về em nhất?',                         'options':['Một bài cụ thể','Nhiều bài','Anh chưa có bài nào','Mọi bài nhạc buồn'],             'answer':0},
    {'id':50, 'question':'Điều hài hước nhất xảy ra giữa hai đứa là gì?',               'options':['Một sự cố ngớ ngẩn','Câu nói lỡ miệng buồn cười','Bị lạc đường','Anh không nhớ cụ thể'],'answer':0},
    {'id':51, 'question':'Anh là con thứ mấy trong gia đình?',                           'options':['Con một','Con đầu','Con thứ','Con út'],                                              'answer':0},
    {'id':52, 'question':'Anh gần gũi nhất với ai trong gia đình?',                      'options':['Ba','Mẹ','Anh/chị/em','Ông bà'],                                                    'answer':0},
    {'id':53, 'question':'Dịp Tết anh thích làm gì nhất?',                               'options':['Về quê','Đi chơi với bạn bè','Nghỉ ngơi ở nhà','Ra ngoài cùng người yêu'],         'answer':0},
    {'id':54, 'question':'Điều anh học được từ ba/mẹ là gì?',                            'options':['Sự chăm chỉ','Lòng tốt','Sự kiên nhẫn','Giá trị gia đình'],                        'answer':0},
    {'id':55, 'question':'Anh muốn có mấy đứa con trong tương lai?',                     'options':['1','2','3','Chưa nghĩ đến'],                                                        'answer':0},
    {'id':56, 'question':'Theo anh, điều quan trọng nhất trong một gia đình là gì?',     'options':['Sự tin tưởng','Giao tiếp cởi mở','Kinh tế ổn định','Tình yêu thương'],              'answer':0},
    {'id':57, 'question':'Anh thường về thăm gia đình bao lâu một lần?',                 'options':['Mỗi tuần','Mỗi tháng','Mỗi khi có dịp','Ở cùng gia đình'],                         'answer':0},
    {'id':58, 'question':'Điều anh coi trọng nhất trong cuộc sống?',                     'options':['Sức khỏe','Tình cảm','Sự nghiệp','Tự do'],                                         'answer':0},
    {'id':59, 'question':'Điều anh muốn con cái mình học được nhất là gì?',              'options':['Trung thực','Kiên cường','Tử tế','Độc lập'],                                        'answer':0},
    {'id':60, 'question':'Quan điểm của anh về hôn nhân là gì?',                         'options':['Thiêng liêng và trọn đời','Cần chuẩn bị kỹ','Tùy duyên','Còn trẻ chưa nghĩ nhiều'],'answer':0},
    {'id':61, 'question':'Sau 5 năm nữa, anh muốn mình ở đâu?',                         'options':['TP.HCM','Hà Nội','Nước ngoài','Chưa có kế hoạch cụ thể'],                           'answer':0},
    {'id':62, 'question':'Nghề nghiệp anh mơ ước nhất là gì?',                           'options':['Doanh nhân','Kỹ sư giỏi','Freelancer tự do','Điều anh đang làm'],                   'answer':0},
    {'id':63, 'question':'Anh muốn sống ở loại nhà nào?',                                'options':['Căn hộ chung cư','Nhà riêng có sân','Nhà phố trung tâm','Nhà vườn yên tĩnh'],      'answer':0},
    {'id':64, 'question':'Quốc gia anh muốn du lịch nhất?',                              'options':['Nhật Bản','Hàn Quốc','Châu Âu','Mỹ'],                                              'answer':0},
    {'id':65, 'question':'Anh muốn nghỉ hưu năm bao nhiêu tuổi?',                        'options':['40','45','50','60'],                                                                'answer':0},
    {'id':66, 'question':'Điều anh muốn đạt được trong 1 năm tới?',                      'options':['Mua được thứ gì đó lớn','Thăng tiến công việc','Đi du lịch một chuyến','Sống lành mạnh hơn'],'answer':0},
    {'id':67, 'question':'Anh nghĩ mình và em sẽ làm gì vào năm sau?',                  'options':['Đi du lịch cùng','Sống gần nhau hơn','Có nhiều kỷ niệm mới','Tất cả những điều trên'],'answer':0},
    {'id':68, 'question':'Anh có muốn tự kinh doanh không?',                             'options':['Rất muốn','Đang ấp ủ','Chưa chắc','Không muốn'],                                   'answer':0},
    {'id':69, 'question':'Kỹ năng gì anh muốn học trong tương lai?',                     'options':['Ngoại ngữ','Kỹ năng kỹ thuật','Kỹ năng kinh doanh','Kỹ năng sáng tạo'],            'answer':0},
    {'id':70, 'question':'Điều anh sợ nhất về tương lai là gì?',                         'options':['Thất bại','Cô đơn','Bệnh tật/mất người thân','Không đạt được mục tiêu'],            'answer':0},
    {'id':71, 'question':'Nếu anh là siêu anh hùng, anh chọn năng lực gì?',             'options':['Bay','Vô hình','Đọc suy nghĩ','Dịch chuyển tức thời'],                              'answer':0},
    {'id':72, 'question':'Anh chọn: mãi mãi ăn 1 món hay không bao giờ ăn món yêu thích?','options':['Mãi mãi 1 món','Không ăn món yêu thích','Không chấp nhận cả 2','Hỏi câu khác đi'],'answer':0},
    {'id':73, 'question':'Nếu có 1 ngày không đi làm/học, anh làm gì?',                 'options':['Ngủ cả ngày','Đi chơi với em','Tự làm việc mình thích','Không biết'],               'answer':0},
    {'id':74, 'question':'Anh thích mèo hay chó hơn?',                                   'options':['Mèo','Chó','Cả hai','Không thích con vật'],                                         'answer':0},
    {'id':75, 'question':'Nếu bị lạc đảo hoang, anh mang theo gì?',                     'options':['Điện thoại','Dao và diêm','Sách','Ảnh người thân'],                                 'answer':0},
    {'id':76, 'question':'Anh thuộc team pizza hay hamburger?',                           'options':['Pizza','Hamburger','Cả hai','Không thích cả 2'],                                    'answer':0},
    {'id':77, 'question':'Nếu được đổi tên, anh chọn tên gì?',                           'options':['Tên hiện tại','Một tên nước ngoài','Tên nghe mạnh mẽ','Không muốn đổi'],           'answer':0},
    {'id':78, 'question':'Anh chọn: không có internet 1 tuần hay không có điện thoại 1 tuần?','options':['Không internet','Không điện thoại','Không chịu được cả 2','Chọn không internet'],'answer':0},
    {'id':79, 'question':'Nếu cuộc đời anh được làm phim, thể loại gì phù hợp nhất?',   'options':['Hành động','Hài hước','Tình cảm','Tài liệu'],                                       'answer':0},
    {'id':80, 'question':'Anh thích ăn vặt loại nào nhất?',                              'options':['Snack mặn','Kẹo ngọt','Trái cây','Đồ chiên rán'],                                  'answer':0},
    {'id':81, 'question':'Nếu được chọn sống ở thế kỷ nào, anh chọn gì?',               'options':['Hiện tại','Tương lai','Thế kỷ 19','Thế kỷ 20'],                                    'answer':0},
    {'id':82, 'question':'Anh sẽ dùng 1 triệu đồng dư vào việc gì?',                    'options':['Tiết kiệm','Ăn uống ngon','Mua thứ gì đó','Cho em'],                                'answer':0},
    {'id':83, 'question':'Theo anh, điều em lo lắng nhiều nhất là gì?',                  'options':['Học hành/công việc','Sức khỏe gia đình','Chuyện tình cảm','Tương lai bản thân'],    'answer':0},
    {'id':84, 'question':'Anh nghĩ em thích nhận quà loại nào nhất?',                    'options':['Đồ ăn ngon','Phụ kiện thời trang','Thứ gì có ý nghĩa','Trải nghiệm đáng nhớ'],     'answer':0},
    {'id':85, 'question':'Khi em buồn, điều gì làm em vui lại nhanh nhất?',              'options':['Được ôm','Được lắng nghe','Đi ăn ngon','Xem phim/nghe nhạc'],                       'answer':0},
    {'id':86, 'question':'Theo anh, điểm mạnh lớn nhất của em là gì?',                   'options':['Sự chăm chỉ','Lòng tốt','Sự thông minh','Cá tính đáng yêu'],                       'answer':0},
    {'id':87, 'question':'Anh nghĩ em thuộc kiểu người nào?',                            'options':['Hướng nội','Hướng ngoại','Tùy tình huống','Bí ẩn không đoán được'],                'answer':0},
    {'id':88, 'question':'Điều em hay làm khi nhắn tin với anh?',                        'options':['Dùng nhiều emoji','Nhắn dài','Trả lời ngắn','Gọi luôn'],                            'answer':0},
    {'id':89, 'question':'Theo anh, điều gì em thích nhất ở anh?',                       'options':['Sự quan tâm','Sự hài hước','Sự trưởng thành','Tình yêu anh dành cho em'],          'answer':0},
    {'id':90, 'question':'Anh nghĩ em sợ nhất điều gì trong tình yêu?',                 'options':['Bị bỏ rơi','Mất tin tưởng','Hiểu lầm kéo dài','Thay đổi cảm xúc'],                 'answer':0},
    {'id':91, 'question':'Anh thường ngủ bao nhiêu tiếng mỗi đêm?',                      'options':['Dưới 6 tiếng','6-7 tiếng','7-8 tiếng','Trên 8 tiếng'],                             'answer':0},
    {'id':92, 'question':'Anh gọi em là gì nhiều nhất?',                                 'options':['Em','Tên thật','Biệt danh ngọt','Tùy lúc khác nhau'],                               'answer':0},
    {'id':93, 'question':'Điều đầu tiên anh làm khi thức dậy?',                          'options':['Xem điện thoại','Nhắn tin cho em','Rửa mặt/vệ sinh','Nằm thêm chút'],              'answer':0},
    {'id':94, 'question':'Anh hay để ý đến điều nhỏ nhoi nào của em?',                  'options':['Nụ cười','Mái tóc','Biểu cảm','Giọng nói'],                                         'answer':0},
    {'id':95, 'question':'Khi nào anh cảm thấy hạnh phúc nhất?',                         'options':['Khi ở bên em','Khi đạt được gì đó','Khi gia đình sum họp','Khi được nghỉ ngơi'],   'answer':0},
    {'id':96, 'question':'Điều gì anh muốn nói với em mà chưa nói được?',               'options':['Anh yêu em rất nhiều','Cảm ơn em đã chọn anh','Em làm anh tốt hơn','Tất cả những điều trên'],'answer':0},
    {'id':97, 'question':'Anh muốn ăn gì trong ngày hẹn hò lý tưởng?',                 'options':['Sushi/Nhật','Nướng BBQ','Đồ Việt truyền thống','Tùy em chọn'],                      'answer':0},
    {'id':98, 'question':'Nếu viết 1 câu mô tả tình yêu của hai đứa, anh chọn câu nào?','options':['Chậm mà chắc','Nhỏ nhoi mà ấm áp','Bình yên như hơi thở','Lãng mạn như trong phim'],'answer':0},
    {'id':99, 'question':'Điều anh cảm ơn em nhất kể từ khi yêu nhau?',                 'options':['Em luôn ở đây với anh','Em khiến anh trưởng thành','Em là điều tốt nhất xảy ra','Tất cả những điều trên'],'answer':0},
    {'id':100,'question':'Nếu chỉ được dùng 3 từ để nói với em, anh chọn gì?',          'options':['Anh yêu em','Em thật tuyệt','Anh cần em','Mãi bên nhau'],                           'answer':0},

    # ── Nhóm 11: Tuổi thơ ───────────────────────────────────────────────
    {'id':101,'question':'Môn học anh thích nhất hồi đi học là gì?',                     'options':['Toán','Văn','Thể dục','Tin học'],                                                    'answer':0},
    {'id':102,'question':'Anh hay chơi trò gì nhất hồi nhỏ?',                            'options':['Đá bóng','Trốn tìm','Chơi game','Đọc truyện'],                                      'answer':0},
    {'id':103,'question':'Nghề nghiệp anh từng mơ ước lúc còn bé?',                      'options':['Phi công','Bác sĩ','Kỹ sư','Cảnh sát'],                                             'answer':0},
    {'id':104,'question':'Kỷ niệm tuổi thơ nào anh nhớ nhất?',                           'options':['Cùng gia đình đi chơi','Ngày đầu đi học','Hè đầu tiên đi xa','Lần đầu đạp xe một mình'],'answer':0},
    {'id':105,'question':'Phim hoạt hình nào anh xem nhiều nhất hồi nhỏ?',               'options':['Doraemon','Dragon Ball','Conan','Naruto'],                                           'answer':0},
    {'id':106,'question':'Anh có phải đứa trẻ ngoan ngoãn không?',                       'options':['Rất ngoan','Tương đối ngoan','Hay nghịch','Nghịch lắm'],                             'answer':0},
    {'id':107,'question':'Thứ anh sợ nhất hồi còn nhỏ là gì?',                           'options':['Bóng tối','Côn trùng','Bị mắng','Tiêm thuốc'],                                      'answer':0},
    {'id':108,'question':'Hồi học phổ thông, anh thuộc ban nào?',                        'options':['Ban tự nhiên','Ban xã hội','Ban cơ bản','Trường chuyên'],                           'answer':0},
    {'id':109,'question':'Anh có bạn thân từ hồi tiểu học vẫn còn liên lạc không?',      'options':['Có, vẫn thân','Có nhưng ít gặp','Mất liên lạc rồi','Không có bạn thân hồi nhỏ'],   'answer':0},
    {'id':110,'question':'Trò chơi điện tử đầu tiên anh từng chơi là gì?',               'options':['Mario','Contra','Pokemon','Liên Minh/PUBG'],                                        'answer':0},

    # ── Nhóm 12: Âm nhạc ────────────────────────────────────────────────
    {'id':111,'question':'Thể loại nhạc anh nghe nhiều nhất?',                            'options':['Pop/V-pop','Indie/acoustic','EDM/nhạc sôi động','Rap/hip-hop'],                     'answer':0},
    {'id':112,'question':'Ca sĩ Việt anh yêu thích nhất?',                               'options':['Sơn Tùng M-TP','Đen Vâu','Hà Anh Tuấn','Erik'],                                    'answer':0},
    {'id':113,'question':'Ca sĩ/nhóm nhạc quốc tế anh thích nhất?',                      'options':['BTS/K-pop','Taylor Swift','Ed Sheeran','Nhạc không lời'],                           'answer':0},
    {'id':114,'question':'Anh thường nghe nhạc trong hoàn cảnh nào?',                    'options':['Khi làm việc','Khi đi đường','Khi tập thể dục','Trước khi ngủ'],                    'answer':0},
    {'id':115,'question':'Anh có biết chơi nhạc cụ nào không?',                          'options':['Guitar','Piano','Không biết chơi','Đang học'],                                      'answer':0},
    {'id':116,'question':'Kiểu bài hát anh hay nghe khi buồn?',                          'options':['Nhạc buồn để cảm hết','Nhạc vui để quên đi','Nhạc không lời','Không nghe nhạc khi buồn'],'answer':0},
    {'id':117,'question':'Âm lượng anh thường để khi nghe nhạc?',                        'options':['Rất to','Vừa phải','Khẽ thôi','Tùy tâm trạng'],                                     'answer':0},
]

JAR_100 = [
    {'type':'love',      'text':'Em là điều dịu dàng nhất từng xảy ra trong cuộc đời anh.'},
    {'type':'love',      'text':'Mỗi lần nhìn em cười, anh lại thấy lý do để yêu em thêm một lần nữa.'},
    {'type':'love',      'text':'Anh không cần thế giới hoàn hảo — chỉ cần có em là đủ.'},
    {'type':'love',      'text':'Yêu em là điều dễ dàng nhất và quý giá nhất anh từng làm.'},
    {'type':'love',      'text':'Anh biết ơn mỗi ngày vì em đã chọn ở bên anh.'},
    {'type':'love',      'text':'Có em, những ngày tẻ nhạt cũng trở nên đáng sống.'},
    {'type':'love',      'text':'Anh muốn là người cuối cùng em nói "ngủ ngon" trước khi nhắm mắt.'},
    {'type':'love',      'text':'Dù ngày mai có điều gì, anh vẫn chọn em — như anh đã chọn hôm qua.'},
    {'type':'love',      'text':'Em không hoàn hảo, anh cũng vậy — nhưng cùng nhau, chúng mình hoàn chỉnh.'},
    {'type':'love',      'text':'Anh không giỏi nói những lời hoa mỹ, nhưng anh thật lòng yêu em từng ngày.'},
    {'type':'love',      'text':'Bên em, anh học được rằng yêu không phải là cảm giác nhất thời — đó là sự lựa chọn.'},
    {'type':'love',      'text':'Em là người anh muốn chia sẻ mọi điều — từ chuyện vui nhỏ nhặt đến giấc mơ lớn nhất.'},
    {'type':'love',      'text':'Anh thích những khoảnh khắc hai đứa chỉ ngồi yên bên nhau, không cần nói gì.'},
    {'type':'love',      'text':'Tim anh chỉ có một chỗ dành cho người đặc biệt nhất — và đó là em.'},
    {'type':'love',      'text':'Anh muốn cùng em già đi, cùng nhìn lại những kỷ niệm và cười thật hạnh phúc.'},
    {'type':'love',      'text':'Em không biết đâu, nhưng anh hay nhìn em và thầm cảm ơn vì em đã xuất hiện.'},
    {'type':'love',      'text':'Dù cuộc sống có bận rộn đến đâu, em vẫn luôn là ưu tiên số một của anh.'},
    {'type':'love',      'text':'Anh muốn là người ôm em mỗi khi em mệt — và ở đó cho đến khi em thấy ổn hơn.'},
    {'type':'love',      'text':'Nhìn em, anh hiểu tại sao người ta hay nói "tìm được một người để yêu cả đời".'},
    {'type':'love',      'text':'Em vừa là bến bình yên vừa là cuộc phiêu lưu thú vị nhất của cuộc đời anh.'},
    {'type':'love',      'text':'Anh yêu em không vì em hoàn hảo, mà vì em là em — điều đó hơn tất cả.'},
    {'type':'love',      'text':'Cảm ơn em đã kiên nhẫn với anh — với tất cả những lúc anh chưa đủ tốt.'},
    {'type':'love',      'text':'Anh tự hào được yêu em và được em yêu — mỗi ngày điều đó vẫn khiến anh xúc động.'},
    {'type':'love',      'text':'Yêu em là hành trình đẹp nhất anh từng bước đi.'},
    {'type':'love',      'text':'Anh muốn nắm tay em — hôm nay, ngày mai, và tất cả những ngày sau này.'},
    {'type':'reason',    'text':'Anh yêu em vì em cười bằng cả ánh mắt, không chỉ bằng đôi môi.'},
    {'type':'reason',    'text':'Anh yêu em vì em nhớ những điều nhỏ nhặt mà người khác hay bỏ qua.'},
    {'type':'reason',    'text':'Anh yêu em vì em dũng cảm nói thật, dù đôi khi điều đó khó nói.'},
    {'type':'reason',    'text':'Anh yêu em vì em chăm sóc người khác bằng cả trái tim, không tính toán.'},
    {'type':'reason',    'text':'Anh yêu em vì em biết cách làm không khí nhẹ hơn khi mọi thứ đang nặng nề.'},
    {'type':'reason',    'text':'Anh yêu em vì em không bao giờ giả vờ — em luôn là chính mình dù ở đâu.'},
    {'type':'reason',    'text':'Anh yêu em vì em cố gắng mỗi ngày, dù không ai nhìn thấy điều đó.'},
    {'type':'reason',    'text':'Anh yêu em vì ánh mắt em khi em đang say sưa kể về điều mình thích — lung linh lắm.'},
    {'type':'reason',    'text':'Anh yêu em vì em biết lắng nghe thật sự, không chỉ nghe cho có.'},
    {'type':'reason',    'text':'Anh yêu em vì em không ngại xin lỗi khi em sai — điều đó cần rất nhiều tự trọng.'},
    {'type':'reason',    'text':'Anh yêu em vì em đặt tình cảm thật vào mọi thứ em làm.'},
    {'type':'reason',    'text':'Anh yêu em vì em không cần anh mạnh mẽ mọi lúc — em cho anh không gian để yếu.'},
    {'type':'reason',    'text':'Anh yêu em vì nụ cười của em có khả năng làm anh quên đi mệt mỏi ngay lập tức.'},
    {'type':'reason',    'text':'Anh yêu em vì em trung thành — với những người em yêu quý và với chính em.'},
    {'type':'reason',    'text':'Anh yêu em vì em luôn tìm cách hiểu anh thay vì vội kết luận.'},
    {'type':'reason',    'text':'Anh yêu em vì giọng em khi em lo lắng cho anh — nghe mà lòng anh ấm lạ.'},
    {'type':'reason',    'text':'Anh yêu em vì em không để anh cảm thấy cô đơn ngay cả khi hai đứa ở xa nhau.'},
    {'type':'reason',    'text':'Anh yêu em vì em mang lại sự bình yên mà anh không biết mình đang tìm kiếm.'},
    {'type':'reason',    'text':'Anh yêu em vì em biết khi nào cần ôm anh và khi nào cần để anh tự mình xử lý.'},
    {'type':'reason',    'text':'Anh yêu em vì sự tồn tại của em trong cuộc đời anh làm tất cả có ý nghĩa hơn.'},
    {'type':'reason',    'text':'Anh yêu em vì em thật thà — không tô vẽ, không che giấu, cứ thế mà em đẹp nhất.'},
    {'type':'reason',    'text':'Anh yêu em vì em biết cách yêu thương mà không làm người kia cảm thấy ngột ngạt.'},
    {'type':'reason',    'text':'Anh yêu em vì em tin vào anh — ngay cả những lúc anh chưa tin vào chính mình.'},
    {'type':'reason',    'text':'Anh yêu em vì em không ngại thể hiện rằng em quan tâm — điều đó dũng cảm lắm.'},
    {'type':'reason',    'text':'Anh yêu em vì bên em, anh thấy mình là phiên bản tốt hơn mỗi ngày.'},
    {'type':'memory',    'text':'Anh vẫn nhớ lần đầu tiên nghe em nói "anh ơi" — tim anh bỗng đập khác đi.'},
    {'type':'memory',    'text':'Anh nhớ lần đầu em chia sẻ với anh chuyện buồn nhất của em. Anh biết ngay em tin anh thật sự.'},
    {'type':'memory',    'text':'Anh vẫn nhớ cảm giác hồi hộp trước mỗi lần gặp em — dù đã quen nhau lâu rồi.'},
    {'type':'memory',    'text':'Anh nhớ lần em nấu ăn cho anh lần đầu. Dù món ăn thế nào, anh thấy ngon vì có em nấu.'},
    {'type':'memory',    'text':'Anh vẫn nhớ lần đầu tiên em tin tưởng chia sẻ điều em chưa từng kể ai.'},
    {'type':'memory',    'text':'Có một lần em buồn và anh không biết nói gì — anh chỉ ôm em thật chặt. Em nói vậy là đủ rồi.'},
    {'type':'memory',    'text':'Anh nhớ lần đầu em giận anh thật sự. Anh sợ — không phải vì em giận, mà vì sợ mất em.'},
    {'type':'memory',    'text':'Anh vẫn giữ lại những tin nhắn đầu tiên của hai đứa. Đọc lại vẫn thấy buồn cười và thương.'},
    {'type':'memory',    'text':'Anh nhớ lần hai đứa đi lạc cùng nhau. Lúc đó mệt nhưng cười nhiều lắm.'},
    {'type':'memory',    'text':'Anh nhớ lần đầu em gọi điện cho anh chỉ để nói "em nhớ anh". Anh không ngủ được đêm đó vì vui.'},
    {'type':'memory',    'text':'Anh vẫn nhớ lần đầu thấy em — không biết sao lúc đó anh chỉ muốn nhìn mãi.'},
    {'type':'memory',    'text':'Anh nhớ có lần em cố thức khuya để đợi anh xong việc. Lúc anh gọi lại, em ngủ quên mất rồi.'},
    {'type':'memory',    'text':'Anh nhớ lần đầu em kể về gia đình. Lúc đó anh biết mình muốn ở lại trong cuộc đời em.'},
    {'type':'memory',    'text':'Có lần hai đứa cùng xem mưa qua cửa sổ mà không nói gì. Anh thấy đó là khoảnh khắc đẹp nhất.'},
    {'type':'memory',    'text':'Anh nhớ lần đầu em nói anh quan trọng với em — anh đã không ngủ được vì hạnh phúc quá.'},
    {'type':'memory',    'text':'Anh vẫn nhớ buổi tối đầu tiên hai đứa mình nhìn sao cùng nhau và kể ước mơ cho nhau nghe.'},
    {'type':'memory',    'text':'Anh nhớ lần em cố nói "không sao đâu" nhưng anh nhìn mắt em biết ngay là không ổn — và anh ở lại.'},
    {'type':'memory',    'text':'Có một lần em dỗi anh, anh vừa lo vừa thấy em dễ thương đến mức không biết phải làm gì.'},
    {'type':'memory',    'text':'Anh nhớ lần đầu hai đứa cùng cười đến không thở được vì một chuyện ngớ ngẩn nào đó.'},
    {'type':'memory',    'text':'Anh vẫn nhớ ngày kỷ niệm đầu tiên — hồi hộp, lung tung, nhưng là ngày đẹp nhất anh từng có.'},
    {'type':'wish',      'text':'Ước gì mỗi sáng em thức dậy đều cảm nhận được rằng có người đang yêu em rất nhiều.'},
    {'type':'wish',      'text':'Mong em biết rằng em không bao giờ cô đơn — anh luôn ở đây, dù gần hay xa.'},
    {'type':'wish',      'text':'Ước gì anh có thể xóa đi những ngày em buồn và thay bằng những ngày em chỉ biết cười.'},
    {'type':'wish',      'text':'Hôm nay em nhớ chăm sóc bản thân nhé — ăn đủ, nghỉ đủ, và đừng áp lực quá nhiều.'},
    {'type':'wish',      'text':'Mong rằng em luôn thấy mình đủ tốt — vì với anh, em hơn đủ rất nhiều.'},
    {'type':'wish',      'text':'Ước gì anh có thể gửi cho em một cái ôm ngay lúc này.'},
    {'type':'wish',      'text':'Mong em luôn nhớ: những ngày khó khăn sẽ qua, và anh sẽ ở đây trong suốt hành trình đó.'},
    {'type':'wish',      'text':'Chúc em hôm nay có ít nhất một khoảnh khắc thật sự hạnh phúc.'},
    {'type':'wish',      'text':'Ước gì anh có thể nói với em mỗi ngày rằng em quan trọng với anh đến nhường nào.'},
    {'type':'wish',      'text':'Mong em ngủ ngon tối nay — và trong giấc mơ có điều gì đó thật đẹp chờ em.'},
    {'type':'wish',      'text':'Ước gì có thể ngồi bên em lúc này, không làm gì cả, chỉ ở đó cùng em thôi.'},
    {'type':'wish',      'text':'Mong rằng những điều em đang cố gắng sẽ sớm được đền đáp xứng đáng.'},
    {'type':'wish',      'text':'Hôm nay em có khỏe không? Anh hỏi thật đấy — không phải hỏi cho có.'},
    {'type':'wish',      'text':'Ước gì anh giỏi hơn trong việc nói những gì anh đang cảm thấy — vì anh yêu em nhiều hơn lời anh nói được.'},
    {'type':'wish',      'text':'Mong rằng em luôn tìm thấy lý do để mỉm cười — dù ngày hôm đó có khó khăn đến đâu.'},
    {'type':'wish',      'text':'Ước gì thời gian chậm lại một chút, để anh tận hưởng từng khoảnh khắc có em lâu hơn.'},
    {'type':'wish',      'text':'Mong em hiểu rằng anh tự hào về em — không phải vì những gì em làm được, mà vì em là ai.'},
    {'type':'wish',      'text':'Ước gì anh có thể ở bên em mỗi khi em cần — không trễ một giây nào.'},
    {'type':'wish',      'text':'Chúc em một ngày thật nhẹ nhàng, thật bình yên — em xứng đáng được có những ngày như thế.'},
    {'type':'wish',      'text':'Mong rằng năm tháng sẽ chứng minh điều anh luôn tin: chúng mình là điều tốt nhất của nhau.'},
    {'type':'challenge', 'text':'Hôm nay hai đứa mình cùng viết 3 điều mình thích ở nhau và đọc cho nhau nghe nhé!'},
    {'type':'challenge', 'text':'Thử thách: Nhắn cho anh/em một tin nhắn bày tỏ tình cảm bằng chỉ 5 từ.'},
    {'type':'challenge', 'text':'Hôm nay anh/em nấu (hoặc đặt) món ăn yêu thích của người kia để bày tỏ tình cảm.'},
    {'type':'challenge', 'text':'Cùng nhau lên kế hoạch cho một buổi date nhỏ trong tuần này — dù chỉ đi uống cà phê.'},
    {'type':'challenge', 'text':'Thử thách: Mỗi người kể 1 kỷ niệm yêu thích nhất của hai đứa trong tuần này.'},
    {'type':'challenge', 'text':'Hôm nay hãy chụp một tấm ảnh selfie cùng nhau và lưu lại làm kỷ niệm.'},
    {'type':'challenge', 'text':'Cùng nghe một bài nhạc yêu thích của người kia — và nói cảm nhận thật sự.'},
    {'type':'challenge', 'text':'Thử thách: Gọi điện cho nhau tối nay và kể 3 điều vui nhất trong ngày hôm nay.'},
    {'type':'challenge', 'text':'Hôm nay mỗi người viết một điều mình ước muốn làm cùng nhau trong tương lai.'},
    {'type':'challenge', 'text':'Thử thách cuối: Nhìn vào mắt nhau và nói "Anh/Em yêu em/anh" thật chân thành — không được cười!'},
]

def _seed_defaults():
    conn = get_db()
    c = conn.cursor()

    # Seed wheel presets
    if c.execute('SELECT COUNT(*) FROM wheel_presets').fetchone()[0] == 0:
        defaults = [
            ('food', 'Hom nay an gi?', json.dumps([
                {'text':'Pho bo','color':'#FF6B9D'},{'text':'Com tam','color':'#FF3366'},
                {'text':'Bun bo','color':'#FF8C69'},{'text':'Banh mi','color':'#FFB347'},
                {'text':'Lau','color':'#87CEEB'},{'text':'Chao','color':'#98FB98'},
            ])),
            ('chore', 'Ai rua bat?', json.dumps([
                {'text':'Anh rua','color':'#FF6B9D'},{'text':'Em rua','color':'#FF3366'},
                {'text':'Oan tu ti','color':'#87CEEB'},{'text':'Cung rua','color':'#98FB98'},
            ])),
            ('weekend', 'Cuoi tuan di dau?', json.dumps([
                {'text':'Ca phe','color':'#FF6B9D'},{'text':'Xem phim','color':'#FF3366'},
                {'text':'Cong vien','color':'#98FB98'},{'text':'Mua sam','color':'#FFB347'},
                {'text':'O nha','color':'#87CEEB'},
            ])),
        ]
        c.executemany('INSERT INTO wheel_presets (id, label, options) VALUES (?,?,?)', defaults)

    # Seed config defaults
    if c.execute('SELECT COUNT(*) FROM config').fetchone()[0] == 0:
        defaults = [
            ('boyName', 'MaiTruongg'), ('girlName', 'PhLien'),
            ('anniversaryDate', '2024-11-05'), ('girlBirthday', '2007-08-04'),
            ('boyPassword', '28052005'), ('girlPassword', '05112024'),
            ('landingTagline', 'Co mot noi chi danh cho chung minh...'),
            ('landingSubtitle', 'Nhap chia khoa de buoc vao the gioi cua chung ta'),
        ]
        c.executemany('INSERT INTO config (key, value) VALUES (%s,%s) ON CONFLICT (key) DO NOTHING', defaults)

    # Seed 100 reasons — replace whenever the list is updated (detected by count mismatch)
    current_count = c.execute('SELECT COUNT(*) FROM reasons').fetchone()[0]
    if current_count != len(REASONS_100):
        c.execute('DELETE FROM reasons')
        special_ids = {50, 100}
        rows = [
            (text, 1 if (i + 1) in special_ids else 0, i + 1)
            for i, text in enumerate(REASONS_100)
        ]
        c.executemany('INSERT INTO reasons (text, special, sort_order) VALUES (?,?,?)', rows)

    # Seed 100 quiz questions — only seed if table is empty (preserves edited answers)
    quiz_count = c.execute('SELECT COUNT(*) FROM quiz_questions').fetchone()[0]
    if quiz_count < len(QUIZ_100):
        existing_ids = {r[0] for r in c.execute('SELECT id FROM quiz_questions').fetchall()}
        for q in QUIZ_100:
            if q['id'] not in existing_ids:
                c.execute(
                    'INSERT INTO quiz_questions (id, question, options, answer) VALUES (?,?,?,?)',
                    (q['id'], q['question'], json.dumps(q['options'], ensure_ascii=False), q['answer'])
                )

    # Seed 100 jar messages — replace on count mismatch
    jar_count = c.execute('SELECT COUNT(*) FROM jar_messages').fetchone()[0]
    if jar_count != len(JAR_100):
        c.execute('DELETE FROM jar_messages')
        c.executemany(
            'INSERT INTO jar_messages (type, text) VALUES (?,?)',
            [(m['type'], m['text']) for m in JAR_100]
        )

    # Seed songs — only if table is empty
    if c.execute('SELECT COUNT(*) FROM songs').fetchone()[0] == 0:
        sample_songs = [
            ('Ten bai hat 1', 'Ten ca si', 'Bai nay nghe lan dau khi di ca phe cung nhau', '', '', 1),
            ('Ten bai hat 2', 'Ten ca si', 'Bai anh hay hat khi nho em', '', '', 2),
            ('Ten bai hat 3', 'Ten ca si', 'Bai nhac cua chuyen di Da Lat', '', '', 3),
            ('Ten bai hat 4', 'Ten ca si', 'Mo bai nay len la nho ngay khoanh khac do', '', '', 4),
            ('Ten bai hat 5', 'Ten ca si', 'Bai thich nhat cua em', '', '', 5),
        ]
        c.executemany(
            'INSERT INTO songs (title, artist, note, youtube_id, spotify_url, sort_order) VALUES (?,?,?,?,?,?)',
            sample_songs
        )

    # Seed movies — only if table is empty
    if c.execute('SELECT COUNT(*) FROM movies').fetchone()[0] == 0:
        sample_movies = [
            ('Your Name (Kimi no Na wa)', 2016, 'Hoat hinh / Tinh cam', 'Cung xem lan dau o nha em', 1),
            ('A Silent Voice (Koe no Katachi)', 2016, 'Hoat hinh / Tinh cam', '', 2),
            ('The Notebook', 2004, 'Tinh cam', '', 3),
            ('La La Land', 2016, 'Nhac kich / Tinh cam', 'Em noi thich phim nay', 4),
            ('About Time', 2013, 'Tinh cam / Ky ao', '', 5),
            ('Before Sunrise', 1995, 'Tinh cam', '', 6),
            ('Eternal Sunshine of the Spotless Mind', 2004, 'Tinh cam / Khoa hoc', '', 7),
            ('Pride & Prejudice', 2005, 'Tinh cam / Lich su', '', 8),
            ('When Harry Met Sally', 1989, 'Hai / Tinh cam', '', 9),
            ('500 Days of Summer', 2009, 'Tinh cam / Doc lap', '', 10),
            ("Howl's Moving Castle", 2004, 'Hoat hinh / Tinh cam', '', 11),
            ('Me Before You', 2016, 'Tinh cam / Bi kich', '', 12),
        ]
        c.executemany(
            'INSERT INTO movies (title, year, genre, note, sort_order) VALUES (?,?,?,?,?)',
            sample_movies
        )

    conn.commit()
    conn.close()
