/**
 * Payload Encoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product EM410-RDL
 */
// Chirpstack v4
function encodeDownlink(input) {
    var encoded = milesightDeviceEncode(input.data);
    return { bytes: encoded };
}

// Chirpstack v3
function Encode(fPort, obj) {
    return milesightDeviceEncode(obj);
}

// The Things Network
function Encoder(obj, port) {
    return milesightDeviceEncode(obj);
}

function milesightDeviceEncode(payload) {
    var encoded = [];

    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("timezone" in payload) {
        encoded = encoded.concat(setTimezone(payload.timezone));
    }
    if ("distance_range" in payload) {
        encoded = encoded.concat(setDistanceRange(payload.distance_range.mode, payload.distance_range.min, payload.distance_range.max));
    }
    if ("alarm_counts" in payload) {
        encoded = encoded.concat(setAlarmCounts(payload.alarm_counts));
    }
    if ("radar_temperature_calibration" in payload) {
        encoded = encoded.concat(setRadarTemperatureCalibration(payload.radar_temperature_calibration));
    }
    if ("radar_blind_calibration" in payload) {
        encoded = encoded.concat(setRadarBlindCalibration(payload.radar_blind_calibration));
    }
    if ("distance_calibration" in payload) {
        encoded = encoded.concat(setDistanceCalibration(payload.distance_calibration.enable, payload.distance_calibration.distance));
    }
    if ("distance_mode" in payload) {
        encoded = encoded.concat(setDistanceMode(payload.distance_mode));
    }
    if ("blind_detection_enable" in payload) {
        encoded = encoded.concat(setBlindDetectionEnable(payload.blind_detection_enable));
    }
    if ("recollection_count" in payload && "recollection_interval" in payload) {
        encoded = encoded.concat(setRecollection(payload.recollection_count, payload.recollection_interval));
    }
    if ("signal_quality" in payload) {
        encoded = encoded.concat(setSignalQuality(payload.signal_quality));
    }
    if ("threshold_sensitive" in payload) {
        encoded = encoded.concat(setThresholdSensitive(payload.threshold_sensitive));
    }
    if ("peak_sort" in payload) {
        encoded = encoded.concat(setPeakSort(payload.peak_sort));
    }
    if ("retransmit_config" in payload) {
        encoded = encoded.concat(setRetransmitConfig(payload.retransmit_config.enable, payload.retransmit_config.interval));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history.start_time, payload.fetch_history.end_time));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }

    return encoded;
}

/**
 * reboot device
 * @param {number} reboot values: (0: "no", 1: "yes")
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var reboot_values = [0, 1];
    if (reboot_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + reboot_values.join(", "));
    }

    if (reboot === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * report device status
 * @param {number} report_status values: (0: "no", 1: "yes")
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var report_status_values = [0, 1];
    if (report_status_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of " + report_status_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x28);
    buffer.writeUInt8(report_status);
    return buffer.toBytes();
}

/**
 * set report interval
 * @param {number} report_interval unit: minute, range: [1, 1440]
 * @example { "report_interval": 20 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1 || report_interval > 1440) {
        throw new Error("report_interval must be in range [1, 1440]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set collection interval
 * @param {number} collection_interval unit: second, range: [10, 60]
 * @example { "collection_interval": 300 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }
    if (collection_interval < 10 || collection_interval > 60) {
        throw new Error("collection_interval must be in range [10, 60]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(collection_interval);
    return buffer.toBytes();
}

/**
 * sync time
 * @param {number} sync_time values：(0: "no", 1: "yes")
 * @example { "sync_time": 1 }
 */
function syncTime(sync_time) {
    var sync_time_values = [0, 1];
    if (sync_time_values.indexOf(sync_time) === -1) {
        throw new Error("sync_time must be one of " + sync_time_values.join(", "));
    }

    if (sync_time === 0) {
        return [];
    }
    return [0xff, 0x4a, 0xff];
}

/**
 * set timezone
 * @param {number} timezone
 * @example { "timezone": 8 }
 * @example { "timezone": -4 }
 */
