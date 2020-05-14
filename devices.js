const KlikAanKlikUit = require('kaku-rpi');

let DeviceController = function(devices, config) {
    this.kaku = KlikAanKlikUit(config.pin, config.periodusec, config.repeats, config.pulsewidth);
    this.devices = devices;
    this.connections = [];
    for (let d of this.devices) {
        this.connections.push(new Device(d.name, d.address, d.device));
        this.kaku.dim(d.addr);
        this.kaku.off(d.address, d.device)
    }

    /**
     *
     * @param {string} name Device to turn on
     */
    this.turnOn = function (name) {
        for (let d of this.connections) {
            if (d.is(name)) {
                this.kaku.on(d.address, d.device);
                d.on = true;
                return;
            }
        }
    };

    /**
     *
     * @param {string} name Device to turn off
     */
    this.turnOff = function (name) {
        for (let d of this.connections) {
            if (d.is(name)) {
                this.kaku.off(d.address, d.device);
                d.off = true;
                return;
            }

        }
    };

    /**
     *
     * @param {string} name Device to turn on or off
     */
    this.switch = function (name) {
        for (let d of this.connections) {
            if (d.is(name)) {
                if (d.on) {
                    this.kaku.off(d.address, d.device)
                } else {
                    this.kaku.on(d.address, d.device)
                }
                d.on = !d.on;
            }
        }
    };

    /**
     *
     * @param {string} name Name of the device to dim
     * @param {number} level Level to dim to
     */
    this.dim = function (name, level) {
        for (let d of this.connections) {
            if (d.is(name)) {
                this.kaku.dim(d.address, d.device, level);
                d.intensity = level;
            }
        }
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
            this.kaku.on(address, pair);
        }
        let result = new Device(name, address, device);
        this.connections.push(result);
        this.kaku.dim(address, device, 7);
        this.kaku.off(address, device);
        return result
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
};

// Device class
/**
 * @param {string} name a friendly name for the device
 * @param {string|number} address Address identifier the device listens on
 * @param {number} device Device number the device listens on
 */
function Device(name, address, device){
    this.name = name;
    this.address = address;
    this.device = device;
    this.on = false;
    this.intensity = 7;
}
Device.is = function(entity){
    return this.address === entity || this.device === entity;
};

module.exports = DeviceController;
