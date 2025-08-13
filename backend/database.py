import sqlite3
from datetime import datetime, timezone
import bcrypt 

def init_db():
    conn = sqlite3.connect('roasted.db')
    c = conn.cursor()
    
    # Reports table
    c.execute('''CREATE TABLE IF NOT EXISTS reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    report_text TEXT NOT NULL,
                    reporter TEXT,
                    abusive_author TEXT,
                    url TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    flag BOOLEAN DEFAULT 0
                )''')

    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )''')
    c.execute("SELECT * FROM users WHERE username = ?", ('admin@roasted.com',))
    if c.fetchone() is None:
        # Hash password
        password = '1234567'
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        # Insert admin user
        c.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            ('admin@roasted.com', password_hash.decode('utf-8'))
        )
        print("Admin user created.")
    else:
        print("Admin user already exists.")

    conn.commit()
    conn.close()