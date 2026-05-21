const prisma = require('../config/db');

// MONTHLY EXPENSE REPORT
const getMonthlyExpenses = async (req, res) => {

    try {

        const userId = req.user.id;

        const expenses = await prisma.expense.groupBy({

            by: ['date'],

            where: {
                userId
            },

            _sum: {
                amount: true
            },

            orderBy: {
                date: 'asc'
            }

        });

        res.status(200).json(expenses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// MONTHLY INCOME REPORT
const getMonthlyIncomes = async (req, res) => {

    try {

        const userId = req.user.id;

        const incomes = await prisma.income.groupBy({

            by: ['date'],

            where: {
                userId
            },

            _sum: {
                amount: true
            },

            orderBy: {
                date: 'asc'
            }

        });

        res.status(200).json(incomes);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// EXPENSES BY CATEGORY REPORT
const getExpensesByCategory = async (req, res) => {

    try {

        const userId = req.user.id;

        const expenses = await prisma.expense.groupBy({

            by: ['categoryId'],

            where: {
                userId
            },

            _sum: {
                amount: true
            }

        });

        const formattedExpenses = await Promise.all(

            expenses.map(async (expense) => {

                const category = await prisma.category.findUnique({

                    where: {
                        id: expense.categoryId
                    }

                });

                return {

                    category: category.name,

                    totalAmount: expense._sum.amount

                };

            })

        );

        res.status(200).json(formattedExpenses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// EXPENSES BETWEEN TWO DATES

const getExpensesByDateRange = async (req, res) => {

    try {

        const userId = req.user.id;

        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {

            return res.status(400).json({
                message: "Start date and end date are required"
            });

        }

        const expenses = await prisma.expense.findMany({

            where: {

                userId,

                date: {

                    gte: new Date(startDate),

                    lte: new Date(endDate)

                }

            },

            orderBy: {
                date: 'asc'
            }

        });

        res.status(200).json(expenses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
        
    }

};


// HIGHEST EXPENSE
const getHighestExpense = async (req, res) => {

    try {

        const userId = req.user.id;

        const highestExpense = await prisma.expense.findFirst({

            where: {
                userId
            },

            orderBy: {
                amount: 'desc'
            }

        });

        res.status(200).json(highestExpense);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// FINANCIAL SUMMARY REPORT
const getFinancialSummary = async (req, res) => {

    try {

        const userId = req.user.id;

        const [

            incomeData,

            expenseData

        ] = await Promise.all([

            prisma.income.aggregate({

                where: {
                    userId
                },

                _sum: {
                    amount: true
                }

            }),

            prisma.expense.aggregate({

                where: {
                    userId
                },

                _sum: {
                    amount: true
                }

            })

        ]);

        const totalIncome =
            incomeData._sum.amount || 0;

        const totalExpense =
            expenseData._sum.amount || 0;

        const savings =
            totalIncome - totalExpense;

        res.status(200).json({

            totalIncome,

            totalExpense,

            savings

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


module.exports = {

    getMonthlyExpenses,
    getMonthlyIncomes,
    getExpensesByCategory,
    getExpensesByDateRange,
    getHighestExpense,
    getFinancialSummary

};