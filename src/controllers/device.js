const {
  createDevice,
  updateDevice,
  getDevicesForUserId,
  getDeviceById,
  removeDevice,
  findDeviceByKey,
  findDeviceByToken,
} = require("../services/device");

const { appLogger } = require("../middleware/logging.js");

async function listDevices(request, response, next) {
  try {
    const deviceList = await getDevicesForUserId(request.user.id);

    response.json({
      success: true,
      devices: deviceList,
    });
  } catch (error) {
    next(error);
  }
}

async function getDevice(request, response, next) {
  try {
    appLogger.debug(`getDevice`, request.user, request.params);

    const foundDevice = await getDeviceById(request.params.deviceId);
    if (!foundDevice) {
      return next(new Error("Device not found"));
    }

    response.json({
      success: true,
      device: foundDevice,
    });
  } catch (error) {
    next(error);
  }
}

async function createDeviceRoute(request, response, next) {
  try {
    const { token, name, type, deviceKey, nativeToken } = request.body;
    appLogger.debug(`create device push token`, token, name, deviceKey, nativeToken);

    const foundDevice = await findDeviceByToken(request.user.id, token);
    if (foundDevice) {
      return response.json({
        success: false,
        message: "Device already exists",
      });
    }

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
    next(error);
  }
}

async function updateDeviceByKey(request, response, next) {
  try {
    const { name } = request.body;
    appLogger.debug(`update device push token`, request.params.deviceKey, name);

    const foundDevice = await findDeviceByKey(request.user.id, request.params.deviceKey);

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
  } catch (error) {
    next(error);
  }
}

async function updateDeviceById(request, response, next) {
  try {
    const { token, name } = request.body;
    appLogger.debug(`update device, ${token}, ${name}`);

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
  } catch (error) {
    next(error);
  }
}

async function deleteDevice(request, response, next) {
  try {
    appLogger.debug(`delete device, ${request.params.deviceId}, ${request.body.name}`);

    const deletedDevice = await removeDevice(request.params.deviceId);
    response.json({
      success: true,
      device: deletedDevice,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listDevices,
  getDevice,
  createDeviceRoute,
  updateDeviceById,
  updateDeviceByKey,
  deleteDevice,
};
