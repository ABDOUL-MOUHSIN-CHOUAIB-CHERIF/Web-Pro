

const { z } = require('zod');

const createExpenseSchema = z.object({

    title: z
        .string()
        .min(3, "Title must be at least 3 characters"),

    amount: z
        .number()
        .positive("Amount must be greater than 0"),

    description: z
        .string()
        .min(3, "Description is too short")
        .optional(),

    date: z
        .string(),

    categoryId: z
        .number()

});

const updateExpenseSchema = createExpenseSchema.partial();

module.exports = {

    createExpenseSchema,

    updateExpenseSchema

};