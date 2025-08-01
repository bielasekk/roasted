from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

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

@app.route('/product', methods=['POST'])  # Add this endpoint
def product():
    """Endpoint that matches your extension's request"""
    return predict()

@app.route('/predict', methods=['POST', 'OPTIONS'])
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
        return jsonify({
            "label": prediction[0],
            "probabilities": prediction[1]
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 