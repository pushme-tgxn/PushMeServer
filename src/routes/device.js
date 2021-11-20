const express = require("express");

const { authorize } = require("../middleware/authorize");

const {
  createDevice,
  updateDevice,
  listDevices,
  getDevice,
  removeDevice,
  findDeviceByToken,
} = require("../service/device");

const router = express.Router();

router.get("/", authorize(), async (request, response) => {
  console.log(`listDevices`, request.user);

  const deviceList = await listDevices(request.user.id);

  response.json({
    success: true,
    devices: deviceList,
  });
});

router.get("/:deviceId", authorize(), async (request, response) => {
  console.log(`listDevices`, request.user);

  const foundDevice = await getDevice(request.params.deviceId);
  if (!foundDevice) {
    return next(new Error("Device not found"));
  }

  response.json({
    success: true,
    device: foundDevice,
  });
});

// upsert device
router.post("/", authorize(), async (request, response, next) => {
  const { token, name } = request.body;
  console.log(`Received push token, ${token}, ${name}`);

  const foundDevice = await findDeviceByToken(token);
  if (foundDevice) {
    const deviceResult = await updateDevice({ token, name });
    return response.json({
      success: true,
      device: deviceResult,
    });
  }

  const deviceResult = await createDevice({
    userId: request.user.id,
    token,
    name,
  });
  response.json({
    success: true,
    device: deviceResult,
  });
});

router.post("/:deviceId", authorize(), async (request, response, next) => {
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
});

router.delete("/:deviceId", authorize(), async (request, response) => {
  console.log(
    `delete device, ${request.params.deviceId}, ${request.body.name}`
  );

  const deletedDevice = await removeDevice(request.params.deviceId);
  response.json({
    success: true,
    device: deletedDevice,
  });
});

module.exports = router;
