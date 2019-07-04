const doc = require('aws-sdk');
const docClient = new doc.DynamoDB.DocumentClient({
    region: 'us-east-1'
});

const config = {
    macRegex: /^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/
};

/**
 * Returns true if a provided MAC address exists and is valid.
 */
function verifyMAC(event, callback) {
    // Make sure MAC address parameter exists
    if(!event.queryStringParameters.hasOwnProperty("MAC")) {
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "No 'MAC' query string provided. Examine your IoT device for its unique MAC address."
            })
        });
        return false;
    }
    
    // Check if MAC string has correct structure
    if(!config.macRegex.test(event.queryStringParameters.MAC)) {
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "Provided 'MAC' query was invalid. Example: A9:04:22:54:C2:F5. Examine your IoT device for its unique MAC address."
            })
        });
        return false;
    }
    
    return true;
}


// Entry function
exports.handler = (event, context, callback) => {
  if(!verifyMAC(event, callback))
        return;
var table = "Devices";

var macAddress = event.queryStringParameters.MAC;

var params = {
    TableName:table,
    Key:{
         macAddress: macAddress
    },
    // ConditionExpression:"macAddress == :MAC",
    // ExpressionAttributeValues: {
    //     ":MAC": macAddress
    // }
};

console.log("Attempting a conditional delete...");
docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
  console.log(data);
            
            callback(null, {
                        statusCode: 200, // OK
                        headers: {
                            'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
                        },
                        body: JSON.stringify({
                            "message": "Device have been removed."
                        })
                    });
        
        }
});
}