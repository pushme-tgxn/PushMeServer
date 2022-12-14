const express = require("express");

const { authorize } = require("../middleware/authorize");

const { triggerPushSingle } = require("../lib/push-fcm");

const {
  createDevice,
  updateDevice,
  listDevices,
  getDevice,
  removeDevice,
  findDeviceByKey,
  findDeviceByToken,
} = require("../controllers/device");

const router = express.Router();

router.get("/", authorize(), async (request, response) => {
  const deviceList = await listDevices(request.user.id);

  response.json({
    success: true,
    devices: deviceList,
  });
});

router.get("/:deviceId", authorize(), async (request, response) => {
  console.log(`getDevice`, request.user);

  const foundDevice = await getDevice(request.params.deviceId);
  if (!foundDevice) {
    return next(new Error("Device not found"));
  }

  response.json({
    success: true,
    device: foundDevice,
  });
});

// create device
router.post("/create", authorize(), async (request, response, next) => {
  const { token, name, deviceKey, nativeToken } = request.body;
  console.log(`create device push token`, token, name, deviceKey, nativeToken);

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
    // type,
    deviceKey,
    userId: request.user.id,
    nativeToken: JSON.stringify(nativeToken),
  });

  response.json({
    success: true,
    device: deviceResult,
  });
});

// upsert device
router.post("/:deviceKey", authorize(), async (request, response, next) => {
  const { name } = request.body;
  console.log(`upsert device push token`, name);

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

  const deviceResult = await createDevice({
    token,
    name, // include name on create
    userId: request.user.id,
  });

  response.json({
    success: true,
    device: deviceResult,
  });
});

router.post(
  "/:deviceKey/test",
  authorize(),
  async (request, response, next) => {
    const foundDevice = await findDeviceByKey(
      request.user.id,
      request.params.deviceKey
    );

    if (foundDevice) {
      console.log("foundDevice", foundDevice.nativeToken);

      const nativeTokenData = JSON.parse(foundDevice.nativeToken);
      console.log("nativeToken", nativeTokenData);

      if (nativeTokenData.type == "android") {
        const ddd = await triggerPushSingle(nativeTokenData.data);

        return response.json({
          success: true,
          response: ddd,
        });
      }
    }

    response.json({
      success: false,
    });
  }
);

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
