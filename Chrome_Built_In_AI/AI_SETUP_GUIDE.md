# Chrome Built-in AI Setup Guide

## ⚠️ Important: AI APIs Not Available Error

If you see **"Chrome Built-in AI is not available"** in the console, follow this guide.

## 🔍 Quick Diagnosis

Open the background worker console (`chrome://extensions` → Service Worker under ContextRecall) and check the error message. It will tell you exactly what's needed.

## ✅ Step-by-Step Setup

### Step 1: Install Chrome Canary or Chrome Dev

**❌ Won't Work:**
- Chrome Stable (regular Chrome)
- Chrome Beta

**✅ Will Work:**
- Chrome Canary (Recommended)
- Chrome Dev

**Download Links:**
- Chrome Canary: https://www.google.com/chrome/canary/
- Chrome Dev: https://www.google.com/chrome/dev/

**Check Your Version:**
1. Open Chrome
2. Go to `chrome://version`
3. Version should be **127.0.0.0 or higher**
4. Should say "canary" or "dev" in the version string

### Step 2: Enable AI Feature Flags

1. **Open Flags Page:**
   - Navigate to: `chrome://flags`

2. **Enable These 3 Flags:**

   **Flag 1: Optimization Guide On Device Model**
   - Search for: `optimization-guide-on-device-model`
   - Set to: **Enabled**
   - Or search: `#optimization-guide-on-device-model`

   **Flag 2: Prompt API for Gemini Nano**
   - Search for: `prompt-api-for-gemini-nano`
   - Set to: **Enabled BypassPerfRequirement**
   - Note: Choose the option with "BypassPerfRequirement" to skip hardware checks

   **Flag 3: Summarization API for Gemini Nano**
   - Search for: `summarization-api-for-gemini-nano`
   - Set to: **Enabled**

3. **Relaunch Chrome:**
   - Click the "Relaunch" button that appears
   - Or close and reopen Chrome completely

### Step 3: Verify AI APIs Are Available

1. **Open DevTools Console:**
   - Press `F12` or right-click → Inspect
   - Go to Console tab

2. **Run This Test:**
   ```javascript
   // Check if AI object exists
   console.log('AI object available:', 'ai' in window);
   
   // Check Summarizer API
   if (window.ai && window.ai.summarizer) {
       window.ai.summarizer.capabilities().then(caps => {
           console.log('Summarizer capabilities:', caps);
       });
   } else {
       console.log('Summarizer API not found');
   }
   
   // Check Language Model API
   if (window.ai && window.ai.languageModel) {
       window.ai.languageModel.capabilities().then(caps => {
           console.log('Language Model capabilities:', caps);
       });
   } else {
       console.log('Language Model API not found');
   }
   ```

3. **Expected Output:**
   ```
   AI object available: true
   Summarizer capabilities: {available: "readily"} (or "after-download")
   Language Model capabilities: {available: "readily"} (or "after-download")
   ```

### Step 4: Download AI Models (If Needed)

If the capabilities show `"after-download"`, you need to download the Gemini Nano model:

1. **Automatic Download:**
   - The extension will automatically download the model when first used
   - Check background worker console for download progress
   - Model size: ~1.5GB
   - Time: 5-30 minutes depending on connection

2. **Manual Download (Alternative):**
   - Open DevTools Console
   - Run:
   ```javascript
   // Download Summarizer model
   const summarizer = await window.ai.summarizer.create();
   summarizer.addEventListener('downloadprogress', (e) => {
       console.log(`Progress: ${Math.round((e.loaded / e.total) * 100)}%`);
   });
   await summarizer.ready;
   console.log('Download complete!');
   ```

### Step 5: Reload Extension

1. Go to `chrome://extensions`
2. Find ContextRecall
3. Click the **refresh icon** (🔄)
4. Click **Service Worker** to open console
5. You should see:
   ```
   ✓ Chrome AI API detected
   ✓ Summarizer API initialized
   ✓ Prompt API initialized
   ✅ AI initialization complete
   ```

## 🐛 Troubleshooting

### "AI object available: false"

**Problem:** Chrome doesn't have the AI APIs at all

