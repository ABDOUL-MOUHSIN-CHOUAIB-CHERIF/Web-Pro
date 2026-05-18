const express = require('express');

const router = express.Router();

const protect = require('../middleware/auth.middleware');

const {
    createGoal,
    getGoal,
    getSingleGoal,
    updateGoal,
    deleteGoal
} = require('../controllers/goal.controller');


// CREATE
router.post('/', protect, createGoal);


// GET ALL
router.get('/', protect, getGoal);


// GET SINGLE
router.get('/:id', protect, getSingleGoal);


// UPDATE
router.put('/:id', protect, updateGoal);


// DELETE
router.delete('/:id', protect, deleteGoal);


module.exports = router;