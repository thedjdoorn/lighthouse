const DataBaseController = require('./db');
const DeviceController = require('./devices');
const MockController = require('./mock');
const fs = require('fs');
const crypto = require('crypto');
const ipinfo = require('ipinfo');
const suntimes = require('suntimes');
const express = require('express');
const jwt = require('jsonwebtoken');

let config = {
    pin:11,

};

let DBController = new DataBaseController();
// let DevController = DeviceController(DBController.getDevices());
let DevController = new MockController(DBController.getDevices());


let app = express();
let bodyParser = require('body-parser');

let signature = crypto.randomBytes(256).toString('hex');
app.use('/',checkUser);
app.use(bodyParser.json());
app.post('/login', (req, res) => {
    let auth = DBController.login(req.body.username, req.body.password);
    if (DBController.login(req.body.username, req.body.password)){
        token = jwt.sign({username:req.body.username}, signature);
        res.send(token);
    } else {
        res.status(401);
        res.send('{"error":"Invalid username or password"}');
    }
});

//get devices
app.get('/device', (req, res) => {
    let groups = DBController.getDevices();
    let connections = DevController.getDevices();
    for(let group of groups){
        for(let d of group.devices){
            let c = connections.filter(cs => {return cs.is(d.device) || cs.is(d.address)})[0];
            d.brightness = c.intensity;
            d.on = c.on;
        }
    }
    res.send(groups);
});

//add device
app.post('/device', (req,res) => {
    if((!req.body.address && !req.body.device && !req.body.auto) || !req.body.name || !req.body.group){
        return res.status(400).send()
    }
    if(req.body.address && req.body.device && DBController.getDeviceByPair(req.body.address, req.body.device)){
        return res.status(409).send();
    }
    let d = DevController.add(req.body.name, req.body.auto, req.body.address, req.body.device);
    let devices = DBController.addDevice(d.device, d.address, d.name, req.body.group);
    res.send(devices)
});

//remove device
app.delete('/device/:id',  (req, res) => {
    let device = DBController.getDeviceById(req.params.id);
    if(!device){
        return res.status(404).send()
    }
    DevController.remove(device.address, device.device);
    DBController.removeDevice(req.params.id);
    res.send();
});

//device action
app.put('/device/:id', (req,res) => {
    console.dir(req.body);
    let deviceEntity = DBController.getDeviceById(req.params.id);
    console.dir(deviceEntity)
    let device = DevController.getDevice(deviceEntity.address, deviceEntity.device);
    if(!device){

    }
    if(req.body.action === 'BRIGHTNESS') {
        switch (req.body.value) {
            case 'BRIGHTEN':
                DevController.dim(device, device.intensity + 1);
                break;
            case 'DIM':
                DevController.dim(device, device.intensity - 1);
                break;
            default:
                DevController.dim(device, req.body.value);
        }
        return res.send();
    } else if (req.body.action === 'POWER'){
        req.body.value === 1? DevController.turnOn(device):DevController.turnOff(device)
        return res.send();
    } else if(req.body.action === 'GROUP'){
        DBController.changeGroup(req.params.id, req.body.value);
        return res.send();
    } else {
        return res.status(412).send();
    }
});

//get a group
app.get('/group/:name', (req,res) => {
    let connections = DevController.getDevices();
    let group = DBController.getGroup(req.params.name);
    if(!group){
        return res.status(404).send("group not found")
    }
    for(d of group.devices){
        let c = connections.filter(cs => {return cs.is(d.device) || cs.is(d.address)})[0];
        d.brightness = c.intensity;
        d.on = c.on;
    }
    res.send(group);
});

//add group
app.post('/group', (req,res) => {
    if(!req.body.name){
        return res.status(400).send();
    }
    if(DBController.getGroup(req.body.name)){
        res.status(409).send();
    }
    DBController.addGroup(req.body.name);
    let result = DBController.getGroup(req.body.name);
    res.send(result);
});

//remove group
app.delete('/group/:name', (req,res) => {
    let group = DBController.getGroup(req.params.name);
    if(!group){
        res.status(404).send()
    }
    DBController.removeGroup(req.params.name);
    res.send();
});

function checkUser(req, res, next) {
    if (req.path === '/login') return next();
    if(!req.header('Authorization')){return res.status(403).send()}
    const token = req.header('Authorization').split(' ')[1];
    jwt.verify(token, signature, {}, (data, err) => {
        if(err){
            console.error(token);
            return res.status(403).send()
        }
        req.user = data;
        next();
    })
}

app.listen(3000);
