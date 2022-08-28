const express = require("express")
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')

const app = express();

// parse incoming data
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// enable cors
app.use(cors())

// access environment variables
dotenv.config({path: 'config/config.env'})

connectDB()

// rate limit for all routes
const limiter = rateLimit({
    // max 100 request per 10 minutes
    windowMs: 10 * 60 * 1000,
    max: 100
})

// rate limiting middleware
app.use(limiter)

// if running behind a proxy, we need to set
// app.set('trust proxy', 1)

// init apicache
// const cache = apicache.middleware
// use it on all routes
// app.use(cache('5 minutes'))

// swagger
// const swaggerOptions = {
//     swaggerDefinition: {
//         info: {
//             title: 'Blog',
//             description: 'using JWToken, APIcache and rate limiting with RESTAPI',
//             contact: {
//                 name:'Teslim Jimoh'   
//             },
//             servers:["http://localhost:4000"]
//         }
//     },
//     apis: ['./routes/*.js']
// }
const swaggerDefinition = yaml.load('./swagger.yaml')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition))

app.use('/', require('./routes/index'))
app.use('/api', require('./routes/api'))

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`server is running on port ${PORT}`))
