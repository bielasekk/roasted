# import sqlite3
# from cryptography.fernet import Fernet
# from datetime import datetime, timedelta, timezone
# import os
# from dotenv import load_dotenv
# import random

# load_dotenv()

# # Load Fernet key from environment variable (bytes!)
# FERNET_KEY = os.getenv("FERNET_KEY")
# # if FERNET_KEY is None:
# #     raise ValueError("FERNET_KEY environment variable not set")
# # FERNET_KEY = FERNET_KEY.encode()  # convert string to bytes
# fernet = Fernet(FERNET_KEY)

# def encrypt(value: str) -> str:
#     return fernet.encrypt(value.encode()).decode()

# def insert_dummy_reports():
#     conn = sqlite3.connect('roasted.db')
#     c = conn.cursor()

#     dummy_reports = [
#         {
#             "report_text": "You're such a loser, nobody likes you!",
#             "reporter": "alice123",
#             "abusive_author": "john_doe",
#             "url": "https://socialmedia.com/post/101"
#         },
#         {
#             "report_text": "Go kill yourself, no one wants you here.",
#             "reporter": "carol98",
#             "abusive_author": "troll_mike",
#             "url": "https://socialmedia.com/post/102"
#         },
#         {
#             "report_text": "Everyone hates you, just disappear.",
#             "reporter": "dave77",
#             "abusive_author": "mean_user42",
#             "url": "https://socialmedia.com/post/103"
#         },
#         {
#             "report_text": "You're disgusting and nobody will ever love you.",
#             "reporter": "linda89",
#             "abusive_author": "hater123",
#             "url": "https://socialmedia.com/post/104"
#         },
#         {
#             "report_text": "Stop posting, your posts are pathetic.",
#             "reporter": "sam_w",
#             "abusive_author": "cyberbully99",
#             "url": "https://socialmedia.com/post/105"
#         }, 
#         {
#             "report_text": "You're pathetic, why even try?",
#             "reporter": "user101",
#             "abusive_author": "troll_jake",
#             "url": "https://socialmedia.com/post/106"
#         },
#         {
#             "report_text": "Nobody wants you here, go away!",
#             "reporter": "emma_s",
#             "abusive_author": "mean_guy77",
#             "url": "https://socialmedia.com/post/107"
#         },
#         {
#             "report_text": "Stop talking, you sound like an idiot.",
#             "reporter": "liam23",
#             "abusive_author": "hater_girl42",
#             "url": "https://socialmedia.com/post/108"
#         },
#         {
#             "report_text": "Why do you even exist? You ruin everything.",
#             "reporter": "olivia_m",
#             "abusive_author": "cyberkiller99",
#             "url": "https://socialmedia.com/post/109"
#         },
#         {
#             "report_text": "You're such a loser, literally everyone hates you.",
#             "reporter": "noah89",
#             "abusive_author": "mean_dude88",
#             "url": "https://socialmedia.com/post/110"
#         },
#         {
#             "report_text": "Just disappear, nobody cares about you.",
#             "reporter": "ava_77",
#             "abusive_author": "bully_sam",
#             "url": "https://socialmedia.com/post/111"
#         },
#         {
#             "report_text": "Youre ugly and nobody will ever love you.",
#             "reporter": "mason_k",
#             "abusive_author": "troll_lisa",
#             "url": "https://socialmedia.com/post/112"
#         },
#         {
#             "report_text": "Stop posting stupid stuff, its annoying.",
#             "reporter": "sophia_t",
#             "abusive_author": "meanuser123",
#             "url": "https://socialmedia.com/post/113"
#         },
#         {
#             "report_text": "Your opinion is trash, dont ever speak again.",
#             "reporter": "jack_l",
#             "abusive_author": "cyber_guy42",
#             "url": "https://socialmedia.com/post/114"
#         },
#         {
#             "report_text": "You are worthless and everyone knows it.",
#             "reporter": "mia_r",
#             "abusive_author": "hater_mark",
#             "url": "https://socialmedia.com/post/115"
#         },
#         {
#             "report_text": "Nobody asked for your thoughts, idiot.",
#             "reporter": "ethan_p",
#             "abusive_author": "troll_nina",
#             "url": "https://socialmedia.com/post/116"
#         },
#         {
#             "report_text": "You look disgusting, post less.",
#             "reporter": "isabella_v",
#             "abusive_author": "bully_bob",
#             "url": "https://socialmedia.com/post/117"
#         },
#         {
#             "report_text": "Go away, no one wants your negativity here.",
#             "reporter": "alex_c",
#             "abusive_author": "mean_girl99",
#             "url": "https://socialmedia.com/post/118"
#         },
#         {
#             "report_text": "Stop breathing, just disappear already.",
#             "reporter": "lily_j",
#             "abusive_author": "cyber_stalker",
#             "url": "https://socialmedia.com/post/119"
#         },
#         {
#             "report_text": "Youre a joke and everyone sees it.",
#             "reporter": "logan_m",
#             "abusive_author": "troll_kevin",
#             "url": "https://socialmedia.com/post/120"
#         }
#     ]

