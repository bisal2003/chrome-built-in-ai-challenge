/**
 * IndexedDB Manager for ContextRecall
 * Handles storage and retrieval of webpage summaries, tags, and metadata
 */

const DB_NAME = 'ContextRecallDB';
const DB_VERSION = 1;
const STORE_NAME = 'pages';

class DatabaseManager {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Create indexes for efficient searching
          objectStore.createIndex('url', 'url', { unique: true });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          objectStore.createIndex('title', 'title', { unique: false });
        }
      };
    });
  }

  /**
   * Save a page to the database
   * @param {Object} pageData - Page data to save
   * @returns {Promise<number>} - ID of saved record
   */
  async savePage(pageData) {
    if (!this.db) await this.init();

    const data = {
      url: pageData.url,
      title: pageData.title,
      summary: pageData.summary,
      tags: pageData.tags || [],
      timestamp: Date.now(),
      fullText: pageData.fullText || '',
      favicon: pageData.favicon || ''
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Check if URL already exists
      const urlIndex = store.index('url');
      const getRequest = urlIndex.get(data.url);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          // Update existing record
          const updateData = { ...getRequest.result, ...data };
          const updateRequest = store.put(updateData);
          updateRequest.onsuccess = () => resolve(updateRequest.result);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          // Add new record
          const addRequest = store.add(data);
          addRequest.onsuccess = () => resolve(addRequest.result);
          addRequest.onerror = () => reject(addRequest.error);
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Get all pages from the database
   * @returns {Promise<Array>} - Array of all pages
   */
  async getAllPages() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Find pages by tag
   * @param {string} tag - Tag to search for
   * @returns {Promise<Array>} - Array of matching pages
   */
  async getPagesByTag(tag) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('tags');
      const request = index.getAll(tag);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search pages by query
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of matching pages
   */
  async searchPages(query) {
    const allPages = await this.getAllPages();
    
    if (!query) return allPages;

    const lowerQuery = query.toLowerCase();
    
    return allPages.filter(page => {
      return (
        page.title?.toLowerCase().includes(lowerQuery) ||
        page.summary?.toLowerCase().includes(lowerQuery) ||
        page.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        page.url?.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Find related pages based on tag matching
   * @param {Array} tags - Tags to match against
   * @param {string} excludeUrl - URL to exclude from results
   * @returns {Promise<Array>} - Array of related pages with match scores
   */
  async findRelatedPages(tags, excludeUrl = null) {
    const allPages = await this.getAllPages();
    
    const relatedPages = allPages
      .filter(page => page.url !== excludeUrl)
      .map(page => {
        // Calculate match score based on common tags
        const commonTags = tags.filter(tag => 
          page.tags.some(pageTag => 
            pageTag.toLowerCase() === tag.toLowerCase()
          )
        );
        
        return {
          ...page,
          matchScore: commonTags.length,
          commonTags
        };
      })
      .filter(page => page.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return relatedPages;
  }

  /**
   * Delete a page by ID
   * @param {number} id - ID of page to delete
   */
  async deletePage(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from the database
   */
  async clearAll() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const allPages = await this.getAllPages();
    
    const allTags = new Set();
    allPages.forEach(page => {
      page.tags.forEach(tag => allTags.add(tag));
    });

    return {
      totalPages: allPages.length,
      totalTags: allTags.size,
      oldestEntry: allPages.length > 0 ? Math.min(...allPages.map(p => p.timestamp)) : null,
      newestEntry: allPages.length > 0 ? Math.max(...allPages.map(p => p.timestamp)) : null
    };
  }
}

// Export a singleton instance
const dbManager = new DatabaseManager();
export default dbManager;
