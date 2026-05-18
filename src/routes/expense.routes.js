const express = require('express');

const router = express.Router();

const protect = require('../middleware/auth.middleware');

const {
    createExpense,
    getExpense,
    getSingleExpense,
    getByDate,
    getByCategory,
    updateExpense,
    deleteExpense
} = require('../controllers/expense.controller');


// CREATE expense
router.post('/', protect, createExpense);


// GET all expenses
router.get('/', protect, getExpense);


// GET single expense
router.get('/:id', protect, getSingleExpense);


// GET expenses by date
router.get('/date/:date', protect, getByDate);


// GET expenses by category
router.get('/category/:categoryId', protect, getByCategory);


// UPDATE expense
router.put('/:id', protect, updateExpense);


// DELETE expense
router.delete('/:id', protect, deleteExpense);


module.exports = router;