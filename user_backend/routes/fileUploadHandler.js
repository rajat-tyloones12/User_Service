const AWS = require('aws-sdk');
const User = require('../models/User');
const dotenv= require("dotenv");

dotenv.config();




process.env.AWS_SDK_LOAD_CONFIG
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

exports.upload = async (req, res) => {
   

  // Access the uploaded file through req.files
  const file = req.files.profilePicture;
  const fileBuffer = file.data;
  const fileName = file.name;
  const contentType = file.mimetype; 
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType
  };

    try {
      const result = await s3.upload(params).promise();
      const imageurl= result.Key
     
      console.log(result); 
    try{ 
      const { cognitoUserId } = req.user.cognitoUserId;

   
    const user = await User.findOne({ cognitoUserId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileImageUrl=imageurl;
    await user.save();

    res.status(200).json({ message: 'Profile Picture added Successfully' });
  } catch (error) {
    console.error('Error adding profile picture:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "An error occurred during the image upload.",
        error: error.message
      });
    }
  };




