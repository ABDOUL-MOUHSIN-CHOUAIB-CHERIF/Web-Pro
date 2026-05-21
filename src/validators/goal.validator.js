
const { z } = require('zod');

const createGoalSchema = z.object({

    title: z
        .string()
        .min(3, "Title must be at least 3 characters"),

    targetAmount: z
        .number()
        .positive("Target amount must be greater than 0"),

    currentAmount: z
        .number()
        .nonnegative("Current amount cannot be negative")
        .optional()

});

const updateGoalSchema = createGoalSchema.partial();

module.exports = {

    createGoalSchema,updateGoalSchema

};