from flask import Flask, jsonify, request
import sqlite3
from flask_cors import CORS
from collections import defaultdict
import datetime

DB_PATH = "roasted.db"

app = Flask(__name__)
CORS(app)  # Allow React frontend to access API

@app.route('/api/reports', methods=['GET'])
def get_reports():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id, report_text, reporter, abusive_author, url, timestamp, flag FROM reports ORDER BY id DESC")
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
                "flag": bool(r[6])
            } for r in reports
        ]
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports/flag/<int:report_id>', methods=['POST'])
def toggle_flag(report_id):
    try:
        conn = sqlite3.connect(DB_PATH)
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
def delete_reports():
    try:
        data = request.get_json()
        ids = data.get('ids', [])
        if not ids:
            return jsonify({"error": "No IDs provided"}), 400
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        # Use placeholders for safety
        c.execute(f"DELETE FROM reports WHERE id IN ({','.join(['?']*len(ids))})", ids)
        conn.commit()
        conn.close()
        return jsonify({"deleted_ids": ids})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/reports/stats', methods=['GET'])
def get_report_stats():
    try:
        conn = sqlite3.connect(DB_PATH)
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

if __name__ == '__main__':
    app.run(port=5002, debug=True)