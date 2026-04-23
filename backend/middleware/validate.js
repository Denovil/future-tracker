const Joi = require('joi');

const featureSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow('').max(1000),
  priority: Joi.string().valid('Low', 'Medium', 'High').required(),
  status: Joi.string().valid('Open', 'Available', 'In Progress', 'Completed').required(),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('')),
  sellerName: Joi.string().allow('').max(120),
  location: Joi.string().allow('').max(120),
  condition: Joi.string().allow('').max(80),
  brand: Joi.string().allow('').max(80)
});

function validateFeature(req, res, next) {
  const { error } = featureSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = { validateFeature };
