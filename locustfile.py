from locust import HttpUser, task, between
import json

class PredictUser(HttpUser):
    wait_time = between(1, 3)  # Wait between 1 and 3 seconds between tasks

    @task(1)
    def predict_cyberbullying(self):
        # Sample payloads of different types
        payloads = [
            {"text": "You are so stupid and worthless."},
            {"text": "I really enjoyed the meeting today, thanks everyone!"},
            {"text": "Why would anyone listen to someone like you?"}
        ]

        for payload in payloads:
            headers = {'Content-Type': 'application/json'}
            self.client.post("/predict", data=json.dumps(payload), headers=headers)
