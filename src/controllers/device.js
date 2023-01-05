const {
  createDevice,
  updateDevice,
  getDevicesForUserId,
  getDeviceById,
  removeDevice,
  findDeviceByKey,
  findDeviceByToken,
} = require("../services/device");

async function listDevices(request, response) {
  try {
    const deviceList = await getDevicesForUserId(request.user.id);

    response.json({
      success: true,
      devices: deviceList,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function getDevice(request, response, next) {
  console.log(`getDevice`, request.user, request.params);

  const foundDevice = await getDeviceById(request.params.deviceId);
  if (!foundDevice) {
    return next(new Error("Device not found"));
  }

  response.json({
    success: true,
    device: foundDevice,
  });
}

async function createDeviceRoute(request, response, next) {
  const { token, name, type, deviceKey, nativeToken } = request.body;
  console.log(`create device push token`, token, name, deviceKey, nativeToken);

  const foundDevice = await findDeviceByToken(request.user.id, token);
  if (foundDevice) {
    return response.json({
      success: false,
      message: "Device already exists",
    });
  }

  try {
    const deviceResult = await createDevice({
      token,
      name, // include name on create
      type,
      deviceKey,
      userId: request.user.id,
      nativeToken: JSON.stringify(nativeToken),
    });

    response.json({
      success: true,
      device: deviceResult,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function updateDeviceByKey(request, response, next) {
  const { name } = request.body;
  console.log(`update device push token`, request.params.deviceKey, name);

  const foundDevice = await findDeviceByKey(
    request.user.id,
    request.params.deviceKey
  );

  if (foundDevice) {
    const deviceResult = await updateDevice(foundDevice.id, { name });
    return response.json({
      success: true,
      device: deviceResult,
    });
  }

  response.json({
    success: false,
    message: "Device not found",
  });
}

async function updateDeviceById(request, response, next) {
  const { token, name } = request.body;
  console.log(`update device, ${token}, ${name}`);

  const updatePayload = {
    token: token,
  };
  if (name) {
    updatePayload.name = name;
  }

  const foundDevice = await getDevice(request.params.deviceId);
  if (!foundDevice) {
    return next(new Error("Device not found"));
  }

  const deviceResult = await updateDevice(updatePayload);
  response.json({
    success: true,
    device: deviceResult,
  });
}

async function deleteDevice(request, response, next) {
  console.log(
    `delete device, ${request.params.deviceId}, ${request.body.name}`
  );

  const deletedDevice = await removeDevice(request.params.deviceId);
  response.json({
    success: true,
    device: deletedDevice,
  });
}

module.exports = {
  listDevices,
  getDevice,
  createDeviceRoute,
  updateDeviceById,
  updateDeviceByKey,
  deleteDevice,
};
