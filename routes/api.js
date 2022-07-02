const express = require('express')
const User = require('../models/User')
const Post = require('../models/Post')
const bcrypt = require('bcryptjs')
const bcryptjs = require('bcryptjs')

const router = express.Router()

// get all user in the dtabase
router.get('/users', async (req, res) => {
    try {
        let users = await User.find()
        if (!users) {
            res.status(400).json({message: 'No User found'})
        }
        else{
            res.status(200).json(users)
        }
        
    } catch (error) {
        console.log(error)
    }
})

router.get('/user/:id', async(req, res) => {
    try {
        let user = await User.findById({_id: req.params.id})
        if (!user) {
            res.status(400).json({message: 'User does not exist'})
        } else {
            res.status(200).json(user)
        }
    } catch (error) {
        console.log(error)
    }
})


router.get('/user', async(req, res)=>{
    const { name, email } = req.query
    let user = await User.find({name, email})
    res.json(user)
})

router.get('/posts', (req, res) => {
    const{ title, body, user } = req.body

})




router.post('/post', (req, res) => {
    res.json('post added successfully')
})



// router.put()


// router.delete()







module.exports = router