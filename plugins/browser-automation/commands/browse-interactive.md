---
description: Open browser for manual interaction
argument-hint: [url]
---

<objective>
Launch a browser window (headed mode) that stays open for manual interaction and testing.
</objective>

<process>
1. **Parse Arguments**:
   - Extract optional URL
   - Override config to force headless: false

2. **Initialize Browser**: Start browser in headed mode

3. **Navigate** (if URL provided):
   - Go to specified URL
   - Wait for page load

4. **Interactive Mode**:
   - Keep browser window open
   - Allow manual interaction
   - Display instructions to user
   - Listen for Ctrl+C to close

5. **Cleanup**: Close browser when user signals done
</process>

<rules>
- Always use headed mode (show browser window)
- Keep browser open until user cancels
- Listen for SIGINT (Ctrl+C) signal
- Display clear instructions to user
- Navigate to URL if provided
- Default to blank page if no URL
- Clean up browser resources on exit
</rules>

<examples>
# Open browser with blank page
/browse interactive

# Open browser and navigate to URL
/browse interactive https://google.com

# Open browser for testing
/browse interactive https://localhost:3000

# Open browser on specific page
/browse interactive https://github.com/pamacea/smite
</examples>

<success_criteria>
- Browser window opens visibly
- URL loaded if provided
- Instructions displayed to user
- Browser stays open until cancelled
- Clean shutdown on Ctrl+C
- All resources released
</success_criteria>
