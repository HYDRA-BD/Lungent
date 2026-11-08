#!/usr/bin/env python3
"""
Lungent — Automated Form Autofiller
Reads auto_fill_data.json and uses Playwright to populate the form fields
accurately while respecting React/Next.js dynamic synthetic event cycles.
"""

import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

DEFAULT_SUBMISSION_URL = "https://cloudcampbd.com/submissions/8dee8cdb-0cda-49c6-8c84-4429d2cc0177"
SESSION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_session")
MAPPED_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "auto_fill_data.json")

def autofill_form(url=DEFAULT_SUBMISSION_URL):
    print("\n========================================================")
    print("  Lungent Form Autofiller (Playwright)")
    print("========================================================")
    print(f"Target URL: {url}")
    print(f"Data File:  {MAPPED_DATA_FILE}\n")

    if not os.path.exists(MAPPED_DATA_FILE):
        print(f"[!] Error: {MAPPED_DATA_FILE} not found.")
        print("    Please run `python map_submission.py` first.")
        return

    with open(MAPPED_DATA_FILE, "r", encoding="utf-8") as f:
        fill_data = json.load(f)

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=SESSION_DIR,
            headless=False,
            viewport={"width": 1400, "height": 950},
            args=["--disable-blink-features=AutomationControlled"]
        )

        page = context.pages[0] if context.pages else context.new_page()

        print(f"[*] Navigating to {url}...")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
        except Exception as e:
            print(f"[!] Warning on load: {e}")

        print("\n--------------------------------------------------------")
        print("ACTION REQUIRED IN BROWSER:")
        print("1. If prompted, please log in now.")
        print("2. Make sure the submission page is open and ready.")
        print("--------------------------------------------------------")
        input(">> When the form is visible on screen, press ENTER to start autofilling: ")

        print("\n[*] Waiting 2 seconds for DOM stabilization...")
        page.wait_for_timeout(2000)

        # 1. Fill Text Inputs
        print(f"\n[*] Filling {len(fill_data.get('text_inputs', []))} Text Inputs...")
        for item in fill_data.get("text_inputs", []):
            selector = item["selector"]
            val = item["value"]
            label = item.get("label", selector)
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    el.click()
                    el.fill(str(val))
                    print(f"  [✓] Filled: {label[:40]} -> {str(val)[:30]}...")
                    page.wait_for_timeout(300)
                else:
                    print(f"  [-] Selector not found: {selector}")
            except Exception as e:
                print(f"  [!] Failed to fill {label[:30]}: {e}")

        # 2. Fill Textareas
        print(f"\n[*] Filling {len(fill_data.get('textareas', []))} Textareas...")
        for item in fill_data.get("textareas", []):
            selector = item["selector"]
            val = item["value"]
            label = item.get("label", selector)
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    el.click()
                    el.fill(str(val))
                    print(f"  [✓] Filled Textarea: {label[:40]}")
                    page.wait_for_timeout(500)
                else:
                    print(f"  [-] Textarea selector not found: {selector}")
            except Exception as e:
                print(f"  [!] Failed to fill textarea {label[:30]}: {e}")

        # 3. Check Checkboxes
        print(f"\n[*] Checking {len(fill_data.get('checkboxes', []))} Checkboxes...")
        for item in fill_data.get("checkboxes", []):
            selector = item["selector"]
            label = item.get("label", selector)
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    if not el.is_checked():
                        el.check(force=True)
                        print(f"  [✓] Checked: {label[:50]}")
                        page.wait_for_timeout(200)
                    else:
                        print(f"  [=] Already Checked: {label[:50]}")
                else:
                    print(f"  [-] Checkbox selector not found: {selector}")
            except Exception as e:
                print(f"  [!] Failed to check {label[:30]}: {e}")

        # 4. Select Dropdowns
        print(f"\n[*] Setting {len(fill_data.get('selects', []))} Dropdown selections...")
        for item in fill_data.get("selects", []):
            selector = item["selector"]
            val = item["value"]
            label = item.get("label", selector)
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    el.select_option(val)
                    print(f"  [✓] Selected {val} for: {label[:40]}")
                    page.wait_for_timeout(300)
            except Exception as e:
                print(f"  [!] Failed to select {val} for {label[:30]}: {e}")

        print("\n========================================================")
        print("  🎉 AUTO-FILL COMPLETE!")
        print("========================================================")
        print("The form fields have been populated in your open browser.")
        print("1. Review each field on the page.")
        print("2. If a YouTube video link is required, make sure to add it.")
        print("3. Click the final Submit button when you are satisfied!")
        print("--------------------------------------------------------")
        input(">> Press ENTER in this terminal when you are done to close the browser: ")

        context.close()

if __name__ == "__main__":
    url_to_fill = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SUBMISSION_URL
    autofill_form(url_to_fill)