**Solutions:**
1. ✅ Verify you're using Chrome Canary or Dev (not Stable)
2. ✅ Check version is 127+
3. ✅ Restart Chrome completely
4. ✅ Try uninstalling and reinstalling Chrome Canary

### "Summarizer API not found"

**Problem:** Summarization flag not enabled properly

**Solutions:**
1. ✅ Go to `chrome://flags`
2. ✅ Search for "summarization"
3. ✅ Set to "Enabled"
4. ✅ Relaunch Chrome
5. ✅ Clear browser cache: `chrome://settings/clearBrowserData`

### "Language Model API not found"

**Problem:** Prompt API flag not enabled properly

**Solutions:**
1. ✅ Go to `chrome://flags`
2. ✅ Search for "prompt-api"
3. ✅ Set to "Enabled BypassPerfRequirement"
4. ✅ Relaunch Chrome

### "available: 'no'"

**Problem:** Your device doesn't meet requirements or model not available

**Solutions:**
1. ✅ Use "BypassPerfRequirement" option in flags
2. ✅ Check you have at least 4GB RAM
3. ✅ Check you have ~2GB free disk space
4. ✅ Update to latest Chrome Canary version
5. ✅ Some regions may not have model access yet

### Model Download Stuck

**Problem:** Download progress stops or fails

**Solutions:**
1. ✅ Check internet connection
2. ✅ Disable VPN temporarily
3. ✅ Check firewall isn't blocking Chrome
4. ✅ Clear browser cache
5. ✅ Try again later (server may be busy)

## 🔄 Fallback Mode

**Good News:** The extension will still work without AI APIs!

If AI is not available, ContextRecall uses fallback features:
- ✅ **Summaries:** First 200 characters of article
- ✅ **Tags:** Keyword frequency analysis (still works well!)
- ✅ **Search:** Full-text search still functional
- ✅ **Storage:** All data saved normally

You'll see this in console:
```
⚠️ Extension will work with basic features only
⚠️ Summarizer not available - using fallback
⚠️ Prompt API not available - using fallback tag extraction
```

The extension is still useful without AI, but summaries and tags won't be as intelligent.

## 📋 Verification Checklist

Before reporting issues, verify:

- [ ] Using Chrome Canary or Dev (not Stable)
- [ ] Version 127.0.0.0 or higher
- [ ] All 3 flags enabled in chrome://flags
- [ ] Chrome restarted after enabling flags
- [ ] Extension reloaded after Chrome restart
- [ ] Checked background worker console for errors
- [ ] At least 2GB free disk space
- [ ] Good internet connection (for model download)

## 🆘 Still Not Working?

1. **Check Chrome Version:**
   ```
   chrome://version
   ```
   Should show version 127+ and "canary" or "dev"

2. **Reset Flags:**
   ```
   chrome://flags/#optimization-guide-on-device-model
   chrome://flags/#prompt-api-for-gemini-nano  
   chrome://flags/#summarization-api-for-gemini-nano
   ```
   Set all to "Enabled", relaunch

3. **Clear Everything:**
   - Uninstall extension
   - Clear browser data: `chrome://settings/clearBrowserData`
   - Restart Chrome
   - Reinstall extension

4. **Use Fallback Mode:**
   - Extension works without AI
   - Just with simpler summarization and tagging

## 📚 Additional Resources

- **Chrome AI Documentation:** https://developer.chrome.com/docs/ai/built-in
- **Origin Trial Info:** https://developer.chrome.com/origintrials/#/trials/active
- **Gemini Nano Info:** https://ai.google.dev/gemini-api/docs

## ✅ Success Indicators

You'll know it's working when you see in background console:

```
✓ Chrome AI API detected
Summarizer capabilities: {available: "readily"}
✓ Summarizer API initialized
Language Model capabilities: {available: "readily"}
✓ Prompt API initialized
✅ AI initialization complete
ContextRecall background worker loaded
```

Then when you visit a webpage for 10+ seconds:
```
Processing page: [Article Title]
Saved page: [Article Title] with tags: ["AI", "Technology", ...]
```

---

**Need more help?** Check the TESTING.md file or create an issue with:
- Your Chrome version (`chrome://version`)
- Flag settings screenshot
- Console error messages
- Steps you've tried
