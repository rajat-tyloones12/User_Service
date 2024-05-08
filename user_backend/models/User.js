const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  cognitoUserId: {
    type: String,
    required: true,
    unique: true
  },

  username: {
    type:String,
    required:true
  },
  firstname: {
    type:String,
    required:true
  },
  lastname:{
    type:String,
  
  },
  mobileno: {
    type:String,
    required:true,
  },
  
  email: {
    type: String,
    required: true,
    unique:true,
    
  },
  // favoriteCities:
  //   [],
      
  
   profileImageUrl: {
    type: String,
    required: false 
  },

   
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;

