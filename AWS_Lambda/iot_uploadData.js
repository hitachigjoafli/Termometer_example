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
    
    var values = {};
    // Check if body exists
    if(event.body) {
        const body = JSON.parse(event.body);
        
        // Make sure values are not empty
        if(Object.keys(event.body) === 0) {
            console.error("No values.");
            callback(null, {
                statusCode: 400, // Bad Request
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "No values were specified. Example keys: 'temperature', 'humidity', 'co2'"
                })
            });
        }

        // Check that all values are numbers
        Object.entries(event.body).forEach((key, value) => {
            if(event.body.hasOwnProperty(key) && typeof value !== "number") {
                console.error(`Non-number value '${key}'`);
                callback(null, {
                    statusCode: 400, // Bad Request
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Value specified in '${key}' was not a number.`
                    })
                });
            }
        });

        values = body;
    }
    else {
        console.error("No body in request.");
        callback(null, {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "The request did not contain a body. Please specify update interval as a number with key 'interval'."
            })
        });
        return;
    }

    values.time = Math.floor(Date.now() / 1000);

    // Capitalize to avoid case sensitivity
    const macAddress = event.queryStringParameters.MAC.toUpperCase();
    
    console.log(`Adding data for device with MAC address "${macAddress}"...`);
    
    docClient.get({
        TableName: "Devices",
        Key: {
            macAddress: macAddress
        },
        ProjectionExpression: "macAddress, updateInterval"
    }, (err, data) => {
        if(err) {
            callback(err, {
                statusCode: 500, // Internal Server Error
                headers: {
                    'Content-Type': 'application/json'
                },
                body: "An internal database query has failed."
            });
            return;
        }
        
        // If device is known
        if(data.hasOwnProperty("Item")) {
            console.info("Device found.");

            docClient.update({
                TableName: "Devices",
                Key: {
                    macAddress: macAddress
                },
                UpdateExpression: "set #d = list_append(#d, :v)",
                ExpressionAttributeNames: {
                    "#d": "data"
                },
                ExpressionAttributeValues: {
                    ":v": [values]
                }
            }, (err, data) => {
                if(err) {
                    callback(err, {
                        statusCode: 500, // Internal Server Error
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "message": "An internal database write has failed."
                        })
                    });
                    return;
                }

                docClient.update({
                    TableName: "Devices",
                    Key: {
                        macAddress: macAddress
                    },
                    UpdateExpression: "set latestData = :v",
                    ExpressionAttributeValues: {
                        ":v": values
                    }
                }, (err, data) => {
                    if(err) {
                        callback(err, {
                            statusCode: 500, // Internal Server Error
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "message": "An internal database write has failed."
                            })
                        });
                        return;
                    }
                    
                    callback(null, {
                        statusCode: 200, // OK
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "message": "Device data successfully uploaded."
                        })
                    });
                });
            });
        }
        else {
            console.error("No device found.");
            callback(null, {
                statusCode: 404, // Not Found
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "Device not found."
                })
            });
        }
    });
};
