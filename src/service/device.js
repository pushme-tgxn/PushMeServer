const { Expo } = require("expo-server-sdk");
// const expo = new Expo();

const { Device } = require("../../models/index.js");

const createDevice = async (createDeviceData) => {
  console.log("createDevice", createDeviceData);

  if (!Expo.isExpoPushToken(createDeviceData.token)) {
    console.error(
      `Push token ${createDeviceData.token} is not a valid Expo push token`
    );
    throw new Error(
      `Push token ${createDeviceData.token} is not a valid Expo push token`
    );
  }

  const created = await Device.create(createDeviceData);
  return created;
};

const updateDevice = async ({ token, name }) => {
  console.log("updateDevice", token, name);

  if (!Expo.isExpoPushToken(token)) {
    console.error(`Push token ${token} is not a valid Expo push token`);
    throw new Error(`Push token ${token} is not a valid Expo push token`);
  }

  const updated = await Device.update(
    { token, name },
    {
      where: { token: token },
    }
  );
  return updated;
};

const listDevices = async (userId) => {
  console.log(`listDevices`, userId);

  const devices = await Device.scope({
    method: ["byUser", userId],
  }).findAll();
  return devices;
};

const getDevice = async (deviceId) => {
  console.log(`getDevice`, deviceId);

  const device = await Device.scope("withTopics").findByPk(deviceId);
  return device;
};

const removeDevice = async (deviceId) => {
  console.log(`removeDevice`, deviceId);

  const removed = await Device.destroy({ where: { id: deviceId } });
  return removed;
};

const findDeviceByToken = async (pushToken) => {
  const device = await Device.findOne({ where: { token: pushToken } });
  return device;
};

module.exports = {
  createDevice,
  updateDevice,
  listDevices,
  getDevice,
  removeDevice,
  findDeviceByToken,
};
