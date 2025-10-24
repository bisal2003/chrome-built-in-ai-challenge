/**
 * Background Service Worker for ContextRecall
 * Handles tab monitoring, AI processing, and data storage
 */

import dbManager from './db.js';

// Tab activity tracking
const tabActivityTracker = new Map();
const ACTIVITY_THRESHOLD = 10000; // 10 seconds

// AI session managers
let summarizerSession = null;
let promptSession = null;

/**
 * Initialize AI sessions
 */
async function initializeAI() {
  try {
    // Check if AI APIs are available
    if (!('ai' in self)) {
      console.error('❌ Chrome Built-in AI is not available');
      console.error('📋 Setup Instructions:');
      console.error('1. Use Chrome Canary or Chrome Dev (version 127+)');
      console.error('   Download: https://www.google.com/chrome/canary/');
      console.error('2. Enable AI flags in chrome://flags:');
      console.error('   - optimization-guide-on-device-model');
      console.error('   - prompt-api-for-gemini-nano');
      console.error('   - summarization-api-for-gemini-nano');
      console.error('3. Restart Chrome after enabling flags');
      console.error('4. Reload this extension');
      console.warn('⚠️ Extension will still work but without AI features (basic text extraction only)');
      return false;
    }

    console.log('✓ Chrome AI API detected');

    // Initialize Summarizer API
    if (self.ai.summarizer) {
      try {
        const canSummarize = await self.ai.summarizer.capabilities();
        console.log('Summarizer capabilities:', canSummarize);
        
        if (canSummarize && canSummarize.available !== 'no') {
          if (canSummarize.available === 'readily') {
            summarizerSession = await self.ai.summarizer.create();
            console.log('✓ Summarizer API initialized');
          } else if (canSummarize.available === 'after-download') {
            console.log('📥 Downloading Summarizer model (this may take a few minutes)...');
            summarizerSession = await self.ai.summarizer.create();
            summarizerSession.addEventListener('downloadprogress', (e) => {
              console.log(`📥 Summarizer model download: ${Math.round((e.loaded / e.total) * 100)}%`);
            });
            await summarizerSession.ready;
            console.log('✓ Summarizer API initialized after download');
          }
        } else {
          console.warn('⚠️ Summarizer API not available on this device');
        }
      } catch (err) {
        console.error('❌ Failed to initialize Summarizer API:', err);
      }
    } else {
      console.warn('⚠️ Summarizer API not found in Chrome AI');
    }

    // Initialize Prompt API
    if (self.ai.languageModel) {
      try {
        const canPrompt = await self.ai.languageModel.capabilities();
        console.log('Language Model capabilities:', canPrompt);
        
        if (canPrompt && canPrompt.available !== 'no') {
          if (canPrompt.available === 'readily') {
            promptSession = await self.ai.languageModel.create({
              systemPrompt: 'You are a helpful assistant that extracts keywords and topics from text. Always return responses as valid JSON arrays.'
            });
            console.log('✓ Prompt API initialized');
          } else if (canPrompt.available === 'after-download') {
            console.log('📥 Downloading Language Model (this may take a few minutes)...');
            promptSession = await self.ai.languageModel.create({
              systemPrompt: 'You are a helpful assistant that extracts keywords and topics from text. Always return responses as valid JSON arrays.'
            });
            console.log('✓ Prompt API initialized after download');
          }
        } else {
          console.warn('⚠️ Prompt API not available on this device');
        }
      } catch (err) {
        console.error('❌ Failed to initialize Prompt API:', err);
      }
    } else {
      console.warn('⚠️ Language Model API not found in Chrome AI');
    }

    const hasAnyAI = summarizerSession !== null || promptSession !== null;
    if (hasAnyAI) {
      console.log('✅ AI initialization complete');
    } else {
      console.warn('⚠️ No AI features available - extension will work with basic features only');
    }
    
    return hasAnyAI;
  } catch (error) {
    console.error('❌ Error initializing AI:', error);
    console.error('Extension will continue with limited functionality');
    return false;
  }
}

/**
 * Summarize text using the Summarizer API
 */
async function summarizeText(text) {
  try {
    if (!summarizerSession) {
      await initializeAI();
    }

    if (!summarizerSession) {
      console.warn('⚠️ Summarizer not available - using fallback');
      // Fallback: Create a simple excerpt (first 200 characters)
      return text.substring(0, 200).trim() + (text.length > 200 ? '...' : '');
    }

    const summary = await summarizerSession.summarize(text, {
      type: 'key-points',
      format: 'plain-text',
      length: 'short'
    });

    return summary || 'Could not generate summary';
  } catch (error) {
    console.error('❌ Error summarizing text:', error);
    // Fallback on error
    return text.substring(0, 200).trim() + (text.length > 200 ? '...' : '');
  }
}

/**
 * Extract tags using the Prompt API
 */
