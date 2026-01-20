---
description: Search using Google, YouTube, or Bing
argument-hint: <query> [google|youtube|bing]
---

<objective>
Perform a web search using the specified search engine and capture results.
</objective>

<process>
1. **Parse Arguments**:
   - Extract search query
   - Determine search engine (default: google)
   - Validate engine is one of: google, youtube, bing

2. **Initialize Browser**: Start browser with configured settings

3. **Navigate to Search Engine**:
   - Google: https://www.google.com
   - YouTube: https://www.youtube.com
   - Bing: https://www.bing.com

4. **Execute Search**:
   - Find search input field
   - Fill with query
   - Submit search form
   - Wait for results to load

5. **Capture Results**: Take screenshot of results page

6. **Report**: Confirm search completed with screenshot location

7. **Cleanup**: Close browser and save screenshot
</process>

<rules>
- Query must not be empty
- Default to Google if engine not specified
- Wait for search results to appear before screenshot
- Save screenshot with timestamp: search-{timestamp}.png
- Handle missing search fields gracefully
</rules>

<examples>
# Search on Google
/browse search "Browser automation tools"

# Search on YouTube
/browse search "tutorial videos" youtube

# Search on Bing
/browse search "weather forecast" bing

# Multi-word query
/browse search "best React frameworks 2025"
</examples>

<success_criteria>
- Search engine navigated successfully
- Query entered and submitted
- Search results loaded
- Screenshot saved to .smite/screenshots/
- No timeout errors
</success_criteria>
