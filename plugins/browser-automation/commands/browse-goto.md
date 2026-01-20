---
description: Navigate browser to a specific URL
argument-hint: <url>
---

<objective>
Navigate the browser to the specified URL and wait for page load.
</objective>

<process>
1. **Initialize Browser**: Start browser with configured settings
2. **Navigate**: Go to the specified URL
3. **Wait**: Wait for page load completion
4. **Report**: Confirm successful navigation
5. **Cleanup**: Close browser unless in interactive mode
</process>

<rules>
- URL must be valid (start with http:// or https://)
- Wait for network idle before considering page loaded
- Handle timeouts gracefully (30s default)
- Use configured browser settings from .claude/.smite/browser.json
</rules>

<examples>
# Navigate to Google
/browse goto https://google.com

# Navigate to specific page
/browse goto https://github.com/pamacea/smite
</examples>

<success_criteria>
- Browser successfully launched
- Page loaded completely
- URL matches target
- No timeout errors
</success_criteria>
