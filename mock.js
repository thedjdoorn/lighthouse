
let MockController = function(devices, config) {
    this.devices = devices;
    this.connections = [];
    for (let group of this.devices) {
        for(let d of group.devices){
            this.connections.push(new Device(d.name, d.address, d.device));
        }
    }

    /**
     *
     * @param {Device} d Device to turn on
     */
    this.turnOn = function (d) {
        console.log(d)
        console.log(`Device ${d.name} is now on`);
        d.on = true;
    };

    /**
     *
     * @param {Device} d to turn off
     */
    this.turnOff = function (d) {
        console.log(`Device ${d.name} is now off`);
        d.off = true;
    };

    /**
     *
     * @param {Device} device Device to turn on or off
     */
    this.switch = function (d) {
        d.on = !d.on;
        console.log(`Device ${d.name} is now ${d.on? 'on' : 'off'}`)
    };

    /**
     *
     * @param {Device} connection device to dim
     * @param {number} level Level to dim to
     */
    this.dim = function (connection, level) {
        connection.intensity = level;
        console.log(`Brightness of device ${connection.name} is now ${connection.intensity}`)
    };
    /**
     *
     * @param {string} name friendly name for the new device
     * @param {boolean} auto whether the adding should go automatically
     * @param {number|string} address address for the new device
     * @param {number} device device number
     */
    this.add = function (name, auto, address, device) {
        let pair = this.getUniquePair();
        address = address || pair[0];
        device = device || pair[0];
        if (auto) {
            console.log(`Auto pairing new device...`)
        }
        const result = new Device(name, address, device);
        this.connections.push(result);
        console.log(`New device ${name} on ${address}/${device} is now available`)
        return result;
    };

    this.getUniquePair = function () {
        while (true) {
            let address = Math.round(Math.random() * 25);
            let device = Math.round(Math.random() * 25);
            if (this.connections.filter(d => {
                return d.address === address
                    && d.device === device;
            }).length === 0) {
                return [address, device];
            }
        }
    };

    this.remove = function(address, device){
        for(let i in this.connections){
            let c = this.connections[i];
            if(c.is(address) || c.is(device)){
                this.connections.splice(i)
            }
        }
    };

    this.getDevices = function(){
        return this.connections;
    };

    /**
     *
     * @param address
     * @param device
     */
    this.getDevice = function(address, device){
        return this.connections.filter(d => d.is(device) || d.is(address))[0];
    }
};

// Device class
/**
 * @param {string} name a friendly name for the device
 * @param {string|number} address Address identifier the device listens on
 * @param {number} device Device number the device listens on
 */
class Device {

    constructor(name, address, device) {
        this.name = name;
        this.address = address;
        this.device = device;
        this.on = false;
        this.intensity = 7;
    }

    is(entity) {
        return this.address === entity || this.device === entity;
    };
}
module.exports = MockController;
