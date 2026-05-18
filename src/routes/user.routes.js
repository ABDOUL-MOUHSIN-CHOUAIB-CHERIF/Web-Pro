// note number one do not use app in router folders
const express = require('express');
const router = express.Router();

//defining the different routes 
const { getUsers, createUsers, getSingleUser, updateUser, deleteUser } = require('../controllers/user.controller');

router.post('/', createUsers);

router.get('/', getUsers);

router.get('/:id', getSingleUser);

router.put('/:id', updateUser);

router.delete('/:id', deleteUser);


module.exports = router;