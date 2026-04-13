const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();

// Middleware
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Controllers
const authRouter = require('./routes/auth.Router.js');

// Routes

app.get('/', (req, res) => {
    res.send('Welcome to the CRM API');
});
app.use('/auth', authRouter); 


module.exports = app;
