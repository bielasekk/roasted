import sqlite3
from cryptography.fernet import Fernet
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
import random

load_dotenv()

# Load Fernet key from environment variable (bytes!)
FERNET_KEY = os.getenv("FERNET_KEY")
# if FERNET_KEY is None:
#     raise ValueError("FERNET_KEY environment variable not set")
# FERNET_KEY = FERNET_KEY.encode()  # convert string to bytes
fernet = Fernet(FERNET_KEY)

def encrypt(value: str) -> str:
    return fernet.encrypt(value.encode()).decode()

def insert_dummy_reports():
    conn = sqlite3.connect('roasted.db')
    c = conn.cursor()

    dummy_reports = [
        {
            "report_text": "You're such a loser, nobody likes you!",
            "reporter": "alice123",
            "abusive_author": "john_doe",
            "url": "https://socialmedia.com/post/101"
        },
        {
            "report_text": "Go kill yourself, no one wants you here.",
            "reporter": "carol98",
            "abusive_author": "troll_mike",
            "url": "https://socialmedia.com/post/102"
        },
        {
            "report_text": "Everyone hates you, just disappear.",
            "reporter": "dave77",
            "abusive_author": "mean_user42",
            "url": "https://socialmedia.com/post/103"
        },
        {
            "report_text": "You're disgusting and nobody will ever love you.",
            "reporter": "linda89",
            "abusive_author": "hater123",
            "url": "https://socialmedia.com/post/104"
        },
        {
            "report_text": "Stop posting, your posts are pathetic.",
            "reporter": "sam_w",
            "abusive_author": "cyberbully99",
            "url": "https://socialmedia.com/post/105"
        }, 
        {
            "report_text": "You're pathetic, why even try?",
            "reporter": "user101",
            "abusive_author": "troll_jake",
            "url": "https://socialmedia.com/post/106"
        },
        {
            "report_text": "Nobody wants you here, go away!",
            "reporter": "emma_s",
            "abusive_author": "mean_guy77",
            "url": "https://socialmedia.com/post/107"
        },
        {
            "report_text": "Stop talking, you sound like an idiot.",
            "reporter": "liam23",
            "abusive_author": "hater_girl42",
            "url": "https://socialmedia.com/post/108"
        },
        {
            "report_text": "Why do you even exist? You ruin everything.",
            "reporter": "olivia_m",
            "abusive_author": "cyberkiller99",
            "url": "https://socialmedia.com/post/109"
        },
        {
            "report_text": "You're such a loser, literally everyone hates you.",
            "reporter": "noah89",
            "abusive_author": "mean_dude88",
            "url": "https://socialmedia.com/post/110"
        },
        {
            "report_text": "Just disappear, nobody cares about you.",
            "reporter": "ava_77",
            "abusive_author": "bully_sam",
            "url": "https://socialmedia.com/post/111"
        },
        {
            "report_text": "Youre ugly and nobody will ever love you.",
            "reporter": "mason_k",
            "abusive_author": "troll_lisa",
            "url": "https://socialmedia.com/post/112"
        },
        {
            "report_text": "Stop posting stupid stuff, its annoying.",
            "reporter": "sophia_t",
            "abusive_author": "meanuser123",
            "url": "https://socialmedia.com/post/113"
        },
        {
            "report_text": "Your opinion is trash, dont ever speak again.",
            "reporter": "jack_l",
            "abusive_author": "cyber_guy42",
            "url": "https://socialmedia.com/post/114"
        },
        {
            "report_text": "You are worthless and everyone knows it.",
            "reporter": "mia_r",
            "abusive_author": "hater_mark",
            "url": "https://socialmedia.com/post/115"
        },
        {
            "report_text": "Nobody asked for your thoughts, idiot.",
            "reporter": "ethan_p",
            "abusive_author": "troll_nina",
            "url": "https://socialmedia.com/post/116"
        },
        {
            "report_text": "You look disgusting, post less.",
            "reporter": "isabella_v",
            "abusive_author": "bully_bob",
            "url": "https://socialmedia.com/post/117"
        },
        {
            "report_text": "Go away, no one wants your negativity here.",
            "reporter": "alex_c",
            "abusive_author": "mean_girl99",
            "url": "https://socialmedia.com/post/118"
        },
        {
            "report_text": "Stop breathing, just disappear already.",
            "reporter": "lily_j",
            "abusive_author": "cyber_stalker",
            "url": "https://socialmedia.com/post/119"
        },
        {
            "report_text": "Youre a joke and everyone sees it.",
            "reporter": "logan_m",
            "abusive_author": "troll_kevin",
            "url": "https://socialmedia.com/post/120"
        }
    ]

    for report in dummy_reports:
        # Encrypt all fields
        enc_text = encrypt(report["report_text"])
        enc_reporter = encrypt(report["reporter"])
        enc_author = encrypt(report["abusive_author"])
        enc_url = encrypt(report["url"])

        # Random past timestamp within last 30 days (UTC aware)
        days_ago = random.randint(1, 30)
        past_timestamp = datetime.now(timezone.utc) - timedelta(days=days_ago)
        past_timestamp_str = past_timestamp.strftime("%Y-%m-%d %H:%M:%S")

        c.execute('''
            INSERT INTO reports (report_text, reporter, abusive_author, url, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (enc_text, enc_reporter, enc_author, enc_url, past_timestamp_str))

    conn.commit()
    conn.close()
    print("Dummy reports inserted with past timestamps.")

if __name__ == "__main__":
    insert_dummy_reports()
