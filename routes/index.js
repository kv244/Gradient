// Main route

var express = require('express');
var router = express.Router();


const {Storage} = require('@google-cloud/storage');
const storage = new Storage({projectId: 'nodejssample-271611'
  ,keyfileName: './NodeJSSample.json'}
  );
const bucketName = "nodejssample-271611.appspot.com";


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Upload to GCS' }); // entry point
});

// Handler for Submit
router.post('/', async function (req, res) {
    var fName = req.body.file_upload;
    console.log("Uploading " + fName);
    await uploadFile(fName, res).catch(console.error);
});


// Upload file
async function uploadFile(fileName, res) {
  // Uploads a local file to the bucket
  var fullFilename = "/Users/razvanjulianpetrescu/Downloads/" + fileName;
  await storage.bucket(bucketName).upload(fullFilename, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    destination: fileName,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: 'public, no-cache',
    },
  });

  console.log(`${fileName} uploaded to ${bucketName}.`);
  res.cookie('justLoaded', fileName);
  res.redirect('loaded');
  // adding the pubsub pub
    // this routes to the post page TODO route to ack and return
}

module.exports = router;
