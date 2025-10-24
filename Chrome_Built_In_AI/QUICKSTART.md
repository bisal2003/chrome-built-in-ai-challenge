# ContextRecall - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Prerequisites (2 minutes)
1. **Install Chrome Canary** (if not installed)
   - Download: https://www.google.com/chrome/canary/
   - Or use Chrome Dev: https://www.google.com/chrome/dev/

2. **Enable AI APIs**
   - Open `chrome://flags` in your browser
   - Search for and enable these 3 flags:
     - `optimization-guide-on-device-model`
     - `prompt-api-for-gemini-nano`
     - `summarization-api-for-gemini-nano`
   - Click "Relaunch" to restart Chrome

### Step 2: Download Dependencies (1 minute)
```powershell
cd Chrome_Built_In_AI
.\setup.ps1
```

This downloads:
- ✅ Readability.js (article extraction)
- ✅ Fuse.js (fuzzy search)

### Step 3: Add Icons (1 minute)

**Quick Option - Use SVGs temporarily:**
```powershell
.\generate-icons.ps1
# Update manifest.json to use .svg instead of .png
```

**Proper Option - Download PNG icons:**
1. Visit: https://www.flaticon.com/free-icon/brain_2784461
2. Download 16px, 32px, 48px, 128px sizes
3. Save to `backend/icons/` as:
   - icon16.png
   - icon32.png
   - icon48.png
   - icon128.png

### Step 4: Load Extension (1 minute)
1. Open `chrome://extensions`
2. Toggle "Developer mode" ON (top-right)
3. Click "Load unpacked"
4. Select the `backend` folder
5. ✅ Extension loaded!

## ✨ First Use

### Test It Out
1. **Visit a news article** (e.g., TechCrunch, Medium, Wikipedia)
2. **Wait 10 seconds** on the page
3. **Click the ContextRecall icon** in toolbar
4. **See your first saved page!** 🎉

### Explore Features
- **Search**: Type keywords to find saved pages
- **Related Content**: Visit related articles to see notifications
- **Stats**: See your growing knowledge base

## 🎯 Demo Workflow

### Scenario: Building a Knowledge Base on "AI Development"

1. **Visit these pages** (spend 10+ seconds on each):
   - https://platform.openai.com/docs/introduction
   - https://www.anthropic.com/research
   - Any AI-related blog post

2. **Watch the magic**:
   - Each page gets auto-summarized
   - Tags are automatically extracted
   - Content saved locally

3. **Search your memory**:
   - Click extension icon
   - Type "AI" or "machine learning"
   - See all related pages instantly

4. **Discover connections**:
   - Visit another AI article
   - Get notified about related content you've saved
   - Build connections between ideas

## 🔍 Verify It's Working

### Check Background Worker
1. Go to `chrome://extensions`
2. Find ContextRecall
3. Click "Service Worker"
4. You should see:
   ```
   ContextRecall background worker loaded
   Summarizer API initialized
   Prompt API initialized
   Processing page: [Article Title]
   Saved page: [Article Title] with tags: ["AI", "ML", ...]
   ```

### Check Content Script
1. Visit any article
2. Press F12 (DevTools)
3. Look for:
   ```
   ContextRecall content script loaded
   Page processed successfully
   ```

### Check Popup
1. Click extension icon
2. Should show:
   - Non-zero page count
   - Search box
   - List of saved pages

## 🐛 Quick Troubleshooting

### "No pages showing up"
- ✅ Did you wait 10+ seconds on the page?
- ✅ Is it an article/blog (not Google/YouTube)?
- ✅ Check background worker console for errors

### "AI not working"
- ✅ Using Chrome Canary/Dev 127+?
- ✅ Enabled all 3 flags in chrome://flags?
- ✅ Restarted Chrome after enabling flags?

### "Extension won't load"
- ✅ Are all files in backend/lib/ present?
- ✅ Do icon files exist (or manifest updated for .svg)?
- ✅ Check chrome://extensions for error messages

## 📚 Next Steps

Once everything works:
1. **Browse normally** - let it build your knowledge base
2. **Use search** - find information you've saved
3. **Notice patterns** - see related content notifications
4. **Explore stats** - watch your second brain grow

## 💡 Tips for Best Results

### Content That Works Best
✅ News articles
✅ Blog posts
✅ Documentation pages
✅ Wikipedia articles
✅ Medium posts
✅ Tutorial pages

### Content That Doesn't Work Well
❌ Social media feeds
❌ Video platforms
❌ Search results pages
❌ Shopping sites
❌ Pure image galleries

### Maximize Usefulness
1. **Stay on pages longer** - 10+ seconds triggers processing
2. **Read diverse content** - more topics = better connections
3. **Search regularly** - leverage your growing knowledge base
4. **Watch for notifications** - discover related content

## 🎉 You're Ready!

Your private, AI-powered second brain is now active. Every article you read adds to your searchable knowledge base, helping you connect ideas and recall information when you need it.

**Happy browsing! 🧠✨**

---

Need help? Check:
- 📖 Full README.md for detailed documentation
- 🧪 TESTING.md for troubleshooting guide
- 💬 Create an issue if you find bugs
