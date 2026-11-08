#!/usr/bin/env python3
"""
Lungent — AI Builders Congress Form Scraper
Uses Playwright to launch a persistent browser session, navigate to the
submission form, and dump the complete DOM form schema into form_schema.json.
"""

import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

DEFAULT_SUBMISSION_URL = "https://cloudcampbd.com/submissions/8dee8cdb-0cda-49c6-8c84-4429d2cc0177"
SESSION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_session")
OUTPUT_SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "form_schema.json")

def scrape_form(url=DEFAULT_SUBMISSION_URL):
    print(f"\n========================================================")
    print(f"  Lungent Form Scraper (Playwright)")
    print(f"========================================================")
    print(f"Target URL: {url}")
    print(f"Session Dir: {SESSION_DIR}\n")

    os.makedirs(SESSION_DIR, exist_ok=True)

    with sync_playwright() as p:
        # Launch persistent browser context so login session is preserved across runs
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
            print(f"[!] Warning on initial load: {e}")

        # Check if the page is currently on a login / auth wall
        print("\n--------------------------------------------------------")
        print("ACTION REQUIRED IN BROWSER:")
        print("1. Look at the opened browser window.")
        print("2. If prompted to Sign In, please log in now.")
        print("3. Ensure the submission form page is fully loaded on screen.")
        print("--------------------------------------------------------")
        input(">> When you see the submission form loaded in the browser, press ENTER to scrape: ")

        print("\n[*] Waiting 3 seconds for dynamic components and animations to stabilize...")
        page.wait_for_timeout(3000)

        print("[*] Extracting form elements from DOM...")

        # Inject JavaScript to extract every interactive field with rich context
        extraction_script = """
        () => {
            const result = {
                title: document.title,
                url: window.location.href,
                sections: [],
                inputs: [],
                textareas: [],
                selects: [],
                checkboxes: [],
                radios: [],
                buttons: []
            };

            // Helper to get nearest label or text descriptor
            function getLabelText(el) {
                // 1. Direct label via 'for'
                if (el.id) {
                    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
                    if (label) return label.innerText.trim();
                }
                // 2. Parent label
                const parentLabel = el.closest('label');
                if (parentLabel) return parentLabel.innerText.trim();

                // 3. Aria-label / aria-labelledby
                if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
                if (el.getAttribute('aria-labelledby')) {
                    const ref = document.getElementById(el.getAttribute('aria-labelledby'));
                    if (ref) return ref.innerText.trim();
                }

                // 4. Closest preceding label or legend or bold header
                const container = el.closest('div.space-y-2, div.form-group, div.mb-4, div.flex, fieldset');
                if (container) {
                    const heading = container.querySelector('label, legend, p.font-medium, span.font-medium, h4, h5');
                    if (heading && heading !== el) return heading.innerText.trim();
                }

                return el.placeholder || el.name || el.id || '';
            }

            // Extract all inputs
            document.querySelectorAll('input').forEach((input, index) => {
                const type = (input.type || 'text').toLowerCase();
                const info = {
                    index,
                    id: input.id || '',
                    name: input.name || '',
                    type: type,
                    placeholder: input.placeholder || '',
                    value: input.value || '',
                    required: input.required,
                    disabled: input.disabled,
                    label: getLabelText(input),
                    selector: input.id ? `#${CSS.escape(input.id)}` : (input.name ? `input[name="${CSS.escape(input.name)}"]` : `input:nth-of-type(${index + 1})`)
                };

                if (type === 'checkbox') {
                    info.checked = input.checked;
                    result.checkboxes.push(info);
                } else if (type === 'radio') {
                    info.checked = input.checked;
                    result.radios.push(info);
                } else if (type !== 'hidden' && type !== 'submit') {
                    result.inputs.push(info);
                }
            });

            // Extract all textareas
            document.querySelectorAll('textarea').forEach((ta, index) => {
                result.textareas.push({
                    index,
                    id: ta.id || '',
                    name: ta.name || '',
                    placeholder: ta.placeholder || '',
                    value: ta.value || '',
                    required: ta.required,
                    disabled: ta.disabled,
                    label: getLabelText(ta),
                    selector: ta.id ? `#${CSS.escape(ta.id)}` : (ta.name ? `textarea[name="${CSS.escape(ta.name)}"]` : `textarea:nth-of-type(${index + 1})`)
                });
            });

            // Extract all selects
            document.querySelectorAll('select').forEach((sel, index) => {
                const options = Array.from(sel.options).map(opt => ({
                    value: opt.value,
                    text: opt.text.trim(),
                    selected: opt.selected
                }));
                result.selects.push({
                    index,
                    id: sel.id || '',
                    name: sel.name || '',
                    label: getLabelText(sel),
                    options: options,
                    selector: sel.id ? `#${CSS.escape(sel.id)}` : (sel.name ? `select[name="${CSS.escape(sel.name)}"]` : `select:nth-of-type(${index + 1})`)
                });
            });

            // Extract visible section headers / tabs
            document.querySelectorAll('h1, h2, h3, h4, [role="tab"], button[aria-expanded]').forEach((header) => {
                const text = header.innerText ? header.innerText.trim() : '';
                if (text && text.length < 80) {
                    result.sections.push(text);
                }
            });

            return result;
        }
        """

        schema = page.evaluate(extraction_script)

        # Write to JSON file
        with open(OUTPUT_SCHEMA_FILE, "w", encoding="utf-8") as f:
            json.dump(schema, f, indent=2, ensure_ascii=False)

        print(f"\n[+] Successfully scraped form structure!")
        print(f"    - Text Inputs found:    {len(schema.get('inputs', []))}")
        print(f"    - Textarea fields:      {len(schema.get('textareas', []))}")
        print(f"    - Checkbox fields:      {len(schema.get('checkboxes', []))}")
        print(f"    - Radio options:        {len(schema.get('radios', []))}")
        print(f"    - Select dropdowns:     {len(schema.get('selects', []))}")
        print(f"    - Detected Sections:    {len(schema.get('sections', []))}")
        print(f"\n[✓] Saved complete schema to: {OUTPUT_SCHEMA_FILE}\n")

        context.close()

if __name__ == "__main__":
    url_to_scrape = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SUBMISSION_URL
    scrape_form(url_to_scrape)
