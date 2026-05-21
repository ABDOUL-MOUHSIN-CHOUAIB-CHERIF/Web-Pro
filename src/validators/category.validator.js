
const { z } = require('zod');

const createCategorySchema = z.object({

    name: z
        .string()
        .min(2, "Category name must be at least 2 characters")

});

const updateCategorySchema = createCategorySchema.partial();

module.exports = {

    createCategorySchema,

    updateCategorySchema 

};