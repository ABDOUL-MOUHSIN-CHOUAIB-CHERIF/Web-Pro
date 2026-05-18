 const express = require('express');

const router = express.Router();

const protect = require('../middleware/auth.middleware');

const {
    createIncome,
    getIncome,
    getSingleIncome,
    updateIncome,
    deleteIncome
} = require('../controllers/income.controller');


// CREATE
router.post('/', protect, createIncome);


// GET ALL
router.get('/', protect, getIncome);


// GET SINGLE
router.get('/:id', protect, getSingleIncome);


// UPDATE
router.put('/:id', protect, updateIncome);


// DELETE
router.delete('/:id', protect, deleteIncome);


module.exports = router;