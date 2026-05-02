#!/usr/bin/env python3
"""
run.py -- Khoi dong Love Website

  python run.py        -- Production: build 1 lan roi chay Flask
  python run.py --dev  -- Dev mode: Vite tu rebuild khi luu file, F5 la thay doi ngay
"""
import os
import sys
import subprocess
import threading

ROOT     = os.path.dirname(os.path.abspath(__file__))
BACKEND  = os.path.join(ROOT, 'backend')
FRONTEND = ROOT   # React app (package.json) nam o thu muc goc

DEV_MODE = '--dev' in sys.argv

def check_python_deps():
    try:
        import flask
        import flask_cors
        print('[OK] Flask da cai san')
    except ImportError:
        print('[!] Chua co Flask. Dang cai...')
        subprocess.run(
            [sys.executable, '-m', 'pip', 'install', '-r',
             os.path.join(ROOT, 'requirements.txt')],
            check=True
        )
        print('[OK] Da cai xong Flask')

def check_frontend_build():
    dist = os.path.join(ROOT, 'dist', 'index.html')
    src_dir = os.path.join(ROOT, 'src')
    needs_build = not os.path.exists(dist)

    if not needs_build and os.path.exists(src_dir):
        dist_mtime = os.path.getmtime(dist)
        for dirpath, _, files in os.walk(src_dir):
            for f in files:
                if os.path.getmtime(os.path.join(dirpath, f)) > dist_mtime:
                    needs_build = True
                    break
            if needs_build:
                break

    if needs_build:
        print('[!] React chua duoc build hoac co thay doi moi. Dang build...')
        result = subprocess.run('npm run build', cwd=FRONTEND, shell=True)
        if result.returncode != 0:
            print('[!] Build that bai. Chay thu cong: npm run build')
            sys.exit(1)
        else:
            print('[OK] Build React thanh cong!')
    else:
        print('[OK] React build da co san (dist/)')

def start_vite_watch():
    """Chay Vite o che do watch -- tu rebuild khi co file thay doi."""
    print('[DEV] Vite watch mode dang khoi dong...')
    print('[DEV] Moi khi luu file, Vite se rebuild (~1-2s). Sau do nhan F5 tren trinh duyet.')
    subprocess.run('npm run build -- --watch', cwd=FRONTEND, shell=True)

if __name__ == '__main__':
    print('=' * 50)
    if DEV_MODE:
        print('  LOVE WEBSITE -- Dev Mode (auto-rebuild)')
    else:
        print('  LOVE WEBSITE -- Production Mode')
    print('=' * 50)

    check_python_deps()

    if DEV_MODE:
        # Buoc 1: Build lan dau neu chua co dist
        dist = os.path.join(ROOT, 'dist', 'index.html')
        if not os.path.exists(dist):
            print('[DEV] Chua co dist/, dang build lan dau...')
            subprocess.run('npm run build', cwd=FRONTEND, shell=True)

        # Buoc 2: Khoi dong Vite watch trong thread nen
        watcher = threading.Thread(target=start_vite_watch, daemon=True)
        watcher.start()
    else:
        check_frontend_build()

    print()
    print('[*] Dang khoi dong Flask server...')
    print('[*] Mo trinh duyet: http://localhost:5000')
    if DEV_MODE:
        print('[*] [DEV] Luu file src/ -> Vite rebuild -> F5 -> thay doi ngay!')
    print('[*] Dashboard:      http://localhost:5000/dashboard')
    print('[*] Nhan Ctrl+C de dung')
    print()

    subprocess.run([sys.executable, 'app.py'], cwd=BACKEND)
