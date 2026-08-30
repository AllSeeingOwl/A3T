from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Mock the getCameras method to delay for 3 seconds before resolving
    page.add_init_script("""
        window.navigator.mediaDevices = {
            enumerateDevices: () => new Promise(resolve => {
                setTimeout(() => resolve([]), 3000);
            })
        };
    """)

    # The application uses the /A3T/ base path, so we go there.
    page.goto("http://localhost:5173/A3T/")
    page.wait_for_timeout(2000)

    # Click the "Scan Card" button to open the modal
    page.get_by_role("button", name="Scan Card").click()
    page.wait_for_timeout(1000)

    # The loading spinner should be visible, take a screenshot of it
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(2500) # Wait for mock to resolve

    # Close the modal
    page.get_by_label("Close Scanner").click()
    page.wait_for_timeout(500)

if __name__ == "__main__":
    with sync_playwright() as p:
        # Use fake UI for media stream to avoid permission popups
        browser = p.chromium.launch(headless=True, args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'])
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
