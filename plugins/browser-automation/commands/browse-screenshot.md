---
description: Capture screenshot of a webpage
argument-hint: [filename] [url]
---

<objective>
Navigate to a URL (optional) and capture a screenshot of the current page.
</objective>

<process>
1. **Parse Arguments**:
   - Extract filename (optional, default: screenshot-{timestamp}.png)
   - Extract URL (optional, default: current page or https://google.com)

2. **Initialize Browser**: Start browser with configured settings

3. **Navigate** (if URL provided):
   - Go to specified URL
   - Wait for page load

4. **Capture Screenshot**:
   - Take full-page screenshot
   - Save to .smite/screenshots/ directory
   - Use configured format (png/jpeg)

5. **Report**: Confirm screenshot saved with full path

6. **Cleanup**: Close browser
</process>

<rules>
- Use timestamp if filename not provided
- Save to configured screenshots directory
- Support PNG and JPEG formats
- Use configured viewport size
- Default to Google homepage if no URL provided
- Create screenshots directory if missing
</rules>

<examples>
# Screenshot Google with default filename
/browse screenshot https://google.com

# Screenshot with custom filename
/browse screenshot mypage.png https://example.com

# Screenshot current page (if already navigated)
/browse screenshot current-state.png

# Screenshot specific page
/browse screenshot homepage.png https://github.com
</examples>

<success_criteria>
- Screenshot file created successfully
- File saved in correct directory
- Filename matches specification
- Full page captured (not just viewport)
- File path reported to user
</success_criteria>
