import requests
from datetime import datetime
import socket
import uuid
import time
time.sleep(120)  # Delay selama 60 detik (1 menit)


# Supabase config
SUPABASE_URL = "https://xphawlmihpxcyhnoqyti.supabase.co"
SUPABASE_KEY = "Supabase Key Disensor"

TABLE = "PCUsage"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

idAset = socket.gethostname()
now = datetime.now()
tanggal = now.date().isoformat()

def get_last_log():
    url = (f"{SUPABASE_URL}/rest/v1/{TABLE}"
           f"?idAset=eq.{idAset}&tanggal=eq.{tanggal}"
           f"&order=lastUpdate.desc&limit=1")
    r = requests.get(url, headers=headers)
    if r.status_code == 200 and len(r.json()) > 0:
        return r.json()[0]
    return None

last_log = get_last_log()

if last_log:
    last_update = datetime.fromisoformat(last_log["lastUpdate"])
    diff_minutes = (now - last_update).total_seconds() / 60

    if diff_minutes <= 60:
        # Masih sesi aktif, update durasi
        durasi_baru = last_log["durasiPakai"] + 0.5
        update_url = f"{SUPABASE_URL}/rest/v1/{TABLE}?idLog=eq.{last_log['idLog']}"
        update_data = {
            "durasiPakai": durasi_baru,
            "lastUpdate": now.isoformat()
        }
        response = requests.patch(update_url, headers=headers, json=update_data)
        print(f"[UPDATE SESSION] {tanggal} {now.strftime('%H:%M:%S')} → durasi: {durasi_baru} jam")
    else:
        # Sudah idle > 1 jam, buat log baru
        data = {
            "idLog": str(uuid.uuid4()),
            "idAset": idAset,
            "tanggal": tanggal,
            "durasiPakai": 0.0,
            "jamAwal": now.isoformat(),
            "lastUpdate": now.isoformat()
        }
        response = requests.post(f"{SUPABASE_URL}/rest/v1/{TABLE}", headers=headers, json=data)
        print(f"[INSERT NEW SESSION] {tanggal} {now.strftime('%H:%M:%S')} → durasi: 0.0 jam")
else:
    # Belum ada log hari ini, buat log baru
    data = {
        "idLog": str(uuid.uuid4()),
        "idAset": idAset,
        "tanggal": tanggal,
        "durasiPakai": 0.0,
        "jamAwal": now.isoformat(),
        "lastUpdate": now.isoformat()
    }
    response = requests.post(f"{SUPABASE_URL}/rest/v1/{TABLE}", headers=headers, json=data)
    print(f"[INSERT FIRST LOG] {tanggal} {now.strftime('%H:%M:%S')} → durasi: 0.0 jam")

print("Status:", response.status_code)
print("Response:", response.text)
