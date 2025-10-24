/**
 * Popup Script for ContextRecall
 * Handles search and display of saved pages
 */

let allPages = [];
let fuse = null;

// DOM elements
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const totalPagesEl = document.getElementById('total-pages');
const totalTagsEl = document.getElementById('total-tags');
const refreshBtn = document.getElementById('refresh-btn');
const clearBtn = document.getElementById('clear-btn');

/**
 * Initialize Fuse.js for fuzzy search
 */
function initializeFuse(pages) {
  const options = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'summary', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
      { name: 'url', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2
  };

  fuse = new Fuse(pages, options);
}

/**
 * Load all pages from background
 */
async function loadPages() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_ALL_PAGES' });
    
    if (response && response.success) {
      allPages = response.results || [];
      initializeFuse(allPages);
      updateStats();
      displayResults(allPages);
    } else {
      showError('Failed to load pages');
    }
  } catch (error) {
    console.error('Error loading pages:', error);
    showError('Error loading pages');
  }
}

/**
 * Update statistics
 */
async function updateStats() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    
    if (response && response.success) {
      const stats = response.stats;
      totalPagesEl.textContent = stats.totalPages;
      totalTagsEl.textContent = stats.totalTags;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Search pages
 */
function searchPages(query) {
  if (!query || query.trim() === '') {
    displayResults(allPages);
    return;
  }

  if (!fuse) {
    displayResults([]);
    return;
  }

  const results = fuse.search(query);
  const pages = results.map(result => result.item);
  displayResults(pages);
}

/**
 * Display results in the UI
 */
function displayResults(pages) {
  resultsContainer.innerHTML = '';

  if (pages.length === 0) {
    showEmptyState();
    return;
  }

  // Sort by timestamp (newest first)
  const sortedPages = [...pages].sort((a, b) => b.timestamp - a.timestamp);

  sortedPages.forEach(page => {
    const resultItem = createResultItem(page);
    resultsContainer.appendChild(resultItem);
  });
}

/**
 * Create a result item element
 */
function createResultItem(page) {
  const div = document.createElement('div');
  div.className = 'result-item';
  
  // Format timestamp
  const date = new Date(page.timestamp);
  const timeAgo = getTimeAgo(date);

  // Create tags HTML
  const tagsHTML = page.tags && page.tags.length > 0
    ? page.tags.slice(0, 5).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')
    : '';

  div.innerHTML = `
    <div class="result-title">${escapeHtml(page.title)}</div>
    <div class="result-summary">${escapeHtml(page.summary || 'No summary available')}</div>
    ${tagsHTML ? `<div class="result-tags">${tagsHTML}</div>` : ''}
    <div class="result-url">${escapeHtml(page.url)} • ${timeAgo}</div>
  `;

  // Click to open URL
  div.addEventListener('click', () => {
    chrome.tabs.create({ url: page.url });
  });

  return div;
}

/**
 * Show empty state
 */
function showEmptyState() {
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <h3>No pages found</h3>
      <p>
        ${allPages.length === 0 
          ? 'Start browsing to build your knowledge base!<br>Pages you spend 10+ seconds on will be automatically saved.'
          : 'Try a different search query.'
        }
      </p>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3>Error</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

/**
 * Get human-readable time ago
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Clear all data
 */
async function clearAllData() {
  if (!confirm('Are you sure you want to clear all saved pages? This cannot be undone.')) {
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({ type: 'CLEAR_ALL' });
    
    if (response && response.success) {
      allPages = [];
      initializeFuse([]);
      updateStats();
      displayResults([]);
    } else {
      alert('Failed to clear data');
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    alert('Error clearing data');
  }
}

/**
 * Event listeners
 */
searchInput.addEventListener('input', (e) => {
  searchPages(e.target.value);
});

refreshBtn.addEventListener('click', () => {
  loadPages();
  searchInput.value = '';
});

clearBtn.addEventListener('click', () => {
  clearAllData();
});

// Focus search input on open
searchInput.focus();

// Load pages on popup open
loadPages();