function setTimezone(timezone) {
    if (typeof timezone !== "number") {
        throw new Error("timezone must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbd);
    buffer.writeInt16LE(timezone * 60);
    return buffer.toBytes();
}

/**
 * set distance range
 * @param {number} mode values: (0: "general", 1: "rain", 2: "dust")
 * @param {number} min
 * @param {number} max
 * @example { "distance_range": { "mode": 0, "min": 0, "max": 1000 } }
 */
function setDistanceRange(mode, min, max) {
    var mode_values = [0, 1, 2];
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("distance_range.mode must be one of " + mode_values.join(", "));
    }
    if (typeof min !== "number") {
        throw new Error("distance_range.min must be a number");
    }
    if (typeof max !== "number") {
        throw new Error("distance_range.max must be a number");
    }
    if (min > max) {
        throw new Error("distance_range.min must be less than or equal to distance_range.max");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x1b);
    buffer.writeUInt8(mode);
    buffer.writeUInt16LE(min);
    buffer.writeUInt16LE(max);
    return buffer.toBytes();
}

/**
 * set alarm count
 * @param {number} alarm_counts range: [1, 1000]
 * @example { "alarm_counts": 10 }
 */
function setAlarmCounts(alarm_counts) {
    if (typeof alarm_count !== "number") {
        throw new Error("alarm_counts must be a number");
    }
    if (alarm_count < 1 || alarm_count > 1000) {
        throw new Error("alarm_counts must be in range [1, 1000]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf2);
    buffer.writeUInt16LE(alarm_counts);
    return buffer.toBytes();
}

/**
 * radar temperature calibration
 * @param {number} radar_calibration_type values: (0: "no", 1: "yes")
 * @example { "radar_temperature_calibration": 0 }
 */
function setRadarTemperatureCalibration(radar_temperature_calibration) {
    var radar_temperature_calibration = [0, 1];
    if (radar_temperature_calibration.indexOf(radar_temperature_calibration) === -1) {
        throw new Error("radar_temperature_calibration must be one of " + radar_temperature_calibration.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2a);
    buffer.writeUInt8(radar_temperature_calibration);
    return buffer.toBytes();
}

/**
 * radar blind calibration
 * @param {number} radar_blind_calibration values: (0: "no", 1: "yes")
 * @example { "radar_blind_calibration": 0 }
 */
function setRadarBlindCalibration(radar_blind_calibration) {
    var radar_blind_calibration = [0, 1];
    if (radar_blind_calibration.indexOf(radar_blind_calibration) === -1) {
        throw new Error("radar_blind_calibration must be one of " + radar_blind_calibration.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2a);
    buffer.writeUInt8(radar_blind_calibration);
    return buffer.toBytes();
}

/**
 * calibrate radar distance
 * @param {number} enable values: (0: "disable", 1: "enable")
 * @param {number} distance
 * @example { "distance_calibration": { "enable": 1, "distance": 100 } }
 */
function setDistanceCalibration(enable, distance) {
    var enable_values = [0, 1];
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("distance_calibration.enable must be one of " + enable_values.join(", "));
    }

    if (typeof distance !== "number") {
        throw new Error("distance_calibration.distance must be a number");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xab);
    buffer.writeUInt8(enable);
    buffer.writeUInt16LE(distance);
    return buffer.toBytes();
}

/**
 * distance mode
 * @param {number} distance_mode values: (0: "general", 1: "rain", 2: "dust")
 * @example { "distance_mode": 0 }
 */
function setDistanceMode(distance_mode) {
    var distance_mode_values = [0, 1, 2];
    if (distance_mode_values.indexOf(distance_mode) === -1) {
        throw new Error("distance_mode must be one of " + distance_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x12);
    buffer.writeUInt8(distance_mode);
    return buffer.toBytes();
}

/**
 * blind detection enable
 * @param {number} blind_detection_enable values: (0: "disable", 1: "enable")
 * @example { "blind_detection_enable": 1 }
 */
function setBlindDetectionEnable(blind_detection_enable) {
    var blind_detection_enable_values = [0, 1];
    if (blind_detection_enable_values.indexOf(blind_detection_enable) === -1) {
        throw new Error("blind_detection_enable must be one of " + blind_detection_enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x13);
    buffer.writeUInt8(blind_detection_enable);
    return buffer.toBytes();
}

/**
 * set recollection config
 * @param {number} recollection_count range: [1, 3]
 * @param {number} recollection_interval range: [1, 10]
 * @example { "recollection_count": 3, "recollection_interval": 10 }
 */
function setRecollection(recollection_count, recollection_interval) {
    if (typeof recollection_count !== "number") {
        throw new Error("recollection_count must be a number");
    }
    if (recollection_count < 1 || recollection_count > 3) {
        throw new Error("recollection_count must be in range [1, 3]");
    }
    if (typeof recollection_interval !== "number") {
        throw new Error("recollection_interval must be a number");
    }
    if (recollection_interval < 1 || recollection_interval > 10) {
        throw new Error("recollection_interval must be in range [1, 10]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x1c);
    buffer.writeUInt8(recollection_count);
    buffer.writeUInt8(recollection_interval);
    return buffer.toBytes();
}

/**
 * signal quality
 * @param {number} signal_quality
 * @example { "signal_quality": 10 }
 */
function setSignalQuality(signal_quality) {
    if (typeof signal_quality !== "number") {
        throw new Error("signal_quality must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x14);
    buffer.writeInt16LE(signal_quality);
    return buffer.toBytes();
}

/**
 * threshold sensitive
 * @param {number} threshold_sensitive
 * @example { "threshold_sensitive": 10 }
 */
function setThresholdSensitive(threshold_sensitive) {
    if (typeof threshold_sensitive !== "number") {
        throw new Error("threshold_sensitive must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x15);
    buffer.writeInt16LE(threshold_sensitive * 10);
    return buffer.toBytes();
}

/**
 * set peak sort
 * @param {number} peak_sort values: (0: "latest", 1: "strongest")
 * @example { "peak_sort": 0 }
 */
function setPeakSort(peak_sort) {
    var peak_sort_values = [0, 1];
    if (peak_sort_values.indexOf(peak_sort) === -1) {
        throw new Error("peak_sort must be one of " + peak_sort_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x16);
    buffer.writeUInt8(peak_sort);
    return buffer.toBytes();
}

/**
 * set retransmit config
 * @param {number} enable values: (0: "disable", 1: "enable")
 * @param {number} interval range: [30, 1200], unit: seconds
 * @example { "retransmit_config": { "enable": 1, "interval": 60 } }
 */
function setRetransmitConfig(enable, interval) {
    var enable_values = [0, 1];
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("retransmit_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof interval !== "number") {
        throw new Error("retransmit_config.interval must be a number");
    }
    if (interval < 30 || interval > 1200) {
        throw new Error("retransmit_config.interval must be in range [30, 1200]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0d);
    buffer.writeUInt8(enable);
    buffer.writeUInt16LE(interval);
    return buffer.toBytes();
}

/**
 * data resend interval
 * @param {number} resend_interval unit: second, range: [30, 1200]
 * @example { "resend_interval": 60 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }
    if (resend_interval < 30 || resend_interval > 1200) {
        throw new Error("resend_interval must be in range [30, 1200]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0e);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * history stop transmit
 * @param {number} stop_transmit
 * @example { "stop_transmit": 1 }
 */
function stopTransmit(stop_transmit) {
    var stop_transmit_values = [0, 1];
    if (stop_transmit_values.indexOf(stop_transmit) === -1) {
        throw new Error("stop_transmit must be one of " + stop_transmit_values.join(", "));
    }

    if (stop_transmit === 0) {
        return [];
    }
    return [0xff, 0x6d, 0xff];
}

/**
 * history enable
 * @param {number} history_enable values: (0: "disable", 1: "enable")
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var history_enable_values = [0, 1];
    if (history_enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + history_enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(history_enable);
    return buffer.toBytes();
}

/**
 * fetch history
 * @param {number} start_time
 * @param {number} end_time
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(start_time, end_time) {
    if (typeof start_time !== "number") {
        throw new Error("start_time must be a number");
    }
    if (end_time && typeof end_time !== "number") {
        throw new Error("end_time must be a number");
    }
    if (end_time && start_time > end_time) {
        throw new Error("start_time must be less than end_time");
    }

    var buffer;
    if (end_time === 0) {
        buffer = new Buffer(6);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt32LE(start_time);
    } else {
        buffer = new Buffer(10);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6c);
        buffer.writeUInt32LE(start_time);
        buffer.writeUInt32LE(end_time);
    }

    return buffer.toBytes();
}

function Buffer(size) {
    this.buffer = new Array(size);
    this.offset = 0;

    for (var i = 0; i < size; i++) {
        this.buffer[i] = 0;
    }
}

Buffer.prototype._write = function (value, byteLength, isLittleEndian) {
    for (var index = 0; index < byteLength; index++) {
        var shift = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
        this.buffer[this.offset + index] = (value & (0xff << shift)) >> shift;
    }
};

Buffer.prototype.writeUInt8 = function (value) {
    this._write(value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeInt8 = function (value) {
    this._write(value < 0 ? value + 0x100 : value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeUInt16LE = function (value) {
    this._write(value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeInt16LE = function (value) {
    this._write(value < 0 ? value + 0x10000 : value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeD2DCommand = function (value, defaultValue) {
    if (typeof value !== "string") {
        value = defaultValue;
    }
    if (value.length !== 4) {
        throw new Error("d2d_cmd length must be 4");
    }
    this.buffer[this.offset] = parseInt(value.substr(2, 2), 16);
    this.buffer[this.offset + 1] = parseInt(value.substr(0, 2), 16);
    this.offset += 2;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};
