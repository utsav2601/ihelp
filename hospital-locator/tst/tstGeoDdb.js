const AWS = require('aws-sdk');
const ddbGeo = require('dynamodb-geo');
const REGION = "us-west-2";
var cryptoJs = require('crypto-js')


const akk = "AKIA3JLM5U5LID3ZBTOD"
const skk = "6WW1h1174KOFJeqdcgSZ1USJUsdIbro3yC7BNUTO"
const DDB_HOST = 'http://localhost:3005';
const TstTableName = "TST_LOCATION_TBL_3"

/*Prod
AWS.config.update({
    region: REGION,
    accessKeyId: akk,
    secretAccessKey: skk,
})
const ddb = new AWS.DynamoDB({
    endpoint: new AWS.Endpoint() 
})
*/


//Local
AWS.config.update({
    region: REGION,
})
const ddb = new AWS.DynamoDB({
    //endpoint: new AWS.Endpoint(DDB_HOST)  //Uncomment if testing in local and don't want to create table in aws account
})
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, TstTableName);
config.longitudeFirst = true;
config.hashKeyLength = 5;
TstTableManager = new ddbGeo.GeoDataManager(config);

async function TableExists(tableName) {
    const params = { TableName: tableName };
     return new Promise((resolve, reject)=> {
       ddb.describeTable(params, function(err, data){
            if (err) {
                reject(false)
            } else {
                resolve(true)
            }
       })
   })
 
}

async function CreateTable() {
    const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(config);
    // Tweak the schema as desired
    createTableInput.ProvisionedThroughput.ReadCapacityUnits = 2;
    console.log('Creating ddb table with default schema:');
    //console.dir(createTableInput, { depth: null });
    // Create the table

    await ddb.createTable(createTableInput).promise()
        // Wait for it to become ready
        .then(function () { return ddb.waitFor('tableExists', { TableName: config.tableName }).promise() })
        .then(function () { console.log('Table created: ', config.tableName, 'and ready!') });
}

function getUniqueKey(lat, long) {
    //create some unique key here
    //var UUID ='1@2!3$5^6&i.help<>me!' 
    //hash = crypto.createHash('md5').update(lat.toString() + long.toString() ).digest("hex")
    word = lat.toString() + long.toString()
    hash = cryptoJs.SHA256(word).toString()
    return hash
}

async function InsertIntoTable(req) {
    await TstTableManager.putPoint({
        RangeKeyValue: { S: getUniqueKey(req["lat"], req["long"]) }, // Use this to ensure uniqueness of the hash/range pairs.
        GeoPoint: { // An object specifying latitutde and longitude as plain numbers. Used to build the geohash, the hashkey and geojson data
            latitude: req["lat"],
            longitude: req["long"]
        },
        PutItemInput: { // Passed through to the underlying DynamoDB.putItem request. TableName is filled in for you.
            Item: { // The primary key, geohash and geojson data is filled in for you
                name_english: { S: 'TST_HOSPITAL_AAA' }, // Specify attribute values using { type: value } objects, like the DynamoDB API.
                name_hindi: { S: '' },
                total_beds: { S: '100' },
                available_beds: { S: '10' },
                isolation_beds: { S: '90' },
                oxygen_supported: { S: 'yes' },
                reserved_icu_hdu: { S: '0' },
                access: { S: 'free' },
                street_address: { S: 'xyz street' },
                city: { S: 'fremont' },
                zip: { S: '94538' },
                country: { S: 'India' },
                url: { S: 'covid.com' },
                point_of_interest: { S: 'hospital' },
                operational: { S: 'true' },
            },
            // ... Anything else to pass through to `putItem`, eg ConditionExpression
        }
    })
        .promise()
        .then(res => {
            console.log("Success: Insert into db: ", res)
        })
        .catch(err => {
            console.log("Error: Insert failed ", err)
        })

}

