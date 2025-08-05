from flask import Flask, render_template_string
import sqlite3

DB_PATH = "roasted.db"  # Update if your DB path is different

app = Flask(__name__)

@app.route('/')
def admin_dashboard():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id, report_text, reporter, abusive_author, url, timestamp FROM reports ORDER BY id DESC")
        reports = c.fetchall()
        conn.close()

        html = '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Admin Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; background: white; }
                th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
                th { background-color: #f2f2f2; }
                tr:hover { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1> Abuse Reports Dashboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Text</th>
                        <th>Reporter</th>
                        <th>Abusive Author</th>
                        <th>URL</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {% for report in reports %}
                    <tr>
                        <td>{{ report[0] }}</td>
                        <td>{{ report[1] }}</td>
                        <td>{{ report[2] }}</td>
                        <td>{{ report[3] }}</td>
                        <td><a href="{{ report[4] }}" target="_blank">{{ report[4] }}</a></td>
                        <td>{{ report[5] or '—' }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </body>
        </html>
        '''
        return render_template_string(html, reports=reports)

    except Exception as e:
        return f"<h2>Error: {str(e)}</h2>", 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)