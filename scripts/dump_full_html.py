#!/usr/bin/env python3
"""
Lungent — Full HTML Dumper
Navigates to the CloudCamp submission form via Playwright, allows the user
to log in and inspect the tabs, and dumps the complete raw HTML DOM snapshot
to full_form.html for static parsing.
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright

DEFAULT_SUBMISSION_URL = "https://cloudcampbd.com/submissions/8dee8cdb-0cda-49c6-8c84-4429d2cc0177"
SESSION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_session")
OUTPUT_HTML_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "full_form.html")

def dump_html(url=DEFAULT_SUBMISSION_URL):
    print("\n========================================================")
    print("  Lungent Full HTML Dumper (Playwright)")
    print("========================================================")
    print(f"Target URL:  {url}")
    print(f"Output File: {OUTPUT_HTML_FILE}\n")

    os.makedirs(SESSION_DIR, exist_ok=True)

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=SESSION_DIR,
            headless=False,
            viewport={"width": 1440, "height": 950},
            args=["--disable-blink-features=AutomationControlled"]
        )

        page = context.pages[0] if context.pages else context.new_page()

        print(f"[*] Navigating to {url}...")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
        except Exception as e:
            print(f"[!] Note on initial navigation: {e}")

        print("\n--------------------------------------------------------")
        print("ACTION REQUIRED IN BROWSER:")
        print("1. If prompted to Sign In, complete your login now.")
        print("2. Ensure the submission form is visible on screen.")
        print("3. (Tip) Click through any tabs ('AI-Native Build', 'Data Lifecycle',")
        print("   'Prompt Library', 'Build Provenance', etc.) so their sections load.")
        print("--------------------------------------------------------")
        input(">> When you are ready to dump the HTML, press ENTER in this terminal: ")

        print("\n[*] Waiting 3 seconds for dynamic content to finish rendering...")
        page.wait_for_timeout(3000)

        # Attempt to expand any closed accordions before capturing
        try:
            accordions = page.locator('button[data-state="closed"], [aria-expanded="false"], summary')
            count = accordions.count()
            if count > 0:
                print(f"[*] Expanding {count} collapsed accordion sections...")
                for i in range(min(count, 20)):
                    try:
                        accordions.nth(i).click(force=True)
                        page.wait_for_timeout(150)
                    except Exception:
                        pass
                page.wait_for_timeout(1000)
        except Exception:
            pass

        print("[*] Capturing complete page HTML snapshot...")
        html_content = page.content()

        with open(OUTPUT_HTML_FILE, "w", encoding="utf-8") as f:
            f.write(html_content)

        file_size_kb = len(html_content.encode("utf-8")) / 1024
        print(f"\n[✓] SUCCESS! Saved full raw HTML snapshot to:")
        print(f"    {OUTPUT_HTML_FILE} ({file_size_kb:.1f} KB)\n")

        context.close()

if __name__ == "__main__":
    url_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SUBMISSION_URL
    dump_html(url_arg)
