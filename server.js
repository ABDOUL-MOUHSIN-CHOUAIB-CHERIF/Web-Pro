const express = require('express');
const app = express();
const userRoutes = require('./src/routes/user.routes')
const authRoutes = require('./src/routes/auth.routes');
const PORT = 3000;

//telling express to understand json  i.e the middleware to parse json data in request body
app.use(express.json());

//testing routes
app.get('/', (req, res) => {
    res.send('Backend is running ')
})

//user router
app.use('/api/users', userRoutes)

//authentication router
app.use('/api/auth', authRoutes);

//starting server on port 3000
app.listen(PORT, ()=>{
    console.log(`App is running on port ${PORT}`)
})