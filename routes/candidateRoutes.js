const express = require('express')
const router = express.Router();
const Candidate = require('../models/Candidate');
const { generateToken, jwtAuthMiddleware } = require('../jwt');
const User = require('../models/User');

const checkAdmin = async (userID) => {
    try{
        const user = await User.findById(userID);
        return user.role === 'admin';
    }
    catch(err){
        return false;
    }
}

//Add Candidate
router.post('/', async(req, res) => {
    try{
        //check if the candidate is Admin
        if(!(await checkAdmin(req.user.id)))
            return res.status(403).json({message : "User doesn't have Admin role"});
        
        //Assuming the request body contains the candidate's data
        const data = req.body;  

        //create a new User document using the Mongoose model
        const newCandidate = new Candidate(data); 

        //Save the new user to the database
        const response = await newCandidate.save();  
        console.log('Data saved', response.name);

        res.status(200).json({response : response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
});

//Update Candidate 
router.put('/:candidateID', async(req, res) => {
    try{
        //check if the candidate is Admin
        if(!checkAdmin(req.user.id))
            return res.status(403).json({message : "User doesn't have Admin role"});

        const candidateID = req.params.candidateID; //Extract the id from the URL parameter
        const updatedCandidateData = req.body;      //Updated data for the Candidate

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,              //Return the updated document
            runvalidators: true,    //Run mongoose validation
        })

        if(!response)
            return res.status(404).json({error: "Candidate not found"});

        console.log('Candidate updated successfully');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})

router.delete('/:candidateID', async(req, res) => {
    try{
        //check if the candidate is Admin
        if(!checkAdmin(req.user.id))
            return res.status(403).json({message : "User doesn't have Admin role"});

        const candidateID = req.params.candidateID; //Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if(!response)
            return res.status(404).json({error: "Candidate not found"});

        console.log('Candidate deleted');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})

//let's start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {

    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{
        //Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            res.status(404).json({message: 'Candidate Not Found'});
        }
        
        const user = await User.findById(userId);
        if(!user){
            res.status(404).json({message: 'User Not Found'});
        }
        
        if(user.isVoted){
            res.status(400).json({message: 'Already Voted, user can only vote once'});
        }
        
        if(user.role === 'admin'){
            res.status(403).json({message: `Admin can't vote`});
        }

        //Update the Candidate document to record the vote
        candidate.votes.push({user: userId});

        candidate.voteCount +=1;
        await candidate.save();

        //update the user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: 'Vote Casted Successfully!!!'});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})

//Vote count
router.get('/vote/count', async (req, res) => {
    try{
        //FInd all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        //Map the candidates to only return their name and voteCount
        const record = candidate.map((data) => {
            return{
                party: data.party,
                count: data.voteCount 
            }
        })

        return res.status(200).json(record);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})

//Get all Candidates
router.get('/', async(req, res) =>{
    try{
        const candidate = await Candidate.find().select('name party age voteCount');
        console.log("List of all Candidate: ",candidate);
        res.status(200).json(candidate);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})

module.exports = router;
