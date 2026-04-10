"""
Trigger ISR revalidation on the Next.js app after a data sync.

Usage:
    python tools/trigger_revalidation.py --tag universities
    python tools/trigger_revalidation.py --tag scholarships
"""

import os
import argparse
import httpx
from dotenv import load_dotenv

load_dotenv()


def trigger(tag: str):
    app_url = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    secret = os.environ.get("WAT_WEBHOOK_SECRET")

    if not secret:
        print("⚠ WAT_WEBHOOK_SECRET not set — skipping revalidation")
        return

    url = f"{app_url}/api/webhooks/wat"
    headers = {"x-wat-secret": secret, "Content-Type": "application/json"}
    payload = {"tag": tag, "action": "revalidate"}

    try:
        resp = httpx.post(url, json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            print(f"✓ Revalidated tag '{tag}' → {resp.json()}")
        else:
            print(f"✗ Revalidation failed: HTTP {resp.status_code} — {resp.text}")
    except Exception as e:
        print(f"✗ Revalidation request failed: {e}")
        print("  (This is non-fatal — data is synced, pages will revalidate on next request)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--tag", required=True, choices=["universities", "scholarships", "programs"])
    args = parser.parse_args()
    trigger(args.tag)
