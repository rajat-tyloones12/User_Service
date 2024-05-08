const express = require('express');
const router = express.Router();
const dotenv= require("dotenv");

dotenv.config();

const { CognitoIdentityServiceProvider } = require('aws-sdk');
const User = require('../models/User');
const Weather = require('../models/Weather');
const Verify = require('../middleware/Verify');

let userFavorites = {};


const cognito = new CognitoIdentityServiceProvider({ 
  region: process.env.AWS_REGION ,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

router.post('/register',async (req, res) => {
  try {
    const { email,username, password, firstname, lastname, mobileno} = req.body;

    
    const signUpParams = {
      ClientId: process.env.CLIENT_ID,
      Password: password,
      Username: email,
      
    };

     console.log('SignUpParams:', signUpParams);

    const cognitoData = await cognito.signUp(signUpParams).promise();
    console.log('User registered successfully with Cognito:', cognitoData);
    
    
  
    const newUser = new User({
      cognitoUserId: cognitoData.UserSub,
      email: email, 
      username: username,
      firstname: firstname,
      lastname: lastname,
      mobileno: mobileno,
      
    });

    // const newWeather = new Weather({
    //   cognitoUserId: cognitoData.UserSub,
    // })

    await newUser.save();
    // await newWeather.save();
    console.log('User details saved to database');

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/confirm', async (req, res) => {
  try {
    const { email, ConfirmationCode } = req.body;
    const user = await User.findOne({ email: email });
    

    const confirmParams = {
      ClientId: process.env.CLIENT_ID,
      ConfirmationCode: ConfirmationCode,
      Username: email,
    };

    await cognito.confirmSignUp(confirmParams).promise();
    console.log('User  signed up successfully');

    res.status(200).json({message: 'OTP confirmed'});

  } 
  catch (error) {
    console.error('Confirmation failed:', error);
    res.status(500).json({ message: 'Confirmation failed' });
  }
});
// router.post('/add-to-favorites', Verify, async (req, res) => {
//   try {
//     const { cityName } = req.body;
//     const { cognitoUserId } = req.user.cognitoUserId;

//      if (!cognitoUserId) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }

   
//     const user = await User.findOne({ cognitoUserId });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check if the city already exists in favorite cities
//     if (user.favoriteCities.includes(cityName)) {
//       return res.status(400).json({ message: 'City already in favorites' });
//     }

//     // Add the city to favorite cities and save
//     user.favoriteCities.push(cityName);
//     await user.save();

//     res.status(200).json({ message: 'City added to favorites successfully' });
//   } catch (error) {
//     console.error('Error adding favorite city:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });



// router.get('/protected-route', Verify, (req, res) => {
//   const { cognitoUserId, email } = req.user;
//   res.json({ message: `Authenticated user: ${email} (UserID: ${cognitoUserId})` });
// });

  router.get('/getall', async (req, res) => {
  try {
    // Query the database to fetch all users
    const users = await User.find();

    // Send the fetched users as a response
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






module.exports = router;
