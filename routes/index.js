const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()


const token = (id) => {
    return jwt.sign({id}, process.env.TOKEN, {
        expiresin: '30d'
    })
}


router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body

    try {
        if (!name || !email || !password){
            res.status(400).json({message: 'all fields are required'})
        }
        
        else if (password.length < 6 || password.length > 12) {
            res.status(400).json({message: 'password too short or too long'})
        }
        else{
            let user = await User.findOne({email})
            if (user) {
                res.status(400).json({message: 'user already exists'})
            }
            else{
                const salt = await bcrypt.genSalt(10)
                const hashedpassword = await bcrypt.hash(password, salt) 
                user = await User.create({
                    name,
                    email,
                    password: hashedpassword
                })
                res.json({
                    _id : user._id,
                    name: user.name,
                    email: user.email,
                    password: user.password
                })
    
            }
        }
    } catch (error) {
        console.log(error)
    }
})



// router.post('/login', async(req, res) => {
//     const { email, password } = req.body
//     try {
//         let user = await User.find({email})

//         if (user && password == await bcrypt.compare(password, user.password)) {
//                 res.json('ok')            
//         }
//         else{
//             res.json('no')
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })






module.exports = router