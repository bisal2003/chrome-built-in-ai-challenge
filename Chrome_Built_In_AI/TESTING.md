# ContextRecall Testing Guide

## Pre-Installation Checklist

### 1. Browser Requirements
- [ ] Chrome Canary or Chrome Dev (version 127+)
- [ ] Download from: https://www.google.com/chrome/canary/ or https://www.google.com/chrome/dev/

### 2. Enable AI APIs
Navigate to `chrome://flags` and enable:
- [ ] `#optimization-guide-on-device-model` → Set to "Enabled"
- [ ] `#prompt-api-for-gemini-nano` → Set to "Enabled BypassPerfRequirement"
- [ ] `#summarization-api-for-gemini-nano` → Set to "Enabled"
- [ ] Restart Chrome after enabling

### 3. Verify AI Availability
Open DevTools Console (F12) and run:
```javascript
// Check Summarizer API
console.log('Summarizer available:', 'ai' in window && 'summarizer' in window.ai);

// Check Prompt API
console.log('Prompt API available:', 'ai' in window && 'languageModel' in window.ai);
```

## Installation Steps

### 1. Download Required Libraries
Run the setup script:
```powershell
cd Chrome_Built_In_AI
.\setup.ps1
```

Or manually download:
- **Readability.js**: https://raw.githubusercontent.com/mozilla/readability/main/Readability.js
  - Save to: `backend/lib/Readability.js`
- **Fuse.js**: https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js
  - Save to: `backend/lib/fuse.min.js`

### 2. Add Icons
Place icon files in `backend/icons/`:
- icon16.png (16x16px)
- icon32.png (32x32px)
- icon48.png (48x48px)
- icon128.png (128x128px)

### 3. Load Extension
1. Open `chrome://extensions`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `backend` folder
5. Verify extension appears with no errors

## Testing Scenarios

### Test 1: Automatic Page Capture
**Objective**: Verify extension captures and processes pages

1. Open a news article or blog post
2. Stay on the page for 10+ seconds
3. Open DevTools Console (F12)
4. Look for log messages:
   - "ContextRecall content script loaded"
   - "Page processed successfully"
5. Check background worker logs:
   - Go to `chrome://extensions`
   - Click "Service Worker" under ContextRecall
   - Look for "Processing page" messages

**Expected Result**: 
- Page content extracted
- Summary generated
- Tags created
- Data saved to IndexedDB

### Test 2: Popup Search
**Objective**: Verify search functionality

1. Click the ContextRecall icon
2. Popup should open showing:
   - Header with branding
   - Statistics (pages and tags count)
   - Search box
   - Results list
3. Type a search query
4. Results should filter in real-time

**Expected Result**:
- Fuzzy search works
- Results display title, summary, tags
- Clicking result opens page in new tab

### Test 3: Related Content Detection
**Objective**: Verify proactive notification feature

1. Visit and save an article about "Python programming"
2. Wait 10 seconds for processing
3. Visit another article about "Python"
4. Wait 10 seconds
5. Look for notification in top-right corner

**Expected Result**:
- Notification appears showing related pages
- Lists up to 3 related articles
- Shows common tags
- Auto-dismisses after 15 seconds

### Test 4: Database Operations
**Objective**: Verify data persistence

1. Save several pages (10+ seconds each)
2. Close Chrome completely
3. Reopen Chrome
4. Click ContextRecall icon

**Expected Result**:
- All previously saved pages still appear
- Search still works
- Statistics are correct

### Test 5: Edge Cases

#### Empty State
1. Clear all data using "Clear All" button
2. Verify empty state message appears

#### Non-Article Pages
1. Visit pages without article content:
   - Google search results
   - YouTube homepage
   - GitHub repository page
2. Verify extension handles gracefully (no errors)

#### Short Content
1. Visit a page with minimal content
2. Verify extension either:
   - Skips processing (content < 100 chars), or
   - Processes successfully with fallback

