let features = [];
let nextId = 1;

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
    status: data.status,
    createdAt: new Date().toISOString(),
    image: data.image || null,
    videoUrl: data.videoUrl || null,
    videoFile: data.videoFile || null
  };
  features.push(newFeature);
  return newFeature;
}

async function updateFeature(id, data) {
  const idx = features.findIndex(f => f.id === Number(id));
  if (idx === -1) return null;
  features[idx] = { ...features[idx], ...data };
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
