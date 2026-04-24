const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = process.env.FEATURE_DATA_FILE
  ? path.resolve(process.env.FEATURE_DATA_FILE)
  : path.join(__dirname, "../data/features.json");

let features = [];
let nextId = 1;
let hasLoaded = false;
let persistQueue = Promise.resolve();

const ensureLoaded = async () => {
  if (hasLoaded) return;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    features = Array.isArray(parsed?.features) ? parsed.features : [];
    const derivedNextId = features.reduce((max, item) => Math.max(max, Number(item?.id) || 0), 0) + 1;
    nextId = Number(parsed?.nextId) > 0 ? Number(parsed.nextId) : derivedNextId;
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Failed loading features data file:", err);
    }
    features = [];
    nextId = 1;
  }

  hasLoaded = true;
};

const persistState = async () => {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify({ nextId, features }, null, 2),
    "utf8"
  );
};

const queuePersist = () => {
  persistQueue = persistQueue.then(() => persistState());

  return persistQueue;
};

const normalizeStatus = (value) => (value === "Open" ? "Available" : value);

const parsePrice = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(numeric) ? numeric : null;
};

async function getAllFeatures() {
  await ensureLoaded();
  return features;
}

async function getFeatureById(id) {
  await ensureLoaded();
  return features.find(f => f.id === Number(id));
}

async function createFeature(data) {
  await ensureLoaded();
  const newFeature = {
    id: nextId++,
    title: data.title,
    description: data.description,
    priority: data.priority,
    status: normalizeStatus(data.status),
    price: parsePrice(data.price),
    sellerName: data.sellerName || "",
    location: data.location || "",
    condition: data.condition || "",
    brand: data.brand || "",
    createdAt: new Date().toISOString(),
    image: data.image || null,
    imageUrl: data.imageUrl || null,
    imageTitle: data.imageTitle || "",
    imageDescription: data.imageDescription || "",
    videos: data.videos || [],
    links: data.links || [],
    imageClips: data.imageClips || [],
    videoFiles: data.videoFiles || [],
    videoUrl: data.videoUrl || null,
    videoFile: data.videoFile || null
  };
  features.push(newFeature);
  await queuePersist();
  return newFeature;
}

async function updateFeature(id, data) {
  await ensureLoaded();
  const idx = features.findIndex(f => f.id === Number(id));
  if (idx === -1) return null;
  const updates = { ...data };
  if (Object.prototype.hasOwnProperty.call(updates, "status")) {
    updates.status = normalizeStatus(updates.status);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "price")) {
    updates.price = parsePrice(updates.price);
  }
  features[idx] = { ...features[idx], ...updates };
  await queuePersist();
  return features[idx];
}

async function deleteFeature(id) {
  await ensureLoaded();
  features = features.filter(f => f.id !== Number(id));
  await queuePersist();
}

module.exports = {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature
};
