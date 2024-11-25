const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json()); //req.body

const {jwtAuthMiddleware} = require('./jwt');

// import router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

//use the routes
app.use('/user', userRoutes);
app.use('/candidate', jwtAuthMiddleware, candidateRoutes);

app.listen(3000, () => {
    console.log('listening on port 3000');
})
