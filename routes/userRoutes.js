const express = require('express')
const router = express.Router();
const User = require('../models/User');
const { generateToken, jwtAuthMiddleware } = require('../jwt');


//Check is Admin exists
const hasAdmin = async() => {
    try{
        const admin = await User.findOne({role: 'admin'});
        return admin !== null; // Return true if an admin exists
    }
    catch(err){
        console.log(err);
        return false;
    }
}


//POST route to add a user
router.post('/signup', async(req, res) => {
    try{
        //Assuming the request body contains the user's data
        const data = req.body;  

        // Check if the new user is trying to be an admin
        if(data.role === 'admin'){
            //check if an admin already exists
            const adminExists = await hasAdmin();

            if(adminExists){
                return res.status(403).json({error: 'Admin already exists. Cannot create another admin'});
            }
        }

        //create a new User document using the Mongoose model
        const newUser = new User(data); 

        //Save the new user to the database
        const response = await newUser.save();  
        console.log('Data saved', response.name);

        const payLoad = {
            id: response.id
        }

        console.log(JSON.stringify(payLoad));
        const token = generateToken(payLoad);
        console.log("Token is : ", token);

        res.status(200).json({response : response, token : token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
});

//Login route
router.post('/login', async (req, res) => {
    try{
        //Extract username and password from request body
        const {aadharCardNumber, password} = req.body;  

        //Find user by Aadhar Number
        const user = await User.findOne({aadharCardNumber: aadharCardNumber}); 
        
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        //generate token
        const payLoad = {
            id: user.id
        }

        const token = generateToken(payLoad);
        
        res.json({token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
});


// Profile route
router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try{
        const userData = req.user;

        const userId = userData.id;        
        const user = await User.findById(userId);
       
        res.status(200).json({user});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})

//Update password
router.put('/profile/password', jwtAuthMiddleware, async(req, res) => {
    try{
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body;

        const user = await User.findById(userId);   //Find user by id

        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid username or password'});
        }
        
        user.password = newPassword;
        await user.save();

        console.log("password updated");
        res.status(200).json({message : 'Password updated successfully'});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})

module.exports = router;
