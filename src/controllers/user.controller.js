
const prisma = require('../config/db');
const bcrypt = require('bcrypt');


//get all users
const getUsers = async (req, res) => {

    try {

        // const userId = req.user.id;
        const users = await prisma.user.findMany({
            select :{
                id: true,
                name :true,
                email: true,
                createdAt : true
            }
        });

        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

//create user
const createUsers = async (req, res) => {
    try {
        
        const { name, email, password } = req.body; 

        if (!name || !email || !password) { 
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        //check for exixting email
        const existingUser = await prisma.user.findUnique({
                where : {
                    email
                }
        });
        
        if(existingUser){
                return res.status(400).json({
                    message : "Email already exist"
                });
        }

        //hashing the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password : hashedPassword
            }
        });

        res.status(201).json({
            message: "User created successfully",
            user: newUser
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// get a single user
const getSingleUser =  async (req, res) =>{
  try{

    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
             where:{
                id : userId
             },
             select : {
                id : true,
                name: true,
                email :true,
                createdAt: true
             }
    });

    if(!user){
        return res.status(404).json({
            message : "User not found"
        })
    }
  }catch(error){

    res.status(500).json({
        message :error.message
    });
  }

};

//updating the info of a single user
const updateUser = async (req, res) => {

    try {

        const userId = parseInt(req.params.id);
        const { name, email } = req.body;
        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name,
                email
            }
        });
        res.json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
 
    try {

        const userId = parseInt(req.params.id);
     await prisma.user.delete({
        where :{
            id : userId
        }
     })

     res.json({
        message : " User deleted Successfully"
    });
    }catch (error){
        res.status(500).json({
            message : error.message
        })
    }
    

   
};

module.exports = {
    getUsers,
    createUsers,
    getSingleUser, 
    updateUser, 
    deleteUser
};