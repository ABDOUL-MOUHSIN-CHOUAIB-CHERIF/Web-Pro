 const express = require('express');

const router = express.Router();

const protect = require('../middleware/auth.middleware');

const {
    createCategory,
    getCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');


// CREATE
router.post('/', protect, createCategory);


// GET ALL
router.get('/', protect, getCategory);


// GET SINGLE
router.get('/:id', protect, getSingleCategory);


// UPDATE
router.put('/:id', protect, updateCategory);


// DELETE
router.delete('/:id', protect, deleteCategory);


module.exports = router;