#     for report in dummy_reports:
#         # Encrypt all fields
#         enc_text = encrypt(report["report_text"])
#         enc_reporter = encrypt(report["reporter"])
#         enc_author = encrypt(report["abusive_author"])
#         enc_url = encrypt(report["url"])

#         # Random past timestamp within last 30 days (UTC aware)
#         days_ago = random.randint(1, 30)
#         past_timestamp = datetime.now(timezone.utc) - timedelta(days=days_ago)
#         past_timestamp_str = past_timestamp.strftime("%Y-%m-%d %H:%M:%S")

#         c.execute('''
#             INSERT INTO reports (report_text, reporter, abusive_author, url, timestamp)
#             VALUES (?, ?, ?, ?, ?)
#         ''', (enc_text, enc_reporter, enc_author, enc_url, past_timestamp_str))

#     conn.commit()
#     conn.close()
#     print("Dummy reports inserted with past timestamps.")

# if __name__ == "__main__":
#     insert_dummy_reports()


import sqlite3
from cryptography.fernet import Fernet
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
import random

load_dotenv()

# Load Fernet key from environment variable (bytes!)
FERNET_KEY = os.getenv("FERNET_KEY")
fernet = Fernet(FERNET_KEY)

def encrypt(value: str) -> str:
    return fernet.encrypt(value.encode()).decode()