## Debugging Tips

### Background Worker Issues
**Access Console**:
1. Go to `chrome://extensions`
2. Find ContextRecall
3. Click "Service Worker" (or "Inspect views: service worker")
4. DevTools opens with background worker context

**Common Issues**:
- "AI not available" → Check chrome://flags settings
- "Summarizer not initialized" → Restart Chrome, check AI flags
- Database errors → Clear extension data and reload

### Content Script Issues
**Access Console**:
1. Open any webpage
2. Press F12 to open DevTools
3. Check Console tab for messages

**Common Issues**:
- "Readability not defined" → Check lib/Readability.js exists
- Script injection errors → Check manifest.json permissions

### Popup Issues
**Access Console**:
1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup

**Common Issues**:
- "Fuse is not defined" → Check lib/fuse.min.js exists
- Empty results → Check background worker console
- Search not working → Verify Fuse.js loaded correctly

## Performance Testing

### Test AI Processing Speed
1. Open background worker console
2. Visit an article page
3. Note timestamps in console logs
4. Measure time from "Processing page" to "Saved page"

**Expected**:
- Summarization: 2-5 seconds
- Tag extraction: 2-5 seconds
- Total processing: 5-10 seconds

### Test Search Performance
1. Save 50+ pages
2. Open popup
3. Type search queries
4. Measure response time

**Expected**:
- Search results appear instantly (<100ms)
- Fuzzy matching works correctly
- No lag with large datasets

## Known Limitations

### Browser Support
- **Only works in Chrome Canary/Dev** (127+)
- Built-in AI APIs not yet in stable Chrome
- May not work on all systems (AI model availability varies)

### Content Extraction
- **Best for articles**: News, blogs, documentation
- **Limited for**:
  - Video platforms (YouTube, Netflix)
  - Social media feeds (Twitter, Facebook)
  - Search results pages
  - Highly dynamic single-page apps

### AI Processing
- **Model download**: First use may require downloading Gemini Nano (~1.5GB)
- **Processing time**: 5-10 seconds per page
- **Accuracy**: Summaries and tags depend on AI model quality

### Privacy
- **Fully local**: No data sent to servers
- **Storage limit**: IndexedDB has browser-imposed limits (~50% of available disk space)
- **No sync**: Data doesn't sync across devices

## Troubleshooting Guide

### Extension Won't Load
1. Check manifest.json for syntax errors
2. Verify all required files exist
3. Check Chrome console for error messages
4. Try reloading extension

### AI Not Working
1. Confirm Chrome version (must be 127+)
2. Check chrome://flags settings
3. Restart Chrome after enabling flags
4. Wait for model download (first use only)
5. Check background worker console for errors

### No Pages Being Saved
1. Verify 10-second threshold is met
2. Check page has sufficient content (100+ characters)
3. Ensure page is not a chrome:// URL
4. Check background worker console for errors
5. Verify content script injection succeeded

### Search Not Finding Pages
1. Verify pages are actually saved (check stats)
2. Try broader search terms
3. Check Fuse.js is loaded (popup console)
4. Verify database has data (background console)

### Related Pages Not Showing
1. Need at least 2 pages with matching tags
2. Verify tag extraction is working (background console)
3. Check notification injection (page console)
4. Ensure pages have common topics

## Success Metrics

Extension is working correctly if:
- ✅ Pages automatically captured after 10 seconds
- ✅ Summaries generated for each page
- ✅ Tags extracted and saved
- ✅ Search returns relevant results
- ✅ Related content notifications appear
- ✅ Data persists across browser restarts
- ✅ No console errors in any context

## Reporting Issues

If you encounter issues:
1. Check all consoles (background, content, popup)
2. Note exact error messages
3. Verify prerequisites are met
4. Try clearing extension data and reloading
5. Create detailed bug report with:
   - Chrome version
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior

---

Happy Testing! 🧠✨
