//import cloudinary from 'cloudinary';
//import {v2 as cloudinary} from 'cloudinary';
//const cloudinary = require("cloudinary");
const cloudinary = require('cloudinary')
require('dotenv').config()

          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});


exports.uploads = (file) =>{
    return new Promise(resolve => {
    cloudinary.uploader.upload(file, (result) =>{
    resolve({url: result.url, id: result.public_id})
    }, 
    {resource_type: "auto"})
})
}