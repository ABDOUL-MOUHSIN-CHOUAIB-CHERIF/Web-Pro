 const prisma = require('../config/db');

 const {createIncomeSchema,

    updateIncomeSchema} = require('../validators/income.validator')

// CREATE INCOME
const createIncome = async (req, res) => {

    try {
        const validation = createIncomeSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                errors: validation.error.errors

            });
        }

        const { source, amount, date } = req.body;
        const userId = req.user.id;

        if (!source || !amount || !date ) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const income = await prisma.income.create({

            data: {
                source,
                amount,
                date: new Date(date),
                userId :userId
            }

        });

        res.status(201).json({
            message: "Income created successfully",
            income
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET ALL INCOME
const getIncome = async (req, res) => {

    try {
        const userId = req.user.id;
        const incomes = await prisma.income.findMany({
            where: {
                userId: userId
            }
        });

        res.status(200).json(incomes);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET SINGLE INCOME
const getSingleIncome = async (req, res) => {

    try {

        const incomeId = parseInt(req.params.id);
        const userId = req.user.id;
        const income = await prisma.income.findUnique({

            where: {
                id: incomeId,
                userId :userId  
            }

        });

        if (!income) {

            return res.status(404).json({
                message: "Income not found"
            });

        }

        res.status(200).json(income);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// UPDATE INCOME
const updateIncome = async (req, res) => {

    try {

        const validation = updateIncomeSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                errors: validation.error.errors

            });
        }
        const incomeId = parseInt(req.params.id);
        const userId = req.user.id;
        const { source, amount, date } = req.body;

        const existingIncome = await prisma.income.findUnique({

            where: {
                id: incomeId, 
                userId : userId
            }

        });

        if (!existingIncome) {

            return res.status(404).json({
                message: "Income not found"
            });

        }

        const updatedIncome = await prisma.income.update({

            where: {
                id: incomeId, 
                userId : userId
            },

            data: {
                source,
                amount,
                date: date ? new Date(date) : undefined
            }

        });

        res.status(200).json({
            message: "Income updated successfully",
            updatedIncome
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// DELETE INCOME
const deleteIncome = async (req, res) => {

    try {

        const incomeId = parseInt(req.params.id);
        const userId = req.user.id;
        const existingIncome = await prisma.income.findUnique({

            where: {
                id: incomeId,
                userId :userId  
            }

        });

        if (!existingIncome) {

            return res.status(404).json({
                message: "Income not found"
            });

        }

        await prisma.income.delete({

            where: {
                id: incomeId, 
                userId : userId
            }

        });

        res.status(200).json({
            message: "Income deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


module.exports = {

    createIncome,
    getIncome,
    getSingleIncome,
    updateIncome,
    deleteIncome

};