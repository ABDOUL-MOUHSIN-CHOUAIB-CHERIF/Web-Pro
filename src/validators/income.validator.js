

const { z } = require('zod');

const createIncomeSchema = z.object({

    source: z
        .string()
        .min(3, "Source must be at least 3 characters"),

    amount: z
        .number()
        .positive("Amount must be greater than 0"),

    date: z
        .string()

});

const updateIncomeSchema = createIncomeSchema.partial();

module.exports = {

    createIncomeSchema,

    updateIncomeSchema

};