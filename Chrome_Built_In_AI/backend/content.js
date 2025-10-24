/**
 * Content Script for ContextRecall
 * Extracts article content from webpages and shows related content notifications
 */

// Track if content has been extracted for this page
let contentExtracted = false;
let currentPageData = null;

/**
 * Extract clean article content from the page
 * Uses Mozilla's Readability algorithm
 */
function extractContent() {
  try {
    // Clone the document for Readability
    const documentClone = document.cloneNode(true);
    
    // Check if Readability is available
    if (typeof Readability === 'undefined') {
      console.warn('Readability.js not loaded, using fallback');
      return extractContentFallback();
    }

    // Parse the document
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (article && article.textContent) {
      return {
        title: article.title || document.title,
        text: article.textContent.trim(),
        excerpt: article.excerpt || '',
        length: article.length || 0
      };
    } else {
      // Fallback if Readability can't parse
      return extractContentFallback();
    }
  } catch (error) {
    console.error('Error extracting content with Readability:', error);
    return extractContentFallback();
  }
}

/**
 * Fallback content extraction (without Readability)
 */
function extractContentFallback() {
  // Get main content from common article selectors
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.post-content',
    '.article-content',
    '.entry-content',
    '#content',
    '.content'
  ];

  let mainContent = null;
  for (const selector of selectors) {
    mainContent = document.querySelector(selector);
    if (mainContent) break;
  }

  // If no main content found, use body
  if (!mainContent) {
    mainContent = document.body;
  }

  // Extract text, removing script and style tags
  const clone = mainContent.cloneNode(true);
  const scripts = clone.querySelectorAll('script, style, noscript');
  scripts.forEach(el => el.remove());

  const text = clone.textContent || clone.innerText || '';
  const cleanText = text.replace(/\s+/g, ' ').trim();

  return {
    title: document.title,
    text: cleanText,
    excerpt: cleanText.substring(0, 200),
    length: cleanText.length
  };
}

/**
 * Send extracted content to background script
 */
async function sendContentToBackground() {
  if (contentExtracted) {
    return; // Already processed
  }

  // Skip certain URLs
  const url = window.location.href;
  if (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url === 'about:blank'
  ) {
    return;
  }

  try {
    const content = extractContent();

    // Only process if we have meaningful content
    if (content.text.length < 100) {
      console.log('Content too short, skipping');
      return;
    }

    currentPageData = {
      url: window.location.href,
      title: content.title,
      text: content.text
    };

    // Send to background script
    const response = await chrome.runtime.sendMessage({
      type: 'PAGE_CONTENT',
      data: currentPageData
    });

    if (response && response.success) {
      console.log('Page processed successfully');
      console.log('Summary:', response.summary);
      console.log('Tags:', response.tags);
      console.log('Related pages:', response.relatedPages);
      contentExtracted = true;
    }
  } catch (error) {
    console.error('Error sending content to background:', error);
  }
}

/**
 * Show related pages notification
 */
function showRelatedPagesNotification(data) {
  const { relatedPages, currentTags } = data;

  if (relatedPages.length === 0) return;

  // Remove existing notification if present
  const existingNotification = document.getElementById('contextrecall-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'contextrecall-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 999999;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: slideIn 0.3s ease-out;
  `;

  // Create notification content
  const commonTagsStr = relatedPages[0].commonTags.slice(0, 2).join(', ');
  
  notification.innerHTML = `
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      #contextrecall-notification a {
        color: #ffd700;
        text-decoration: none;
        transition: opacity 0.2s;
      }
      #contextrecall-notification a:hover {
        opacity: 0.8;
        text-decoration: underline;
      }
      .cr-close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 18px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: background 0.2s;
      }
      .cr-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .cr-related-list {
        margin: 10px 0 0 0;
        padding: 0;
        list-style: none;
      }
      .cr-related-list li {
        margin: 6px 0;
        padding-left: 12px;
        position: relative;
      }
      .cr-related-list li:before {
        content: "→";
        position: absolute;
        left: 0;
      }
    </style>
    <button class="cr-close-btn" onclick="this.parentElement.remove()">×</button>
    <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">
      🧠 ContextRecall
    </div>
    <div style="font-size: 13px; margin-bottom: 8px; opacity: 0.95;">
      This article relates to <strong>${relatedPages.length}</strong> page${relatedPages.length > 1 ? 's' : ''} you've saved on <strong>"${commonTagsStr}"</strong>
    </div>
    <ul class="cr-related-list">
      ${relatedPages.slice(0, 3).map(page => `
        <li>
          <a href="${page.url}" target="_blank" style="font-size: 12px;">
            ${page.title.substring(0, 60)}${page.title.length > 60 ? '...' : ''}
          </a>
        </li>
      `).join('')}
    </ul>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Auto-dismiss after 15 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 15000);
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_CONTENT') {
    sendContentToBackground();
    sendResponse({ success: true });
  }

  if (message.type === 'SHOW_RELATED_PAGES') {
    showRelatedPagesNotification(message.data);
    sendResponse({ success: true });
  }

  return true;
});

// Initialize
console.log('ContextRecall content script loaded');

// If page is already loaded, we might need to extract content manually
if (document.readyState === 'complete') {
  // Don't auto-extract; wait for background script to request
  console.log('Page already loaded, waiting for extraction request');
}
