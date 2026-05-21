const prisma = require('../config/db');

const { createGoalSchema,updateGoalSchema} = require('../validators/goal.validator')

// CREATE GOAL
const createGoal = async (req, res) => {

    try {
        const validation = createGoalSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                errors: validation.error.errors

            });
        }

        const { title, targetAmount } = req.body;

        if (!title || !targetAmount ) {

            return res.status(400).json({
                message: "Required fields missing"
            });

        }

        const userId = req.user.id;
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

        const goal = await prisma.goal.create({

            data: {
                title,
                targetAmount,
                currentAmount,
                userId :userId
            }

        });

        res.status(201).json({
            message: "Goal created successfully",
            goal
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET ALL GOALS
const getGoal = async (req, res) => {

    try {

        const userId = req.user.id;
        const goals = await prisma.goal.findMany({
            where :{
                userId : userId
            }
        });

        res.status(200).json(goals);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET SINGLE GOAL
const getSingleGoal = async (req, res) => {

    try {

        const goalId = parseInt(req.params.id);
        const userId = req.user.id;
        const goal = await prisma.goal.findUnique({

            where: {
                id: goalId,
                userId :userId
            }

        });

        if (!goal) {

            return res.status(404).json({
                message: "Goal not found"
            });

        }

        res.status(200).json(goal);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// UPDATE GOAL
const updateGoal = async (req, res) => {

    try {

        const validation = updateGoalSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                errors: validation.error.errors

            });
        }

        const goalId = parseInt(req.params.id);
        const { title, targetAmount, currentAmount } = req.body;
        const userId = req.user.id;
        const existingGoal = await prisma.goal.findUnique({

            where: {
                id: goalId,
                userId : userId
            }

        });

        if (!existingGoal) {

            return res.status(404).json({
                message: "Goal not found"
            });

        }

        const updatedGoal = await prisma.goal.update({

            where: {
                id: goalId,
                userId : userId
            },

            data: {
                title,
                targetAmount,
                currentAmount
            }

        });

        res.status(200).json({
            message: "Goal updated successfully",
            updatedGoal
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// DELETE GOAL
const deleteGoal = async (req, res) => {

    try {

        const goalId = parseInt(req.params.id);
        const userId = req.user.id; 
        const existingGoal = await prisma.goal.findUnique({

            where: {
                id: goalId,
                userId : userId
            }

        });

        if (!existingGoal) {

            return res.status(404).json({
                message: "Goal not found"
            });

        }

        await prisma.goal.delete({

            where: {
                id: goalId,
                userId : userId
            }

        });

        res.status(200).json({
            message: "Goal deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


module.exports = {

    createGoal,
    getGoal,
    getSingleGoal,
    updateGoal,
    deleteGoal

};