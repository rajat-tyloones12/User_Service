const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const AuthRouter = require('./routes/AuthRouter');
const FavoriteRouter = require('./routes/FavoriteRouter');
const multer = require('multer');
const { uploadImage } = require('./routes/fileUploadHandler'); // Assuming this is your function for uploading images
const upload = multer({ storage: multer.memoryStorage() });
const fileUpload = require('express-fileupload');



dotenv.config();

const AWS = require('aws-sdk');
// process.env.AWS_SDK_LOAD_CONFIG = '1';
const fileUploadHandler = require('./routes/fileUploadHandler');



const Verify = require('./middleware/Verify')
const User = require('./models/User');
const Weather = require('./models/Weather');
const cors=require('cors');

const app = express();

app.use(fileUpload());
const PORT = process.env.PORT || 8000;
const MONGODB_URI = 'mongodb+srv://rajat11072000:rajat1234@cluster0.rc7jvjs.mongodb.net/weather'; 
app.use(express.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, filename');
  next();
});
app.use(cors({
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 200,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, filename',
  credential: true,
}));

// app.use(cors({
//   origin: '*', // Allow all origins
//   optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
//   credentials: true, // Reflect (send back) the credentials received from the client
// }));

// // Handle OPTIONS requests
// app.options('*', cors());


// app.use(Verify);
app.use('/api/user', AuthRouter);






// app.use(Verify);


// app.get('/api/protected-route', Verify, (req, res) => {
//   // Access user information from req.user
//   const { sub, email } = req.user;
//   res.json({ message: `Authenticated user: ${email} (UserID: ${sub})` });
// });

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

  app.get('/api/user/profile/:cognitoUserId',Verify, async (req, res) => {
  try {
    const cognitoUserId = req.user.cognitoUserId;
    const user = await User.findById(cognitoUserId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






app.post('/api/user/upload',Verify, fileUploadHandler.upload); // Use the file upload handler
// app.get('/api/user/getall',Verify, AuthRouter.getAllUsers);