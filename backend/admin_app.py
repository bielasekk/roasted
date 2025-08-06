from flask import Flask, jsonify
import sqlite3
from flask_cors import CORS

DB_PATH = "roasted.db"

app = Flask(__name__)
CORS(app)  # Allow React frontend to access API

@app.route('/api/reports', methods=['GET'])
def get_reports():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id, report_text, reporter, abusive_author, url, timestamp FROM reports ORDER BY id DESC")
        reports = c.fetchall()
        conn.close()

        results = [
            {
                "id": r[0],
                "text": r[1],
                "reporter": r[2],
                "abusive_author": r[3],
                "url": r[4],
                "timestamp": r[5],
            } for r in reports
        ]
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)