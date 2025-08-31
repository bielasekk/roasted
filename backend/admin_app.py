from flask import Flask, jsonify, request, session
import sqlite3
from flask_cors import CORS
from collections import defaultdict
import datetime
import bcrypt
import os
from dotenv import load_dotenv
from cryptography.fernet import Fernet

load_dotenv()

# DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "roasted.db")
DB_PATH = "/roasted.db"

# Initialize Fernet for encryption/decryption
FERNET_KEY = os.getenv("FERNET_KEY")
cipher = Fernet(FERNET_KEY)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY")
CORS(app, supports_credentials=True, origins=[
    "http://localhost:3001", 
    "http://admin-frontend:3000",  # For Docker internal networking
    "http://localhost:3000"
])  # Allow React frontend to access API


# Function to get a database connection
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Function to decrypt a value
def decrypt(value: str) -> str:
    return cipher.decrypt(value.encode()).decode()

@app.route('/api/reports', methods=['GET'])
# Endpoint to get all reports
def get_reports():
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Debug: Check if table exists and has data
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reports'")
        table_exists = c.fetchone()
        print(f"Reports table exists: {table_exists is not None}")
        
        c.execute("SELECT COUNT(*) FROM reports")
        count = c.fetchone()[0]
        print(f"Total reports in database: {count}")
        
        c.execute("SELECT id, report_text, reporter, abusive_author, url, timestamp, flag FROM reports ORDER BY id DESC")
        reports = c.fetchall()
        conn.close()

        print(f"Fetched {len(reports)} reports from query")
        
        results = [
            {
                "id": r[0],
                "text": decrypt(r[1]),
                "reporter": decrypt(r[2]),
                "abusive_author": decrypt(r[3]),
                "url": decrypt(r[4]),
                "timestamp": r[5],
                "flag": bool(r[6])
            } for r in reports
        ]
        return jsonify(results)
    except Exception as e:
        print(f"Error in get_reports: {str(e)}")  # Debug
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports/flag/<int:report_id>', methods=['POST'])
# Endpoint to toggle the flag status of a report
def toggle_flag(report_id):
    try:
        conn = get_db_connection()
        c = conn.cursor()
        # Get current flag value
        c.execute("SELECT flag FROM reports WHERE id = ?", (report_id,))
        current_flag = c.fetchone()
        if current_flag is None:
            return jsonify({"error": "Report not found"}), 404
        new_flag = 0 if current_flag[0] else 1
        # Update flag
        c.execute("UPDATE reports SET flag = ? WHERE id = ?", (new_flag, report_id))
        conn.commit()
        conn.close()
        return jsonify({"id": report_id, "flag": bool(new_flag)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports', methods=['DELETE'])
# Endpoint to delete reports by IDs
def delete_reports():
    try:
        data = request.get_json()
        ids = data.get('ids', [])
        if not ids:
            return jsonify({"error": "No IDs provided"}), 400
        conn = get_db_connection()
        c = conn.cursor()
        # Use placeholders for safety
        c.execute(f"DELETE FROM reports WHERE id IN ({','.join(['?']*len(ids))})", ids)
        conn.commit()
        conn.close()
        return jsonify({"deleted_ids": ids})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/reports/stats', methods=['GET'])
# Endpoint to get report statistics for the last 7 days
def get_report_stats():
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Get current date (no time)
        today = datetime.date.today()

        # Create list of last 7 dates (including today)
        last_7_days = [(today - datetime.timedelta(days=i)) for i in reversed(range(7))]
        last_7_days_str = [d.isoformat() for d in last_7_days]

        # Fetch timestamps from reports
        c.execute("SELECT timestamp FROM reports")
        timestamps = c.fetchall()
        conn.close()

        # Count reports per day for last 7 days
        counts = defaultdict(int)

        for (ts,) in timestamps:
            # Parse timestamp to datetime.date (adjust if your timestamps include time)
            dt = datetime.datetime.fromisoformat(ts).date()
            if dt in last_7_days:
                counts[dt.isoformat()] += 1

        # Ensure all days are represented, zero if no reports
        counts_list = [counts.get(day, 0) for day in last_7_days_str]

        return jsonify({
            "days": last_7_days_str,
            "counts": counts_list
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/login', methods=['POST'])
# Endpoint for user login
def login():
    try:
        data = request.get_json()
        print(f"Login attempt with data: {data}")  # Debug
        username = data.get('username')
        password = data.get('password')

        conn = get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        conn.close()

        print(f"User found: {user is not None}")  # Debug

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            session['user'] = username  # store user in session
            print("Login successful")
            return jsonify(success=True)
        else:
            print("Login failed - invalid credentials")  # Debug
            return jsonify(success=False, message="Invalid credentials"), 401
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug
        return jsonify(success=False, message="Server error"), 500

@app.route('/api/logout', methods=['POST'])
# Endpoint for user logout
def logout():
    session.pop('user', None)
    return jsonify(success=True)

@app.route('/api/check-session', methods=['GET'])
# Endpoint to check if user is logged in
def check_session():
    return jsonify(logged_in=('user' in session), user=session.get('user'))

@app.route('/api/change-password', methods=['POST'])
# Endpoint to change user password
def change_password():
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (session['user'],)).fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    # Check old password
    if not bcrypt.checkpw(old_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        conn.close()
        return jsonify({"error": "Old password incorrect"}), 400

    # Hash and save new password
    new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    conn.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_hash, session['user']))
    conn.commit()
    conn.close()

    return jsonify({"message": "Password updated successfully"})

@app.route('/api/change-email', methods=['POST'])
# Endpoint to change user email
def change_email():
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    old_email = data.get('oldEmail')
    new_email = data.get('newEmail')

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (session['user'],)).fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    # Verify old email matches current session user
    if user['username'] != old_email:
        conn.close()
        return jsonify({"error": "Old email does not match"}), 400

    # Update email (username column)
    conn.execute("UPDATE users SET username = ? WHERE username = ?", (new_email, old_email))
    conn.commit()
    conn.close()

    # Update session to keep user logged in
    session['user'] = new_email

    return jsonify({"message": "Email updated successfully"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)

# import logging
# logging.basicConfig(level=logging.DEBUG)

# @app.errorhandler(Exception)
# def handle_exception(e):
#     app.logger.exception("Unhandled Exception:")
#     return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     import argparse
#     parser = argparse.ArgumentParser()
#     parser.add_argument('--port', default=5002, type=int)
#     args = parser.parse_args()
    
#     app.run(host='0.0.0.0', port=args.port, debug=True)