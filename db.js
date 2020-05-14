const low = require('lowdb');
const fs = require('lowdb/adapters/FileSync');


function DBController() {
    this.file = new fs('data.json');
    this.db = low(this.file);
    this.db.defaults({groups: [], users: []}).write();

    this.addDevice = function (device, address, name, group) {
        return this.db.get('groups').find({name: group}).get('devices').push({
            id: require('crypto').randomBytes(16).toString('hex'),
            name: name,
            device: device,
            address: address
        }).write();
    };

    this.removeDevice = function (id) {
        return this.db.get('groups').get('devices')
            .remove({id})
            .write()
    };

    this.getDevices = function () {
        return this.db.get('groups')
            .value();
    };

    this.getDeviceByPair = function (address, device) {
        return this.db.get('groups').get('devices').find({
            address,
            device
        }).value();
    };

    this.getDeviceById = function (id) {
        console.log(id)
        let allDevices = [];
        for(let g of this.getDevices()){
            allDevices.push(...g.devices);
        }
        console.log(allDevices)
        let result =  allDevices.filter(d => d.id === id)[0]
        console.log(result);
        return result
    };

    this.getGroup = function (group) {
        return this.db.get('groups').find({name: group})
            .value();
    };

    this.addGroup = function (group) {
        return this.db.get('groups').push({
            name: group,
            devices: []
        }).write();
    };

    this.removeGroup = function (group) {
        return this.db.get('groups')
            .remove({name:group})
            .write();
    };

    this.changeGroup = function(id, newGroup) {
        let devData = this.getDeviceById(id);
        this.removeDevice(id);
        this.addDevice(devData.device, devData.address, devData.name, newGroup);
    };

    this.login = function (username, password) {
        return this.db.get('users').find({username, password}).value();
    }

}
module.exports = DBController;
