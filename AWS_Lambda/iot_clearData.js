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
        
    const macAddress = event.queryStringParameters.MAC.toUpperCase();
        let UpdateExpression= "set #d = :u";
        let ExpressionAttributeValues={":u": []};

   
     var params= {
    TableName: 'Devices',
    Key:{
        "macAddress": macAddress,
    },
    UpdateExpression: UpdateExpression,
     ExpressionAttributeValues:ExpressionAttributeValues,
     ExpressionAttributeNames:{
    "#d": "data"
  },
    ReturnValues:"UPDATED_NEW"
    
    };

docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            callback(null, {
                statusCode: 200, // Added
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
                },
                body: JSON.stringify({
                    message: "Device data cleared!",
                    data: params,
                })
            });
    }
});

   
    
}