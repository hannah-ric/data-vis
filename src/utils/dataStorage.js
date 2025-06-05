// IndexedDB configuration
const DB_NAME = 'DataVisualizationDB';
const DB_VERSION = 1;
const DATASETS_STORE = 'datasets';
const VISUALIZATIONS_STORE = 'visualizations';
const SETTINGS_STORE = 'settings';

class DataStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create datasets store
        if (!db.objectStoreNames.contains(DATASETS_STORE)) {
          const datasetsStore = db.createObjectStore(DATASETS_STORE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          datasetsStore.createIndex('name', 'name', { unique: false });
          datasetsStore.createIndex('createdAt', 'createdAt', { unique: false });
          datasetsStore.createIndex('type', 'type', { unique: false });
        }

        // Create visualizations store
        if (!db.objectStoreNames.contains(VISUALIZATIONS_STORE)) {
          const vizStore = db.createObjectStore(VISUALIZATIONS_STORE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          vizStore.createIndex('datasetId', 'datasetId', { unique: false });
          vizStore.createIndex('type', 'type', { unique: false });
          vizStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  // Dataset operations
  async saveDataset(data, metadata = {}) {
    const db = await this.ensureDB();
    const transaction = db.transaction([DATASETS_STORE], 'readwrite');
    const store = transaction.objectStore(DATASETS_STORE);

    const dataset = {
      ...metadata,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      size: JSON.stringify(data).length,
      rowCount: Array.isArray(data) ? data.length : 0
    };

    return new Promise((resolve, reject) => {
      const request = store.add(dataset);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to save dataset'));
    });
  }

  async getDataset(id) {
    const db = await this.ensureDB();
    const transaction = db.transaction([DATASETS_STORE], 'readonly');
    const store = transaction.objectStore(DATASETS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to retrieve dataset'));
    });
  }

  async getAllDatasets() {
    const db = await this.ensureDB();
    const transaction = db.transaction([DATASETS_STORE], 'readonly');
    const store = transaction.objectStore(DATASETS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to retrieve datasets'));
    });
  }

  async updateDataset(id, updates) {
    const db = await this.ensureDB();
    const transaction = db.transaction([DATASETS_STORE], 'readwrite');
    const store = transaction.objectStore(DATASETS_STORE);

    const dataset = await this.getDataset(id);
    if (!dataset) {
      throw new Error('Dataset not found');
    }

    const updatedDataset = {
      ...dataset,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(updatedDataset);
      request.onsuccess = () => resolve(updatedDataset);
      request.onerror = () => reject(new Error('Failed to update dataset'));
    });
  }

  async deleteDataset(id) {
    const db = await this.ensureDB();
    const transaction = db.transaction([DATASETS_STORE, VISUALIZATIONS_STORE], 'readwrite');
    
    // Delete dataset
    const datasetStore = transaction.objectStore(DATASETS_STORE);
    datasetStore.delete(id);

    // Delete associated visualizations
    const vizStore = transaction.objectStore(VISUALIZATIONS_STORE);
    const index = vizStore.index('datasetId');
    const request = index.openCursor(IDBKeyRange.only(id));

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          vizStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(new Error('Failed to delete dataset'));
    });
  }

  // Visualization operations
  async saveVisualization(datasetId, config, metadata = {}) {
    const db = await this.ensureDB();
    const transaction = db.transaction([VISUALIZATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(VISUALIZATIONS_STORE);

    const visualization = {
      ...metadata,
      datasetId,
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(visualization);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to save visualization'));
    });
  }

  async getVisualization(id) {
    const db = await this.ensureDB();
    const transaction = db.transaction([VISUALIZATIONS_STORE], 'readonly');
    const store = transaction.objectStore(VISUALIZATIONS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to retrieve visualization'));
    });
  }

  async getVisualizationsByDataset(datasetId) {
    const db = await this.ensureDB();
    const transaction = db.transaction([VISUALIZATIONS_STORE], 'readonly');
    const store = transaction.objectStore(VISUALIZATIONS_STORE);
    const index = store.index('datasetId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(datasetId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to retrieve visualizations'));
    });
  }

  // Settings operations
  async saveSetting(key, value) {
    const db = await this.ensureDB();
    const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.put({ key, value, updatedAt: new Date().toISOString() });
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to save setting'));
    });
  }

  async getSetting(key) {
    const db = await this.ensureDB();
    const transaction = db.transaction([SETTINGS_STORE], 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(new Error('Failed to retrieve setting'));
    });
  }

  // Utility methods
  async clearAll() {
    const db = await this.ensureDB();
    const transaction = db.transaction([DATASETS_STORE, VISUALIZATIONS_STORE, SETTINGS_STORE], 'readwrite');
    
    transaction.objectStore(DATASETS_STORE).clear();
    transaction.objectStore(VISUALIZATIONS_STORE).clear();
    transaction.objectStore(SETTINGS_STORE).clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(new Error('Failed to clear data'));
    });
  }

  async getStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentUsed: (estimate.usage / estimate.quota) * 100
      };
    }
    return null;
  }
}

// Create singleton instance
const dataStorage = new DataStorage();

export default dataStorage; 