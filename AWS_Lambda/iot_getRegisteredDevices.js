const doc = require('aws-sdk');
const docClient = new doc.DynamoDB.DocumentClient({
    region: 'us-east-1'
});

// Entry function
// Returns mac addresses only
exports.handler = (event, context, callback) => {    
    // Scan for unregistered devices
    docClient.scan({
        TableName: "Devices",
        ProjectionExpression: "macAddress, #n, #o, #u",
        FilterExpression: "isRegistered = :f",
        ExpressionAttributeValues: {
            ":f": true
        },
        ExpressionAttributeNames : {
            "#n": "name",
            "#o": "owner", 
            "#u": "updateInterval"
        }
    }, (err, data) => {
       if(err) {
           context.fail(err);
           return;
       }
       
       // Return all devices that were found
       callback(null, {
           statusCode: 200, // OK
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(data.Items)
       });
    });
};
