
const prisma = require('../config/db');

const {    createExpenseSchema,updateExpenseSchema} = require('../validators/expense.validator')

// CREATE EXPENSE
const createExpense = async (req, res) => {

    try {

        const validation = createExpenseSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                errors: validation.error.errors

            });
        }

        const { title, amount, description, date, categoryId } = req.body;

        // validation
        if (!title || !amount || !date || !categoryId) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const userId = req.user.id;
        // check category exists
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId, userId: userId
            }
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const userId = req.user.id;
        // create expense
        const expense = await prisma.expense.create({
            data: {
                title,
                amount,
                description,
                date: new Date(date),
                // user comes from token
                userId: userId,
                categoryId
            }
        });

        res.status(201).json({
            message: "Expense created successfully",
            expense
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }

};

// GET ALL EXPENSES
const getExpense = async (req, res) => {

    try {

        const expenses = await prisma.expense.findMany({

            select: {
                id: true,
                title: true,
                amount: true,
                description: true,
                date: true,
                userId: true
            }

        });

        res.status(200).json(expenses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET SINGLE EXPENSE
const getSingleExpense = async (req, res) => {

    try {

        const expId = parseInt(req.params.id);

        const expense = await prisma.expense.findUnique({

            where: {
                id: expId
            }

        });

        if (!expense) {

            return res.status(404).json({
                message: "Expense not found"
            });

        }

        res.status(200).json(expense);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET EXPENSES BY DATE
const getByDate = async (req, res) => {

    try {

        const expenseDate = new Date(req.params.date);

        const expenses = await prisma.expense.findMany({

            where: {
                date: expenseDate
            }

        });

        if (expenses.length === 0) {

            return res.status(404).json({
                message: "No expenses found for this date"
            });

        }

        res.status(200).json(expenses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

//get expense  by category 
const getByCategory = async (req, res) => {

    try {

        const categoryId = parseInt(req.params.categoryId);
        const userId = req.user.id;
        const expenses = await prisma.expense.findMany({

            where: {
                categoryId,
                userId : userId
            }

        });

        if (expenses.length === 0) {

            return res.status(404).json({
                message: "No expenses found for this category"
            });

        }

        res.status(200).json(expenses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// UPDATE EXPENSE
const updateExpense = async (req, res) => {

    try {
        const validation = updateExpenseSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                errors: validation.error.errors

            });
        }

        const expId = parseInt(req.params.id);
        const UserId = req.user.id;
        const { title, amount, description, date } = req.body;

        // check if expense exists
        const existingExpense = await prisma.expense.findUnique({

            where: {
                id: expId,
                userId: UserId
            }

        });

        if (!existingExpense) {

            return res.status(404).json({
                message: "Expense not found"
            });

        }
 
        const updatedExpense = await prisma.expense.update({

            where: {
                id: expId, userId: userId
            },

            data: {
                title,
                amount,
                description,
                date: date ? new Date(date) : undefined
            }

        });

        res.status(200).json({
            message: "Expense updated successfully",
            updatedExpense
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// DELETE EXPENSE
const deleteExpense = async (req, res) => {

    try {

        const expId = parseInt(req.params.id);
        const userId = req.user.id;
        // check if expense exists
        const existingExpense = await prisma.expense.findUnique({

            where: {
                id: expId, 
                userId: userId
            }

        });

        if (!existingExpense) {

            return res.status(404).json({
                message: "Expense not found"
            });

        }

        await prisma.expense.delete({

            where: {
                id: expId, 
                userId: userId
            }

        });

        res.status(200).json({
            message: "Expense deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    createExpense,
    getExpense,
    getSingleExpense,
    getByDate,
    updateExpense,
    deleteExpense,
    getByCategory
};