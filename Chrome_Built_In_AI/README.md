# ContextRecall - Your Private, Agentic Browser Memory

A Chrome extension that uses on-device AI to automatically summarize and intelligently tag every webpage you visit. It creates a fully private, searchable knowledge base, transforming your browsing history from a list of URLs into a powerful "second brain" that proactively helps you connect ideas.

## 🌟 Features

### On-Device AI Processing
- **Automatic Summarization**: Uses Chrome's built-in Summarizer API to generate concise summaries
- **Intelligent Tagging**: Leverages the Prompt API to extract relevant keywords and topics
- **100% Privacy**: All processing happens locally - no data ever leaves your device

### Smart Memory
- **Automatic Capture**: Monitors your browsing and captures pages you spend 10+ seconds on
- **Searchable Database**: Full-text search powered by Fuse.js for fuzzy matching
- **Persistent Storage**: Uses IndexedDB to store unlimited history locally

### Proactive Intelligence
- **Related Content Discovery**: Automatically detects when you're reading related articles
- **Smart Notifications**: Non-intrusive alerts showing previously saved related pages
- **Tag-Based Matching**: Finds connections based on topic similarity

## 🔧 Technology Stack

- **Chrome Built-in AI APIs**:
  - Summarizer API (for content summarization)
  - Prompt API (for tag extraction)
- **Mozilla Readability.js**: Article content extraction
- **Fuse.js**: Fuzzy search functionality
- **IndexedDB**: Local data storage
- **Chrome Extension Manifest V3**: Modern extension architecture

## 📋 Prerequisites

1. **Chrome Canary or Chrome Dev** (version 127+)
   - ❌ Won't work with Chrome Stable
   - Download: https://www.google.com/chrome/canary/

2. **Enable AI APIs** (CRITICAL - Read AI_SETUP_GUIDE.md if you get errors):
   - Navigate to `chrome://flags`
   - Enable the following flags:
     - `#optimization-guide-on-device-model` → **Enabled**
     - `#prompt-api-for-gemini-nano` → **Enabled BypassPerfRequirement**
     - `#summarization-api-for-gemini-nano` → **Enabled**
   - Restart Chrome
   - **See AI_SETUP_GUIDE.md for detailed instructions**

3. **Disk Space**
   - ~2GB for Gemini Nano AI model (downloads automatically on first use)

### ⚠️ Getting "Chrome Built-in AI is not available" Error?

**👉 READ: [AI_SETUP_GUIDE.md](AI_SETUP_GUIDE.md) for complete setup instructions and troubleshooting**

The extension will still work without AI (using fallback features), but AI features provide much better summaries and tags.

## 🚀 Installation

### Step 1: Download Required Libraries

Download the following libraries and place them in the `backend/lib/` folder:

1. **Readability.js** 
   - Download from: https://github.com/mozilla/readability/blob/main/Readability.js
   - Save as: `backend/lib/Readability.js`

2. **Fuse.js** (v6.6.2 or later)
   - Download from: https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js
   - Save as: `backend/lib/fuse.min.js`

### Step 2: Add Extension Icons

Create or download icon images and place them in `backend/icons/`:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any icon design tool or download placeholder icons from:
- https://www.flaticon.com/ (search for "brain" or "memory")
- Or create simple colored squares as placeholders

### Step 3: Load the Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `backend` folder from this project
5. The ContextRecall extension should now appear in your extensions list

## 📖 Usage

### Automatic Page Capture
1. Browse normally - the extension works in the background
2. Spend 10+ seconds on any webpage
3. The extension automatically:
   - Extracts the article content
   - Generates a summary
   - Creates intelligent tags
   - Saves to local database

### Search Your Memory
1. Click the ContextRecall icon in your toolbar
2. Use the search box to find pages by:
   - Title
   - Summary content
   - Tags
   - URL
3. Click any result to open the page

### Discover Related Content
When browsing, if the extension detects related pages you've saved:
- A notification appears in the top-right corner
- Shows up to 3 related pages
- Click links to revisit related content
- Auto-dismisses after 15 seconds

### Managing Your Data
- **Refresh**: Click the "Refresh" button in the popup to reload your data
- **Clear All**: Click "Clear All" to delete all saved pages (requires confirmation)

## 🏗️ Project Structure

```
backend/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (AI processing, tab monitoring)
├── content.js            # Content script (text extraction, notifications)
├── db.js                 # IndexedDB manager
├── popup.html            # Popup UI
├── popup.js              # Popup logic and search
├── lib/
│   ├── Readability.js    # Article extraction library
│   └── fuse.min.js       # Fuzzy search library
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## 🎯 How It Works

### 1. Background Watcher
- Monitors tab activity using Chrome's tabs API
- Triggers content extraction after 10 seconds on a page

### 2. Content Extraction
- Uses Readability.js to extract clean article text
- Fallback extraction for non-article pages
- Sends content to background worker

### 3. AI Processing
- **Summarizer API**: Generates 2-3 sentence summary
- **Prompt API**: Extracts 5 most important keywords/topics
- Both run 100% on-device using Chrome's built-in AI

### 4. Local Storage
- Saves URL, title, summary, tags, and timestamp
- Uses IndexedDB for efficient querying
- No cloud storage - complete privacy

### 5. Proactive Recall
- Compares new page tags with existing database
- Finds pages with matching tags
- Injects notification if related content found

## 🔐 Privacy

- **100% On-Device**: All AI processing happens locally
- **No Cloud**: No data sent to external servers
- **No Tracking**: No analytics or telemetry
- **Local Storage**: All data stays in your browser's IndexedDB

## 🛠️ Troubleshooting

### AI APIs Not Working
1. Verify you're using Chrome Canary or Dev (127+)
2. Check that AI flags are enabled in `chrome://flags`
3. Restart Chrome after enabling flags
4. Check console logs in the extension background page

### Extension Not Capturing Pages
1. Check that you're spending 10+ seconds on the page
2. Verify the page is not a chrome:// URL
3. Open DevTools on the page and check console for errors
4. Try refreshing the page

### Search Not Working
1. Ensure Fuse.js is properly loaded in `lib/fuse.min.js`
2. Check the popup console for errors
3. Try refreshing the popup

## 🚧 Development

### Testing
1. Make changes to extension files
2. Go to `chrome://extensions`
3. Click the refresh icon on the ContextRecall extension
4. Test your changes

### Debugging
- **Background Worker**: Go to `chrome://extensions`, click "Service Worker" under ContextRecall
- **Content Script**: Open DevTools on any webpage
- **Popup**: Right-click the extension icon, select "Inspect popup"

## 📝 Future Enhancements

- [ ] Export/import functionality
- [ ] Advanced filtering options
- [ ] Statistics and insights dashboard
- [ ] Custom tag editing
- [ ] Integration with note-taking apps
- [ ] Timeline view of browsing history
- [ ] Category-based organization

## 🤝 Contributing

This project was created for the Chrome Built-in AI Challenge. Feel free to fork and enhance!

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Credits

- **Mozilla Readability**: Article extraction
- **Fuse.js**: Fuzzy search
- **Chrome Team**: Built-in AI APIs
- **You**: For trying ContextRecall!

---

**Built with ❤️ using Chrome's Built-in AI APIs**
