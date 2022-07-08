const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { ensureAuth } = require('../middleware/auth')

const router = express.Router()


const generateToken = (id) => {
    return jwt.sign({id}, process.env.TOKEN, {
        expiresIn: '30d'
    })
}

// signup
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
                    password: hashedpassword,
                })
                res.status(201).json({
                    _id : user.id,
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    token: generateToken(user.id)
                })
    
            }
        }
    } catch (error) {
        console.log(error)
    }
})

// login
router.post('/login', async(req, res) => {
    const { email, password } = req.body
    try {
        let user = await User.findOne({email})

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            })
        }
        else{
            res.status(400).json({message: 'Email or Password incorrect'})
        }
    } catch (error) {
        console.log(error)
    }
})

// dashboard

router.get('/dashboard', ensureAuth, async(req, res) => {
    try {
        let user = await User.findById({_id: req.user.id})
        res.status(200).json({
            name: user.name,
            email: user.email
        })
        
    } catch (error) {
        console.log(error)
        
    }
})




module.exports = router