#!/usr/bin/env python3
"""
Lungent — Upgraded Multi-Tab Autofiller (Playwright)
Populates the multi-tab AI Builders Congress form by systematically switching
between tabs (Overview, Story, Proof, AI-Native Build, Data Lifecycle,
Prompt Library, etc.) and filling inputs, textareas, and ARIA checkboxes.
"""

import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

DEFAULT_SUBMISSION_URL = "https://cloudcampbd.com/submissions/8dee8cdb-0cda-49c6-8c84-4429d2cc0177"
SESSION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_session")
MAPPED_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "auto_fill_data.json")

def autofill_multi_tab_form(url=DEFAULT_SUBMISSION_URL):
    print("\n========================================================")
    print("  Lungent Multi-Tab Form Autofiller (Playwright)")
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
            viewport={"width": 1440, "height": 950},
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

        print("\n[*] Waiting 2 seconds for initial DOM stabilization...")
        page.wait_for_timeout(2000)

        # Collect all unique tabs that have items to fill
        all_tabs = set()
        for key in ["text_inputs", "textareas", "checkboxes", "selects"]:
            for item in fill_data.get(key, []):
                tab = item.get("tab")
                if tab:
                    all_tabs.add(tab)

        print(f"[*] Found {len(all_tabs)} tabs requiring automation: {list(all_tabs)}")

        def switch_to_tab(tab_name):
            if not tab_name:
                return
            try:
                locator = page.locator(f'[role="tab"]:has-text("{tab_name}"), button:has-text("{tab_name}")').first
                if locator.count() > 0:
                    locator.scroll_into_view_if_needed()
                    locator.click()
                    page.wait_for_timeout(1000)
            except Exception as e:
                print(f"    [!] Error switching to tab {tab_name}: {e}")

        current_active_tab = None

        # 1. Fill Text Inputs
        print(f"\n[*] Processing {len(fill_data.get('text_inputs', []))} Text Inputs...")
        for item in fill_data.get("text_inputs", []):
            tab = item.get("tab")
            if tab and tab != current_active_tab:
                switch_to_tab(tab)
                current_active_tab = tab

            selector = item["selector"]
            val = item["value"]
            label = item.get("label", selector)
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    el.click()
                    el.fill(str(val))
                    print(f"  [✓] [{tab}] Filled: {label[:30]} -> {str(val)[:25]}...")
                    page.wait_for_timeout(250)
            except Exception as e:
                print(f"  [!] Failed to fill input {label[:25]}: {e}")

        # 2. Fill Textareas
        print(f"\n[*] Processing {len(fill_data.get('textareas', []))} Textareas...")
        for item in fill_data.get("textareas", []):
            tab = item.get("tab")
            if tab and tab != current_active_tab:
                switch_to_tab(tab)
                current_active_tab = tab

            selector = item["selector"]
            val = item["value"]
            label = item.get("label", selector)
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    el.click()
                    el.fill(str(val))
                    print(f"  [✓] [{tab}] Filled Textarea: {label[:35]}")
                    page.wait_for_timeout(350)
            except Exception as e:
                print(f"  [!] Failed to fill textarea {label[:25]}: {e}")

        # 3. Check Checkboxes (Native + ARIA)
        print(f"\n[*] Processing {len(fill_data.get('checkboxes', []))} Checkboxes...")
        for item in fill_data.get("checkboxes", []):
            tab = item.get("tab")
            if tab and tab != current_active_tab:
                switch_to_tab(tab)
                current_active_tab = tab

            selector = item["selector"]
            label = item.get("label", selector)
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    # Check if standard or custom ARIA
                    role = el.get_attribute("role") or ""
                    data_state = el.get_attribute("data-state") or ""
                    aria_checked = el.get_attribute("aria-checked") or ""

                    is_checked = (data_state == "checked") or (aria_checked == "true")
                    if not is_checked:
                        try:
                            el.check(force=True)
                        except Exception:
                            el.click(force=True)
                        print(f"  [✓] [{tab}] Checked: {label[:45]}")
                        page.wait_for_timeout(200)
                    else:
                        print(f"  [=] [{tab}] Already checked: {label[:45]}")
            except Exception as e:
                print(f"  [!] Failed to check {label[:25]}: {e}")

        # 4. Select Dropdowns
        print(f"\n[*] Processing {len(fill_data.get('selects', []))} Selects...")
        for item in fill_data.get("selects", []):
            tab = item.get("tab")
            if tab and tab != current_active_tab:
                switch_to_tab(tab)
                current_active_tab = tab

            selector = item["selector"]
            val = item["value"]
            label = item.get("label", selector)
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    el.scroll_into_view_if_needed()
                    el.select_option(val)
                    print(f"  [✓] [{tab}] Selected {val} for: {label[:30]}")
                    page.wait_for_timeout(250)
            except Exception as e:
                print(f"  [!] Failed dropdown {label[:25]}: {e}")

        print("\n========================================================")
        print("  🎉 MULTI-TAB AUTO-FILL COMPLETE!")
        print("========================================================")
        print("All tabs have been automated with the Lungent project data.")
        print("1. Review each tab in your open browser.")
        print("2. Check the completeness score.")
        print("3. Click Submit when you are ready!")
        print("--------------------------------------------------------")
        input(">> Press ENTER in this terminal when you want to close the browser: ")

        context.close()

if __name__ == "__main__":
    url_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SUBMISSION_URL
    autofill_multi_tab_form(url_arg)
