const express = require('express');
const bodyParser = require('body-parser');
const SensorData = require('./sequelize');
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const schedule = require('node-schedule');
const moment = require('moment');
const firebase = require('firebase-admin');

var config = {
    apiKey: "AIzaSyDnWtrvXWUPMCF-qBdam-jr8Q8XKEkH3Ds",
    authDomain: "wellnest-39396.firebaseapp.com",
    databaseURL: "https://wellnest-39396.firebaseio.com",
    projectId: "wellnest-39396",
    storageBucket: "wellnest-39396.appspot.com",
    messagingSenderId: "929248141108",
    credential: {
        getAccessToken: () => ({
            expires_in: 0,
            access_token: '',
        }),
    }
};
firebase.initializeApp(config);

var db = firebase.database();
var temperatureRoot = db.ref("/temperature");
var brightnessRoot = db.ref("/brightness");
var airQualityRoot = db.ref("/air_quality");
var soundLevelRoot = db.ref("/sound_level");

const app = express()
app.use(bodyParser.json())

// get last 100 sensorData
app.get('/', (req, res) => {
    res.send("<h1>WellNest API is running</h1></br><ul><li><a href='/api/sensorData'>Last 100 sensors records</a></li></ul>");
})

// get last 100 sensorData
app.get('/api/sensorData', (req, res) => {
    SensorData.findAll({ limit: 100, order: [ ['createdAt', 'DESC'] ] }).then(sensorDatas => res.json(sensorDatas))
})

var job = schedule.scheduleJob('*/2 * * * *', function(){
    //console.log('Job executed at ' + moment().format('LLLL'));

    SensorData.findAll({
        where: {
            createdAt: {
            [Op.gt]: new Date(new Date() - 120)
            }
        }
    }).then(function(sensorDatas){
        //console.log(JSON.stringify(sensorDatas, null, 4));
        
        for(let sensorData of ex){     
            switch (sensorData.sensorName) {
                case 'TMP':
                    temperatureRoot.child("/N"+sensorData.nodeID).push({
                        "timestamp": new Date(sensorData.createdAt).getTime(),
                        "value" : sensorData.sensorValue
                    });
                    break;

                case 'LGT':
                    brightnessRoot.child("/N"+sensorData.nodeID).push({
                        "timestamp": new Date(sensorData.createdAt).getTime(),
                        "value" : sensorData.sensorValue
                    });
                    break;

                case 'AIR':
                    airQualityRoot.child("/N"+sensorData.nodeID).push({
                        "timestamp": new Date(sensorData.createdAt).getTime(),
                        "value" : sensorData.sensorValue
                    });
                    break;

                case 'SND':
                    soundLevelRoot.child("/N"+sensorData.nodeID).push({
                        "timestamp": new Date(sensorData.createdAt).getTime(),
                        "value" : sensorData.sensorValue
                    });
                    break;

                default:
                    break;
            }
        }
    });

});

const port = 8080
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`)
})