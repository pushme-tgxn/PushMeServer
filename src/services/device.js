const { Expo } = require("expo-server-sdk");
// const expo = new Expo();

const { v4: uuidv4 } = require("uuid");
const { Device } = require("../../models/index.js");

const createDevice = async (createDeviceData) => {
  console.log("createDevice", createDeviceData);

  // add new device identifier
  if (createDeviceData.deviceKey == undefined) {
    createDeviceData.deviceKey = uuidv4();
  }

  if (!Expo.isExpoPushToken(createDeviceData.token)) {
    console.error(
      `Push token ${createDeviceData.token} is not a valid Expo push token`
    );
    throw new Error(
      `Push token ${createDeviceData.token} is not a valid Expo push token`
    );
  }

  console.log("createDevice", createDeviceData);
  const created = await Device.create(createDeviceData);
  return created;
};

const updateDevice = async (id, deviceData) => {
  console.log("updateDevice", deviceData);

  const updated = await Device.update(deviceData, {
    where: { id },
  });
  return updated;
};

const getDevicesForUserId = async (userId) => {
  console.log(`listDevices`, userId);

  const devices = await Device.scope({
    method: ["byUser", userId],
  }).findAll();
  return devices;
};

const getDeviceById = async (deviceId) => {
  console.log(`getDevice`, deviceId);

  const device = await Device.scope("withTopics").findByPk(deviceId);
  return device;
};

const removeDevice = async (deviceId) => {
  console.log(`removeDevice`, deviceId);

  const removed = await Device.destroy({ where: { id: deviceId } });
  return removed;
};

const findDeviceByKey = async (userId, deviceKey) => {
  const device = await Device.findOne({ where: { userId, deviceKey } });
  return device;
};

const findDeviceByToken = async (userId, pushToken) => {
  const device = await Device.findOne({ where: { userId, token: pushToken } });
  return device;
};

module.exports = {
  createDevice,
  updateDevice,
  getDevicesForUserId,
  getDeviceById,
  removeDevice,
  findDeviceByKey,
  findDeviceByToken,
};