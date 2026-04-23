let features = [];
let nextId = 1;

const normalizeStatus = (value) => (value === "Open" ? "Available" : value);

const parsePrice = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(numeric) ? numeric : null;
};

async function getAllFeatures() {
  return features;
}

async function getFeatureById(id) {
  return features.find(f => f.id === Number(id));
}

async function createFeature(data) {
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
  return newFeature;
}

async function updateFeature(id, data) {
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
  return features[idx];
}

async function deleteFeature(id) {
  features = features.filter(f => f.id !== Number(id));
}

module.exports = {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature
};
