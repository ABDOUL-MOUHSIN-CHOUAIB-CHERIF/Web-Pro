 const prisma = require('../config/db');


// CREATE CATEGORY
const createCategory = async (req, res) => {

    try {

        const { name } = req.body;

        if (!name) {

            return res.status(400).json({
                message: "All fields are required"
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

        const category = await prisma.category.create({

            data: {
                name,
                userId: userId
            }

        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET ALL CATEGORIES
const getCategory = async (req, res) => {

    try {

        const userId = req.user.id;
        const categories = await prisma.category.findMany({

            where: {
                userId: userId
            }

        });

        res.status(200).json(categories);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET SINGLE CATEGORY
const getSingleCategory = async (req, res) => {

    try {

        const categoryId = parseInt(req.params.id);

        const category = await prisma.category.findUnique({

            where: {
                id: categoryId
            }

        });

        if (!category) {

            return res.status(404).json({
                message: "Category not found"
            });

        }

        res.status(200).json(category);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// UPDATE CATEGORY
const updateCategory = async (req, res) => {

    try {

        const categoryId = parseInt(req.params.id);
        const userId = req.user.id;
        const { name } = req.body;

        const existingCategory = await prisma.category.findUnique({

            where: {
                id: categoryId,
                userId: userId
            }

        });

        if (!existingCategory) {

            return res.status(404).json({
                message: "Category not found"
            });

        }

        const updatedCategory = await prisma.category.update({

            where: {
                id: categoryId,
                userId: userId
            },

            data: {
                name
            }

        });

        res.status(200).json({
            message: "Category updated successfully",
            updatedCategory
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// DELETE CATEGORY
const deleteCategory = async (req, res) => {

    try {

        const categoryId = parseInt(req.params.id);
        const userId = req.user.id;

        const existingCategory = await prisma.category.findUnique({

            where: {
                id: categoryId,
                userId: userId
            }

        });

        if (!existingCategory) {

            return res.status(404).json({
                message: "Category not found"
            });

        }

        await prisma.category.delete({

            where: {
                id: categoryId
            }

        });

        res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


module.exports = {

    createCategory,
    getCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory

};