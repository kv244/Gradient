// Called once the file has been uploaded
// This is the one which should scan for the JSON file,
// for now, use the same name as the uploaded file
// only supports JPGs for now

var express = require('express');
var router = express.Router();

const projectId = "nodejssample-271611";
const {Storage} = require('@google-cloud/storage');
const request = require('request');
const storage = new Storage({projectId: projectId,
  keyfileName: './NodeJSSample.json'});
const bucketName = "nodejssample-271611.appspot.com";

const TOPIC_NAME = "vision-label";
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub({projectId: "nodejssample-271611" });
const topic = pubsub.topic(TOPIC_NAME);
const subscription = topic.subscription("image-labeled");
subscription.on('error', (err)=>{console.log("Error w/ subscription: ", err)});
subscription.on('close', ()=>{console.log("Subscription closed ")});

async function onMessage(message){
  var fileName = message.data.toString();
  var scanName = "";

  console.log("Message received ", fileName);
  message.ack();
  scanName = fileName.replace("jpg",
    "json").substring(scanName.lastIndexOf("/")+1).replace(".",".jsonoutput-1-to-1.");
	console.log("Checking scan: " + scanName + " of uploaded file: " + fileName);

  await getFile(scanName);
}
subscription.on('message', onMessage); //TODO trigger refresh

// Entry point
router.get('/', function(req, res, next) {
	var fileName = req.cookies.justLoaded;
  res.send("File uploaded " + bucketName + ":" + fileName);
});

async function getFile(sn){
	console.log("Get file " + bucketName + ":" + sn);

  // TODO this seems to fail the first time? sometimes
	await storage
      .bucket(bucketName)
      .file(sn)
      .get(function(err, file, apiResponse){
      	if(file != null){
      		console.log("Scan ok... ", apiResponse.name);
          file.getMetadata(function(err, metadata, apiResponse){
            console.log("\t", metadata.name);
          });
      		readFile(storage.bucket(bucketName).file(sn));
		}
      	else{
      		console.log("Await storage, no scan file: " + sn);
      		if(err != null)
      			console.log("\t error: " + err.message);
      	}
      });
}

function readFile(bucketFile){
	bucketFile.get(function(error, fileData){
		if(error)
			console.log("Error reading file ", error);
		else{
			const uri = fileData.metadata.mediaLink;
			console.log(uri);
			request({
				url: uri,
				json: true
			},
			function(jsonReadErr, jsonResp, body){
				if(!jsonReadErr){
					console.log("JSON Read error in ReadFile: ", body);
				}
			});
		}
	});
}

module.exports = router;
