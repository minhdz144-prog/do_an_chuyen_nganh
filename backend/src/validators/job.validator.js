const Joi = require('joi');

const createJobSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(20).required(),
  requiredSkills: Joi.array().items(Joi.string()).max(20).default([]),
  location: Joi.string().required(),
  salary: Joi.object({
    min: Joi.number().min(0).default(0),
    max: Joi.number().min(0).greater(Joi.ref('min')).allow(Joi.ref('min')).default(0) // Allow max to be equal to min if they are both 0, or greater
  }).default({ min: 0, max: 0 }),
  jobType: Joi.string().valid('full-time', 'part-time', 'remote', 'internship', 'contract').required(),
  level: Joi.string().valid('intern', 'fresher', 'junior', 'middle', 'senior', 'lead').optional(),
  deadline: Joi.date().greater('now').optional(),
  status: Joi.string().valid('active', 'draft').default('active') // NOT allowing 'closed' on creation
});

const updateJobSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  description: Joi.string().min(20),
  requiredSkills: Joi.array().items(Joi.string()).max(20),
  location: Joi.string(),
  salary: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0).when('min', {
        is: Joi.exist(),
        then: Joi.number().min(Joi.ref('min')),
        otherwise: Joi.number().min(0)
    })
  }),
  jobType: Joi.string().valid('full-time', 'part-time', 'remote', 'internship', 'contract'),
  level: Joi.string().valid('intern', 'fresher', 'junior', 'middle', 'senior', 'lead'),
  deadline: Joi.date().greater('now'),
  status: Joi.string().valid('active', 'draft', 'closed') // Allowing closed on update
}).min(1); // At least one field must be provided for update

module.exports = {
  createJobSchema,
  updateJobSchema
};
