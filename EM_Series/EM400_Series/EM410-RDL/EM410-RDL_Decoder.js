/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product EM410-RDL
 */
// Chirpstack v4
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

// Chirpstack v3
function Decode(fPort, bytes) {
    return milesightDeviceDecode(bytes);
}

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}

function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // DEVICE STATUS
        if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = bytes[i];
            i += 1;
        }
        // IPSO VERSION
        else if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // BATTERY
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = readUInt8(bytes[i]);
            i += 1;
        }
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // DISTANCE
        else if (channel_id === 0x04 && channel_type === 0x82) {
            decoded.distance = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // POSITION
        else if (channel_id === 0x05 && channel_type === 0x00) {
            decoded.position = readPositionStatus(bytes[i]);
            i += 1;
        }
        // DISTANCE ALARM
        else if (channel_id === 0x84 && channel_type === 0x82) {
            var data = {};
            data.distance = readUInt16LE(bytes.slice(i, i + 2));
            data.distance_alarm = readDistanceAlarm(bytes[i + 2]);
            i += 3;

            decoded.distance = data.distance;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // DISTANCE MUTATION ALARM
        else if (channel_id === 0x94 && channel_type === 0x82) {
            var data = {};
            data.distance = readUInt16LE(bytes.slice(i, i + 2));
            data.distance_mutation = readInt16LE(bytes.slice(i + 2, i + 4));
            data.distance_alarm = readDistanceAlarm(bytes[i + 4]);
            i += 5;

            decoded.distance = data.distance;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // DISTANCE EXCEPTION ALARM
        else if (channel_id === 0xb4 && channel_type === 0x82) {
            var data = {};
            data.distance = readUInt16LE(bytes.slice(i, i + 2));
            data.distance_exception = readDistanceException(bytes[i + 2]);
            i += 3;

            decoded.distance = data.distance;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HISTORY
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var distance_value = readUInt16LE(bytes.slice(i + 4, i + 6));
            var temperature_value = readUInt16LE(bytes.slice(i + 6, i + 8));
            var mutation = readInt16LE(bytes.slice(i + 8, i + 10));
            var event_value = readUInt8(bytes[i + 10]);

            var data = {};
            data.timestamp = timestamp;
            if (distance_value === 0xfffd) {
                data.distance_exception = "No Target";
            } else if (distance_value === 0xffff) {
                data.distance_exception = "Sensor Exception";
            } else if (distance_value === 0xfffe) {
                data.distance_exception = "Disabled";
            } else {
                data.distance = distance_value;
            }

            if (temperature_value === 0xfffe) {
                data.temperature_exception = "Disabled";
            } else if (temperature_value === 0xffff) {
                data.temperature_exception = "Sensor Exception";
            } else {
                data.temperature = readInt16LE(bytes.slice(i + 6, i + 8)) / 10;
            }

            var event = readHistoryEvent(event_value);
            if (event.length > 0) {
                data.event = event;
            }
            if (event.indexOf("Mutation Alarm") !== -1) {
                data.distance_mutation = mutation;
            }
            i += 11;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readTslVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readLoRaWANClass(type) {
    switch (type) {
        case 0:
            return "ClassA";
        case 1:
            return "ClassB";
        case 2:
            return "ClassC";
        case 3:
            return "ClassCtoB";
    }
}

function readPositionStatus(status) {
    switch (status) {
        case 0:
            return "Normal";
        case 1:
            return "Tilt";
        default:
            return "Unknown";
    }
}

function readDistanceAlarm(status) {
    switch (status) {
        case 0:
            return "Threshold Alarm Release";
        case 1:
            return "Threshold Alarm";
        case 2:
            return "Mutation Alarm";
        default:
            return "Unknown";
    }
}

function readDistanceException(status) {
    switch (status) {
        case 0:
            return "Blind Spot Alarm Release";
        case 1:
            return "Blind Spot Alarm";
        case 2:
            return "No Target";
        case 3:
            return "Sensor Exception";
        default:
            return "Unknown";
    }
}

function readHistoryEvent(status) {
    var event = [];

    if (((status >>> 0) & 0x01) === 0x01) {
        event.push("Threshold Alarm");
    }
    if (((status >>> 1) & 0x01) === 0x01) {
        event.push("Threshold Alarm Release");
    }
    if (((status >>> 2) & 0x01) === 0x01) {
        event.push("Blind Spot Alarm");
    }
    if (((status >>> 3) & 0x01) === 0x01) {
        event.push("Blind Spot Alarm Release");
    }
    if (((status >>> 4) & 0x01) === 0x01) {
        event.push("Mutation Alarm");
    }
    if (((status >>> 5) & 0x01) === 0x01) {
        event.push("Tilt Alarm");
    }

    return event;
}
