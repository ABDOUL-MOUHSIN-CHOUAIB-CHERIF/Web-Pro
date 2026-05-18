const jwt = require('jsonwebtoken');

const prisma = require('../config/db');

const protect = async (req, res, next) => {

    try {

        let token;

        // check authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {

            token = req.headers.authorization.split(' ')[1];

            // verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // get user from database
            const user = await prisma.user.findUnique({

                where: {
                    id: decoded.id
                },

                select: {
                    id: true,
                    name: true,
                    email: true
                }

            });

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }

            // attach user to request
            req.user = user;

            next();

        } else {

            return res.status(401).json({
                message: "Not authorized, no token"
            });

        }

    } catch (error) {

        return res.status(401).json({
            message: "Invalid token"
        });

    }

};

module.exports = protect;