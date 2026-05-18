const prisma = require('../config/db');



// GET DASHBOARD COUNTS
const getdashboardData = async (req, res) => {

    try {

        const userId = req.user.id;

        // run all queries at the same time
        const [

            categoriesCount,
            goalCount,
            expenseCount,
            incomeCount

        ] = await Promise.all([

            prisma.category.count({
                where: {
                    userId
                }
            }),

            prisma.goal.count({
                where: {
                    userId
                }
            }),

            prisma.expense.count({
                where: {
                    userId
                }
            }),

            prisma.income.count({
                where: {
                    userId
                }
            })

        ]);


        res.status(200).json({

            categories: categoriesCount,
            goals: goalCount,
            expenses: expenseCount,
            incomes: incomeCount

        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }

};


// GET DASHBOARD FINANCIAL SUMMARY
const getdashboardDataSum = async (req, res) => {

    try {

        const userId = req.user.id;

        // run both aggregations together
        const [

            sumOfExpense,
            sumOfIncome

        ] = await Promise.all([

            prisma.expense.aggregate({
                where: {
                    userId
                },
                _sum: {
                    amount: true
                }
            }),

            prisma.income.aggregate({
                where: {
                    userId
                },
                _sum: {
                    amount: true
                }
            })

        ]);


        // safe extraction
        const totalExpense = sumOfExpense._sum.amount || 0;

        const totalIncome = sumOfIncome._sum.amount || 0;

        // final balance
        const balance = totalIncome - totalExpense;


        res.status(200).json({
            totalIncome,
            totalExpense,
            balance
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }

};

// GET RECENT EXPENSES
const getRecentExpenses = async (req, res) => {

    try {
        const userId = req.user.id;
        const recentExpenses = await prisma.expense.findMany({
            where: {
                userId
            },
            orderBy: {
                date: 'desc'
            },
            take: 5,
            include: {
                category: true
            }

        });

        res.status(200).json(recentExpenses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// GET RECENT INCOMES
const getRecentIncomes = async (req, res) => {

    try {
        const userId = req.user.id;

        const recentIncomes = await prisma.income.findMany({
            where: {
                userId
            },
            orderBy: {
                date: 'desc'
            },
            take: 5

        });

        res.status(200).json(recentIncomes);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// GET GOALS PROGRESS
const getGoalProgress = async (req, res) => {

    try {
        const userId = req.user.id;
        const goals = await prisma.goal.findMany({
            where: {
                userId
            }

        });

        // calculate progress
        const goalsWithProgress = goals.map(goal => {

            const progress =
                (goal.currentAmount / goal.targetAmount) * 100;

            return {
                ...goal,
                progress: progress.toFixed(2)
            };

        });

        res.status(200).json(goalsWithProgress);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




// GET EXPENSES GROUPED BY CATEGORY
const getExpenseByCategory = async (req, res) => {

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

        // fetch category names
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


module.exports = {

    getdashboardData,
    getdashboardDataSum,
    getRecentExpenses,
    getRecentIncomes,
    getGoalProgress,
    getExpenseByCategory
};