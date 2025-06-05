import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: {
          message: 'Validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  executeCode: Joi.object({
    code: Joi.string().required().max(10000),
    data: Joi.array().items(Joi.object()).optional(),
    timeout: Joi.number().min(1000).max(300000).optional()
  }),

  executePrompt: Joi.object({
    prompt: Joi.string().required().max(500),
    data: Joi.array().items(Joi.object()).required(),
    timeout: Joi.number().min(1000).max(300000).optional()
  }),

  createVisualization: Joi.object({
    type: Joi.string().valid('ggplot', 'plotly', 'base', 'd3').required(),
    data: Joi.array().items(Joi.object()).required(),
    config: Joi.object().required()
  })
}; 