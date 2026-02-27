import * as FileSystem from 'expo-file-system';

const STORAGE_FILE = `${FileSystem.documentDirectory}farmledger-async-storage.json`;
let cache = null;

async function ensureLoaded() {
  if (cache !== null) {
    return;
  }

  try {
    const info = await FileSystem.getInfoAsync(STORAGE_FILE);
    if (!info.exists) {
      cache = {};
      return;
    }

    const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
}

async function persist() {
  try {
    await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(cache ?? {}));
  } catch {
    // no-op
  }
}

const AsyncStorage = {
  async getItem(key) {
    await ensureLoaded();
    return Object.prototype.hasOwnProperty.call(cache, key) ? cache[key] : null;
  },

  async setItem(key, value) {
    await ensureLoaded();
    cache[key] = value;
    await persist();
  },

  async removeItem(key) {
    await ensureLoaded();
    delete cache[key];
    await persist();
  },

  async clear() {
    cache = {};
    await persist();
  },

  async getAllKeys() {
    await ensureLoaded();
    return Object.keys(cache);
  },

  async multiGet(keys) {
    await ensureLoaded();
    return keys.map((key) => [key, Object.prototype.hasOwnProperty.call(cache, key) ? cache[key] : null]);
  },

  async multiSet(entries) {
    await ensureLoaded();
    entries.forEach(([key, value]) => {
      cache[key] = value;
    });
    await persist();
  },

  async multiRemove(keys) {
    await ensureLoaded();
    keys.forEach((key) => {
      delete cache[key];
    });
    await persist();
  },
};

export default AsyncStorage;
