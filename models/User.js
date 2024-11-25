const mongoose = require('mongoose');
const bycrpt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    email:{
        type: String
    },
    mobile:{
        type: String
    },
    address:{
        type: String,
        required: true
    },
    aadharCardNumber:{
        type: Number,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted:{
        type: Boolean,
        default: false
    }
});

//Before storing the password hashing it & then storing it
userSchema.pre('save', async function(next) {
    const user = this;
    
    //Hash the password only if it has been modified (or is new)
    if(!user.isModified('password'))  return next();

    try{
        //salt generation
        const salt = await bycrpt.genSalt(10);

        //hash password
        const hashedPassword = await bycrpt.hash(user.password, salt);

        //Override the plain password with the hashed one
        user.password = hashedPassword;

        next();
    }
    catch(err){
        return next(err);
    }
})

//Compare Password
userSchema.methods.comparePassword = async function(userPassword){
    try{
        //use bcrypt to compare the provided password with the hashed password
        const isMatch = await bycrpt.compare(userPassword, this.password);
        return isMatch;
    }
    catch(err){
        throw err;
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;