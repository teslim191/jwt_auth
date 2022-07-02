const express = require("express")
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const connectDB = require('./config/db')

const app = express();

app.use(express.urlencoded({extended: false}))
app.use(express.json())


dotenv.config({path: 'config/config.env'})

connectDB()

app.use('/', require('./routes/index'))
app.use('/api', require('./routes/api'))

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`server is running on port ${PORT}`))