def insert_dummy_reports():
    conn = sqlite3.connect('roasted.db')
    c = conn.cursor()

    # dummy_reports = [
    #     {
    #         "report_text": "You're such a loser, nobody likes you!",
    #         "reporter": "alice123",
    #         "abusive_author": "john_doe",
    #         "url": "https://socialmedia.com/post/201"
    #     },
    #     {
    #         "report_text": "Go kill yourself, no one wants you here.",
    #         "reporter": "carol98",
    #         "abusive_author": "troll_mike",
    #         "url": "https://socialmedia.com/post/202"
    #     },
    #     {
    #         "report_text": "Everyone hates you, just disappear.",
    #         "reporter": "dave77",
    #         "abusive_author": "mean_user42",
    #         "url": "https://socialmedia.com/post/203"
    #     },
    #     {
    #         "report_text": "You're disgusting and nobody will ever love you.",
    #         "reporter": "linda89",
    #         "abusive_author": "hater123",
    #         "url": "https://socialmedia.com/post/204"
    #     },
    #     {
    #         "report_text": "Stop posting, your posts are pathetic.",
    #         "reporter": "sam_w",
    #         "abusive_author": "cyberbully99",
    #         "url": "https://socialmedia.com/post/205"
    #     }, 
    #     {
    #         "report_text": "You're pathetic, why even try?",
    #         "reporter": "user101",
    #         "abusive_author": "troll_jake",
    #         "url": "https://socialmedia.com/post/206"
    #     },
    #     {
    #         "report_text": "Nobody wants you here, go away!",
    #         "reporter": "emma_s",
    #         "abusive_author": "mean_guy77",
    #         "url": "https://socialmedia.com/post/207"
    #     },
    #     {
    #         "report_text": "Stop talking, you sound like an idiot.",
    #         "reporter": "liam23",
    #         "abusive_author": "hater_girl42",
    #         "url": "https://socialmedia.com/post/208"
    #     },
    #     {
    #         "report_text": "Why do you even exist? You ruin everything.",
    #         "reporter": "olivia_m",
    #         "abusive_author": "cyberkiller99",
    #         "url": "https://socialmedia.com/post/209"
    #     },
    #     {
    #         "report_text": "You're such a loser, literally everyone hates you.",
    #         "reporter": "noah89",
    #         "abusive_author": "mean_dude88",
    #         "url": "https://socialmedia.com/post/210"
    #     },
    #     {
    #         "report_text": "Just disappear, nobody cares about you.",
    #         "reporter": "ava_77",
    #         "abusive_author": "bully_sam",
    #         "url": "https://socialmedia.com/post/211"
    #     },
    #     {
    #         "report_text": "You're ugly and nobody will ever love you.",
    #         "reporter": "mason_k",
    #         "abusive_author": "troll_lisa",
    #         "url": "https://socialmedia.com/post/212"
    #     },
    #     {
    #         "report_text": "Stop posting stupid stuff, it's annoying.",
    #         "reporter": "sophia_t",
    #         "abusive_author": "meanuser123",
    #         "url": "https://socialmedia.com/post/213"
    #     },
    #     {
    #         "report_text": "Your opinion is trash, don't ever speak again.",
    #         "reporter": "jack_l",
    #         "abusive_author": "cyber_guy42",
    #         "url": "https://socialmedia.com/post/214"
    #     },
    #     {
    #         "report_text": "You are worthless and everyone knows it.",
    #         "reporter": "mia_r",
    #         "abusive_author": "hater_mark",
    #         "url": "https://socialmedia.com/post/215"
    #     },
    #     {
    #         "report_text": "Nobody asked for your thoughts, idiot.",
    #         "reporter": "ethan_p",
    #         "abusive_author": "troll_nina",
    #         "url": "https://socialmedia.com/post/216"
    #     },
    #     {
    #         "report_text": "You look disgusting, post less.",
    #         "reporter": "isabella_v",
    #         "abusive_author": "bully_bob",
    #         "url": "https://socialmedia.com/post/217"
    #     },
    #     {
    #         "report_text": "Go away, no one wants your negativity here.",
    #         "reporter": "alex_c",
    #         "abusive_author": "mean_girl99",
    #         "url": "https://socialmedia.com/post/218"
    #     },
    #     {
    #         "report_text": "Stop breathing, just disappear already.",
    #         "reporter": "lily_j",
    #         "abusive_author": "cyber_stalker",
    #         "url": "https://socialmedia.com/post/219"
    #     },
    #     {
    #         "report_text": "You're a joke and everyone sees it.",
    #         "reporter": "logan_m",
    #         "abusive_author": "troll_kevin",
    #         "url": "https://socialmedia.com/post/220"
    #     },
    #     {
    #         "report_text": "Nobody wants to hear you, just shut up.",
    #         "reporter": "chris_b",
    #         "abusive_author": "toxic_tom",
    #         "url": "https://socialmedia.com/post/221"
    #     },
    #     {
    #         "report_text": "You make everything worse, stop existing.",
    #         "reporter": "zoe_k",
    #         "abusive_author": "mean_sarah",
    #         "url": "https://socialmedia.com/post/222"
    #     },
    #     {
    #         "report_text": "Your face makes me sick.",
    #         "reporter": "ryan_p",
    #         "abusive_author": "bully_john",
    #         "url": "https://socialmedia.com/post/223"
    #     },
    #     {
    #         "report_text": "Nobody likes your posts, quit already.",
    #         "reporter": "nina_q",
    #         "abusive_author": "hater_clark",
    #         "url": "https://socialmedia.com/post/224"
    #     },
    #     {
    #         "report_text": "You're the worst, go hide.",
    #         "reporter": "tyler_r",
    #         "abusive_author": "troll_lucas",
    #         "url": "https://socialmedia.com/post/225"
    #     },
    #     {
    #         "report_text": "Everything you say is garbage.",
    #         "reporter": "hannah_w",
    #         "abusive_author": "cyber_amy",
    #         "url": "https://socialmedia.com/post/226"
    #     },
    #     {
    #         "report_text": "Nobody would miss you if you vanished.",
    #         "reporter": "owen_s",
    #         "abusive_author": "mean_vince",
    #         "url": "https://socialmedia.com/post/227"
    #     },
    #     {
    #         "report_text": "You're irrelevant, nobody cares.",
    #         "reporter": "ella_m",
    #         "abusive_author": "hater_jane",
    #         "url": "https://socialmedia.com/post/228"
    #     },
    #     {
    #         "report_text": "Your life is pointless.",
    #         "reporter": "daniel_h",
    #         "abusive_author": "toxic_ben",
    #         "url": "https://socialmedia.com/post/229"
    #     },
    #     {
    #         "report_text": "Go away, no one wants you around.",
    #         "reporter": "chloe_k",
    #         "abusive_author": "troll_rachel",
    #         "url": "https://socialmedia.com/post/230"
    #     },
    #     {
    #         "report_text": "You're such a waste of space.",
    #         "reporter": "matthew_j",
    #         "abusive_author": "mean_andrew",
    #         "url": "https://socialmedia.com/post/231"
    #     },
    #     {
    #         "report_text": "Nobody will ever respect you.",
    #         "reporter": "scarlett_f",
    #         "abusive_author": "cyber_dan",
    #         "url": "https://socialmedia.com/post/232"
    #     },
    #     {
    #         "report_text": "Your existence is a mistake.",
    #         "reporter": "grace_t",
    #         "abusive_author": "hater_emily",
    #         "url": "https://socialmedia.com/post/233"
    #     },
    #     {
    #         "report_text": "Stop pretending anyone cares about you.",
    #         "reporter": "james_v",
    #         "abusive_author": "troll_steve",
    #         "url": "https://socialmedia.com/post/234"
    #     },
    #     {
    #         "report_text": "You bring nothing but negativity.",
    #         "reporter": "zoey_r",
    #         "abusive_author": "mean_paul",
    #         "url": "https://socialmedia.com/post/235"
    #     },
    #     {
    #         "report_text": "Nobody values your opinion.",
    #         "reporter": "harry_d",
    #         "abusive_author": "bully_tina",
    #         "url": "https://socialmedia.com/post/236"
    #     },
    #     {
    #         "report_text": "You’re the definition of pathetic.",
    #         "reporter": "ivy_w",
    #         "abusive_author": "cyber_rick",
    #         "url": "https://socialmedia.com/post/237"
    #     },
    #     {
    #         "report_text": "Go cry somewhere else, loser.",
    #         "reporter": "jackson_m",
    #         "abusive_author": "hater_sammy",
    #         "url": "https://socialmedia.com/post/238"
    #     },
    #     {
    #         "report_text": "Nobody wants your garbage posts.",
    #         "reporter": "amelia_b",
    #         "abusive_author": "troll_jenny",
    #         "url": "https://socialmedia.com/post/239"
    #     },
    #     {
    #         "report_text": "Stop embarrassing yourself online.",
    #         "reporter": "lucas_f",
    #         "abusive_author": "mean_rob",
    #         "url": "https://socialmedia.com/post/240"
    #     }
    # ]
    dummy_reports = [
        {
            "report_text": "Nobody likes you, stop wasting everyone's time.",
            "reporter": "amy_k",
            "abusive_author": "toxic_ben",
            "url": "https://socialmedia.com/post/301"
        },
        {
            "report_text": "You’re a total embarrassment.",
            "reporter": "daniel_m",
            "abusive_author": "hater_lucy",
            "url": "https://socialmedia.com/post/302"
        },
        {
            "report_text": "Why do you even post? Nobody cares.",
            "reporter": "claire_h",
            "abusive_author": "troll_matt",
            "url": "https://socialmedia.com/post/303"
        },
        {
            "report_text": "Everything you say is pointless.",
            "reporter": "ryan_b",
            "abusive_author": "mean_jess",
            "url": "https://socialmedia.com/post/304"
        },
        {
            "report_text": "Your posts make everyone dumber.",
            "reporter": "sophia_l",
            "abusive_author": "cyber_dan",
            "url": "https://socialmedia.com/post/305"
        },
        {
            "report_text": "You’re the reason people hate this platform.",
            "reporter": "michael_t",
            "abusive_author": "bully_karen",
            "url": "https://socialmedia.com/post/306"
        },
        {
            "report_text": "Just delete your account already.",
            "reporter": "ella_g",
            "abusive_author": "troll_sam",
            "url": "https://socialmedia.com/post/307"
        },
        {
            "report_text": "Nobody wants your negativity here.",
            "reporter": "jack_c",
            "abusive_author": "mean_alex",
            "url": "https://socialmedia.com/post/308"
        },
        {
            "report_text": "You should be banned permanently.",
            "reporter": "olivia_f",
            "abusive_author": "cyber_rob",
            "url": "https://socialmedia.com/post/309"
        },
        {
            "report_text": "Nobody would notice if you disappeared.",
            "reporter": "ethan_r",
            "abusive_author": "hater_tina",
            "url": "https://socialmedia.com/post/310"
        },
        {
            "report_text": "Your presence makes this place worse.",
            "reporter": "mia_w",
            "abusive_author": "toxic_nick",
            "url": "https://socialmedia.com/post/311"
        },
        {
            "report_text": "Quit pretending you’re important.",
            "reporter": "alex_s",
            "abusive_author": "troll_emma",
            "url": "https://socialmedia.com/post/312"
        },
        {
            "report_text": "Nobody respects you, just leave.",
            "reporter": "ava_d",
            "abusive_author": "mean_luke",
            "url": "https://socialmedia.com/post/313"
        },
        {
            "report_text": "You’re the biggest clown on this site.",
            "reporter": "ben_j",
            "abusive_author": "hater_clara",
            "url": "https://socialmedia.com/post/314"
        },
        {
            "report_text": "Nobody ever asked for your input.",
            "reporter": "zoe_p",
            "abusive_author": "cyber_mike",
            "url": "https://socialmedia.com/post/315"
        },
        {
            "report_text": "You ruin every conversation.",
            "reporter": "lucas_k",
            "abusive_author": "bully_anna",
            "url": "https://socialmedia.com/post/316"
        },
        {
            "report_text": "Why do you think anyone cares?",
            "reporter": "isabella_n",
            "abusive_author": "troll_george",
            "url": "https://socialmedia.com/post/317"
        },
        {
            "report_text": "Just stop talking already.",
            "reporter": "nathan_y",
            "abusive_author": "mean_rachel",
            "url": "https://socialmedia.com/post/318"
        },
        {
            "report_text": "Nobody is on your side.",
            "reporter": "harper_q",
            "abusive_author": "hater_josh",
            "url": "https://socialmedia.com/post/319"
        },
        {
            "report_text": "You add nothing but drama.",
            "reporter": "mason_u",
            "abusive_author": "cyber_victor",
            "url": "https://socialmedia.com/post/320"
        },
        {
            "report_text": "Stop posting, it’s pathetic.",
            "reporter": "grace_h",
            "abusive_author": "toxic_ella",
            "url": "https://socialmedia.com/post/321"
        },
        {
            "report_text": "You’re irrelevant and everyone knows it.",
            "reporter": "logan_v",
            "abusive_author": "mean_ryan",
            "url": "https://socialmedia.com/post/322"
        },
        {
            "report_text": "Nobody even likes your face.",
            "reporter": "sienna_o",
            "abusive_author": "hater_bob",
            "url": "https://socialmedia.com/post/323"
        },
        {
            "report_text": "Your opinions are worthless.",
            "reporter": "jacob_f",
            "abusive_author": "troll_tina",
            "url": "https://socialmedia.com/post/324"
        },
        {
            "report_text": "This platform would be better without you.",
            "reporter": "aria_z",
            "abusive_author": "cyber_dave",
            "url": "https://socialmedia.com/post/325"
        },
        {
            "report_text": "You’re just noise, nothing else.",
            "reporter": "charlie_x",
            "abusive_author": "bully_sue",
            "url": "https://socialmedia.com/post/326"
        },
        {
            "report_text": "Stop pretending you matter.",
            "reporter": "madison_l",
            "abusive_author": "mean_kyle",
            "url": "https://socialmedia.com/post/327"
        },
        {
            "report_text": "Nobody is listening to you.",
            "reporter": "leo_p",
            "abusive_author": "troll_iris",
            "url": "https://socialmedia.com/post/328"
        },
        {
            "report_text": "You’re a complete waste of time.",
            "reporter": "ella_t",
            "abusive_author": "hater_chris",
            "url": "https://socialmedia.com/post/329"
        },
        {
            "report_text": "Nobody wants your trash content.",
            "reporter": "noah_w",
            "abusive_author": "cyber_lily",
            "url": "https://socialmedia.com/post/330"
        }
    ]


    for report in dummy_reports:
        # Encrypt all fields
        enc_text = encrypt(report["report_text"])
        enc_reporter = encrypt(report["reporter"])
        enc_author = encrypt(report["abusive_author"])
        enc_url = encrypt(report["url"])

        # Random past timestamp within last 7 days (UTC aware)
        # minutes_ago = random.randint(1, 7 * 24 * 60)
        # Random past timestamp within last 30 days (UTC aware)
        minutes_ago = random.randint(1, 30 * 24 * 60)
        past_timestamp = datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)
        past_timestamp_str = past_timestamp.strftime("%Y-%m-%d %H:%M:%S")

        c.execute('''
            INSERT INTO reports (report_text, reporter, abusive_author, url, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (enc_text, enc_reporter, enc_author, enc_url, past_timestamp_str))

    conn.commit()
    conn.close()
    print("Dummy reports inserted with past 7-day timestamps.")

if __name__ == "__main__":
    insert_dummy_reports()