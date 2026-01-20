---
description: Extract text content from webpage elements
argument-hint: <url> <css-selector>
---

<objective>
Navigate to a URL and extract text content from elements matching the CSS selector.
</objective>

<process>
1. **Parse Arguments**:
   - Extract URL from first argument
   - Extract CSS selector from second argument
   - Validate both are provided

2. **Initialize Browser**: Start browser with configured settings

3. **Navigate**: Go to the specified URL
   - Wait for page load
   - Wait for dynamic content if applicable

4. **Extract Content**:
   - Query all elements matching selector
   - Extract text content from each element
   - Trim whitespace from results
   - Filter out empty results

5. **Report Results**:
   - Display number of elements found
   - List each extracted text with index
   - Report if no elements found

6. **Cleanup**: Close browser
</process>

<rules>
- URL must be valid
- CSS selector must be valid syntax
- Wait for page load before extraction
- Support all CSS selector types (class, id, tag, attribute)
- Return array of text strings
- Handle missing elements gracefully (return empty array)
- Preserve element order in DOM
</rules>

<examples>
# Extract all headings
/browse extract https://example.com "h1, h2, h3"

# Extract article titles
/browse extract https://blog.com "h2.post-title"

# Extract links
/browse extract https://example.com "a[href]"

# Extract product prices
/browse extract https://shop.com ".price"

# Extract multiple classes
/browse extract https://news.com ".article-title, .article-summary"
</examples>

<success_criteria>
- Page loaded successfully
- CSS selector executed without errors
- Text content extracted from all matching elements
- Results numbered and displayed clearly
- Empty results handled gracefully
- Browser closed properly
</success_criteria>
