from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import re
from dotenv import load_dotenv
import sqlite3
import tweepy

load_dotenv()

app = Flask(__name__)
DB_PATH = 'roasted.db'

# Configure CORS - allow all for development
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

API_KEY = os.getenv("IBM_API_KEY")
if not API_KEY:
    raise ValueError("IBM_API_KEY environment variable not set")

# Load from .env
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")

# OAuth1 authentication (user context)
auth = tweepy.OAuth1UserHandler(
    TWITTER_API_KEY, TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
)
twitter_client = tweepy.API(auth)

def get_access_token():
    """Get IBM Cloud access token"""
    try:
        response = requests.post(
            'https://iam.cloud.ibm.com/identity/token',
            data={
                "apikey": API_KEY,
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey"
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            }
        )
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        print(f"Token error: {str(e)}")
        raise

# The /product endpoint is provided for compatibility with a specific extension's request format.
@app.route('/product', methods=['POST'])
def product():
    """Endpoint that matches your extension's request"""
    return predict()

@app.route('/predict', methods=['POST', 'OPTIONS'])
# Endpoint to predict cyberbullying
def predict():
    if request.method == 'OPTIONS':
        return jsonify({"status": "preflight"}), 200

    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text']
        print(f"Analyzing: {text[:100]}...")

        # Get IBM prediction
        token = get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "input_data": [{
                "fields": ["tweet_text"],
                "values": [[text]]
            }]
        }

        response = requests.post(
            "https://eu-gb.ml.cloud.ibm.com/ml/v4/deployments/36d72ea0-697b-4b37-9bd5-0a0d0a0be988/predictions?version=2021-05-01",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        
        result = response.json()
        prediction = result['predictions'][0]['values'][0]
        label = prediction[0]
        probabilities = prediction[1]
        labels = ['age', 'ethnicity', 'gender', 'not_cyberbullying', 'other_cyberbullying', 'religion']

        # Pronoun boost (if cyberbullying label and contains pronouns)
        pronouns = ['you', 'he', 'she', 'they']
        lower_text = text.lower()
        pronoun_pattern = r'\b(?:' + '|'.join(map(re.escape, pronouns)) + r')\b'
        contains_target = re.search(pronoun_pattern, lower_text) is not None

        cyberbullying_labels = [lbl for lbl in labels if lbl != 'not_cyberbullying']
        if label in cyberbullying_labels and contains_target:
            idx = labels.index(label)
            probabilities[idx] *= 1.1  # Boost by 10%
            total = sum(probabilities)
            probabilities = [round(p / total, 6) for p in probabilities]  # Normalize

        # Step 2: Reduce overuse of 'other_cyberbullying' if low confidence
        if label == 'other_cyberbullying':
            other_idx = labels.index('other_cyberbullying')
            if probabilities[other_idx] < 0.6:  # Threshold for low confidence
                # Find second-highest probability label
                # Select the second-highest probability label if 'other_cyberbullying' is predicted with low confidence
                second_idx = sorted(
                    range(len(probabilities)), 
                    key=lambda i: probabilities[i], 
                    reverse=True
                )[1]
                label = labels[second_idx]

        return jsonify({
            "label": label,
            "probabilities": probabilities
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

# filepath: /Users/olabielas/Desktop/roasted/app.py
@app.route('/report', methods=['POST'])
# Endpoint to store a report
def report():
    try:
        data = request.get_json()
        report_text = data.get('reportTextValue')
        reporter = data.get('reporter') or 'Anonymous'
        abusive_author = data.get('abusiveAuthor') or 'Unknown'
        url = data.get('url') or 'Unknown'

        if not report_text:
            return jsonify({'error': 'Missing report text'}), 400

        print("Inserting report with values:")
        print(f"Text: {report_text}, Reporter: {reporter}, Author: {abusive_author}, URL: {url}")
        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('''
                INSERT INTO reports (report_text, reporter, abusive_author, url)
                VALUES (?, ?, ?, ?)
            ''', (report_text, reporter, abusive_author, url))
            conn.commit()
        except sqlite3.Error as e:
            print(f"Database error: {str(e)}")
            return jsonify({"error": "Database error"}), 500
        finally:
            conn.close()


        return jsonify({"message": "Report stored successfully"}), 200

    except Exception as e:
        print(f"Report error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/tweet', methods=['POST'])
# Endpoint to post a tweet after checking for cyberbullying
def tweet():
    data = request.get_json()
    text = data.get('text')
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Step 1: Check for cyberbullying
    from requests import post
    prediction_resp = post("http://localhost:5001/predict", json={"text": text})
    result = prediction_resp.json()
    label = result.get("label")

    if label != "not_cyberbullying":
        return jsonify({"status": "blocked", "label": label}), 200

    # Step 2: Post tweet if safe
    try:
        tweet_resp = twitter_client.update_status(text)
        return jsonify({"status": "posted", "tweet_id": tweet_resp.id_str}), 200
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500
    
if __name__ == '__main__':
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")
    app.run(host='0.0.0.0', port=5001, debug=debug_mode)