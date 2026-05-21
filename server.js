const express = require('express');
const app = express();
const userRoutes = require('./src/routes/user.routes');
const expenseRoutes = require('./src/routes/expense.routes');
const incomeRoutes = require('./src/routes/income.routes');
const categoryRoutes = require('./src/routes/category.routes');
const goalRoutes = require('./src/routes/goal.routes');
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

//expense router
app.use('/api/expenses', expenseRoutes);

//income router
app.use('/api/incomes', incomeRoutes);

//category router
app.use('/api/categories', categoryRoutes);

//goal router
app.use('/api/goals', goalRoutes);

//authentication router
app.use('/api/auth', authRoutes);

//starting server on port 3000
app.listen(PORT, ()=>{
    console.log(`App is running on port ${PORT}`)
})