async function extractTags(text) {
  try {
    if (!promptSession) {
      await initializeAI();
    }

    if (!promptSession) {
      console.warn('⚠️ Prompt API not available - using fallback tag extraction');
      // Fallback: Extract simple keywords based on word frequency
      return extractTagsFallback(text);
    }

    const prompt = `Extract the 5 most important keywords or topics from the following text. Return ONLY a JSON array of strings, nothing else. Example: ["keyword1", "keyword2", "keyword3"]

Text: ${text.substring(0, 2000)}`; // Limit text length

    const response = await promptSession.prompt(prompt);
    
    // Parse JSON response
    try {
      const tags = JSON.parse(response);
      if (Array.isArray(tags)) {
        return tags.slice(0, 5).map(tag => tag.trim());
      }
    } catch (parseError) {
      // Fallback: try to extract tags from text response
      const matches = response.match(/"([^"]+)"/g);
      if (matches) {
        return matches.slice(0, 5).map(m => m.replace(/"/g, ''));
      }
    }

    return extractTagsFallback(text);
  } catch (error) {
    console.error('❌ Error extracting tags:', error);
    return extractTagsFallback(text);
  }
}

/**
 * Fallback tag extraction using simple word frequency analysis
 */
function extractTagsFallback(text) {
  try {
    // Remove common words
    const commonWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
      'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
      'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
      'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
      'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
      'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
      'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had',
      'were', 'said', 'did', 'having', 'may', 'should', 'am', 'being'
    ]);

    // Extract words
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    // Count frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get top 5 most frequent words
    const tags = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    return tags.length > 0 ? tags : ['General'];
  } catch (error) {
    console.error('Error in fallback tag extraction:', error);
    return ['General'];
  }
}

/**
 * Process page content with AI
 */
async function processPageContent(data) {
  const { url, title, text, tabId } = data;

  try {
    console.log(`Processing page: ${title}`);

    // Generate summary and tags in parallel
    const [summary, tags] = await Promise.all([
      summarizeText(text),
      extractTags(text)
    ]);

    // Save to database
    const pageData = {
      url,
      title,
      summary,
      tags,
      fullText: text.substring(0, 5000) // Store limited text
    };

    await dbManager.savePage(pageData);
    console.log(`Saved page: ${title} with tags:`, tags);

    // Find related pages
    const relatedPages = await dbManager.findRelatedPages(tags, url);
    
    // Notify content script about related pages
    if (relatedPages.length > 0 && tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_RELATED_PAGES',
        data: {
          relatedPages: relatedPages.slice(0, 3), // Show top 3
          currentTags: tags
        }
      }).catch(err => console.log('Could not send message to tab:', err));
    }

    return { success: true, summary, tags, relatedPages: relatedPages.length };
  } catch (error) {
    console.error('Error processing page:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Track tab activity
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  
  // Start tracking this tab
  if (!tabActivityTracker.has(tabId)) {
    tabActivityTracker.set(tabId, {
      activatedAt: Date.now(),
      processed: false
    });

    // Set timeout to process after threshold
    setTimeout(async () => {
      const tracker = tabActivityTracker.get(tabId);
      if (tracker && !tracker.processed) {
        // Inject content script if needed and request content
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
          });

          chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_CONTENT' })
            .catch(err => console.log('Could not extract content:', err));
          
          tracker.processed = true;
        } catch (error) {
          console.log('Could not inject script:', error);
        }
      }
    }, ACTIVITY_THRESHOLD);
  }
});

/**
 * Clean up inactive tabs
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  tabActivityTracker.delete(tabId);
});

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PAGE_CONTENT') {
    // Process page content asynchronously
    processPageContent({
      ...message.data,
      tabId: sender.tab?.id
    }).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep message channel open for async response
  }

  if (message.type === 'SEARCH_PAGES') {
    // Search database
    dbManager.searchPages(message.query)
      .then(results => sendResponse({ success: true, results }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }

  if (message.type === 'GET_ALL_PAGES') {
    // Get all pages
    dbManager.getAllPages()
      .then(results => sendResponse({ success: true, results }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }

  if (message.type === 'GET_STATS') {
    // Get database stats
    dbManager.getStats()
      .then(stats => sendResponse({ success: true, stats }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }

  if (message.type === 'DELETE_PAGE') {
    // Delete a page
    dbManager.deletePage(message.pageId)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }

  if (message.type === 'CLEAR_ALL') {
    // Clear all data
    dbManager.clearAll()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }
});

/**
 * Initialize on install
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ContextRecall installed');
  
  // Initialize database
  await dbManager.init();
  
  // Initialize AI
  await initializeAI();
});

/**
 * Initialize on startup
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('ContextRecall started');
  
  // Initialize database
  await dbManager.init();
  
  // Initialize AI
  await initializeAI();
});

console.log('ContextRecall background worker loaded');
