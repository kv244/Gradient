/**
 * Triggered from a change to a Cloud Storage bucket.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.analyze = (event, context) => {
  const gcsEvent = event;
  console.log(`Processing file: ${gcsEvent.name}`);
  analyzeSync(gcsEvent.name);
};


// or https://storage.cloud.google.com/nodejssample-271611.appspot.com/123456.jpg

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const bucketName = "nodejssample-271611.appspot.com";
const TOPIC_NAME = "vision-label";

const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub({projectId: "nodejssample-271611" });
const topic = pubsub.topic(TOPIC_NAME);

// test
// analyzeSync("w1200_27b2_Indoor_lounge.jpg");

function pubNotif(fName){
  const buffer = Buffer.from(fName);
  topic.publish(buffer);
}

// Synchronous analysis, writes to console
async function analyzeSync(image) {
    if(image==null){
      console.log("Image is null in analyzeSync"); return;
    }
    if(!image.endsWith("jpg")){
      console.log("Not an image, exiting");
      return;
    }

    var imageName = `gs://${bucketName}/${image}`;
    
    console.log("Analyzing " + imageName);
    const [result] = await client.labelDetection(imageName);

    try{
  	  const labels = result.labelAnnotations;
      console.log('Labels:');
      labels.forEach(label => console.log(label.description));
      pubNotif(image.replace("jpg", "check_log"));
    }
    catch(rejectedValue){
  	  console.log("In-function error: " + rejectedValue);
      pubNotif(image.replace("jpg", "err"));
    }
}

// Asynchronous, writes to a Google Cloud Store file with extension json instead of jpg
async function analyzeAsync(image) {
  if(image==null){
    console.log("Image is null in analyzeAsync"); return;
  }
  if(!image.endsWith("jpg")){
      console.log("Not an image, exiting");
      return;
  }

  const features = [
    {type: 'LABEL_DETECTION'},
  ];

  var imageName = `gs://${bucketName}/${image}`;
  console.log("Analyzing " + imageName);

  const imageRequest = {
    image: {
      source: {
        imageUri: imageName,
      },
    },
    features: features,
  }

  const outputConfig = {
    gcsDestination: {
      uri: imageName.replace("jpg","json"),
    },
    batchSize: 2,
  };


  const request = {
    requests: [
      imageRequest,
    ],
    outputConfig,
  };

  try{
    const [operation] = await client.asyncBatchAnnotateImages(request);
    const [filesResponse] = await operation.promise();
    const destinationUri = filesResponse.outputConfig.gcsDestination.uri;
    console.log(`Output written to GCS with prefix: ${destinationUri}`);
    pubNotif(image.replace("jpg", "json"));
  }
  catch(x){
    console.log(x);
    pubNotif(image.replace("jpg", "err"));
  }
}