function UpdateTable(req) {
    if (req.hasOwnProperty("update")) {
        var _update = req.update

        if (_update.hasOwnProperty('hospitalName_EN')) {
            _expression = 'SET name_english = :newVal, updated_at= :updatedAt'
            _newVal = _update["hospitalName_EN"]
            _updatedAt = String(new Date());
            _req = {
                lat: req["lat"],
                long: req["long"],
                updateExpression: _expression,
                newVal: _newVal,
                updatedAt: _updatedAt
            }
            UpdateTablePoint(_req)
        }
        //Add more specific items to be udpated here, add a for loop to be iterated over all "updates" key
    }
}

async function UpdateTablePoint(req) {
    await TstTableManager.updatePoint({
        RangeKeyValue: { S: getUniqueKey(req["lat"], req["long"]) },
        GeoPoint: { // An object specifying latitutde and longitude as plain numbers.
            latitude: req["lat"],
            longitude: req["long"]
        },
        UpdateItemInput: { // TableName and Key are filled in for you
            UpdateExpression: req.updateExpression,
            ExpressionAttributeValues: {
                ':newVal': { S: req["newVal"] },
                ':updatedAt': { S: req["updatedAt"] }
            }
        }
    }).promise()
        .then(res => {
            console.log("Success: Updated db: ", res)
        })
        .catch(err => {
            console.log("Error: updated failed ", err)
        })
}

async function QueryWithinRadius(req) {
    const result = await TstTableManager.queryRadius({
        RadiusInMeter: req["radius"],
        CenterPoint: {
            latitude: req["lat"],
            longitude: req["long"]
        }
    })
    console.log("QueryWithinRadius results " , result)
}

async function ListTables() {
    await ddb.listTables(function (err, data) {
        if (err) {
            console.log("Error listing tables ", err)
        }
        if (data) {
            console.log("Listing Tables: ", data)
        }

    }).promise()
}

async function DeleteTable(tableName) {
    await ddb.deleteTable({ TableName: tableName }, function (err, data) {
        if (err) {
            console.log("Error deleting tables ", err)
        }
        if (data) {
            console.log("Deleted Table: ", data)
        }
    })
}

async function ListItems(tableName) {
    const res = await ddb.scan({ TableName: tableName }, function (err, data) {
        if (err) {
            console.log("Error deleting tables ", err)
        }
        if (data) {
            console.log("List items in table", data)
        }
    })

}

async function startTest() {
    if (!(await TableExists(TstTableName))) {
        console.log('Table doesnt exist creating new table')
        CreateTable()
    } else {
        console.log('Table already exist')
    }
    //delhi
    lat = 28.704060
    long = 77.102493
    //Insert into TstTableName defined by config
    insertReq = {
        "lat": lat,
        "long": long,
    }
    await InsertIntoTable(insertReq)

    //List all tables
    await ListTables()

    updateReq = {
        "lat": lat,
        "long": long,
        "update": {
            hospitalName_EN: "TST_HOSPITAL_ZZZ"
        }
    }
    await UpdateTable(updateReq)

    //List all entries in table
    await ListItems(TstTableName)

    queryReq = {
        "lat": lat,
        "long": long,
        "radius": 100000 //ie 100kms,
    }
    console.log("QueryWithinRadius should not be empty")
    await QueryWithinRadius(queryReq) //Should result success


    queryReq = {
        "lat": 27.1763098,
        "long": 77.9099723,
        "radius": 100000 //ie 100kms
    }
    console.log("QueryWithinRadius should be empty")
    await QueryWithinRadius(queryReq) //Should result nil

    queryReq = {
        "lat": 27.1763098,
        "long": 77.9099723,
        "radius": 500000 //ie 100kms
    }
    console.log("QueryWithinRadius should not be empty")
    await QueryWithinRadius(queryReq) //Should result success
    
    //Clean Table
    await DeleteTable(TstTableName)

    //TODOS: implement batchWritePoints
}

async function tstGeoDdb() {
    console.log("Testing geodb apis")
    await startTest()
}


module.exports = {
    tstGeoDdb
}
