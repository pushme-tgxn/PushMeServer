const express = require("express");

const { authorize } = require("../middleware/authorize");

const { triggerPushSingleFCM } = require("../lib/push-fcm");

const {
  createDeviceRoute,
  updateDeviceById,
  updateDeviceByKey,
  listDevices,
  getDevice,
  deleteDevice,
} = require("../controllers/device");

const { findDeviceByKey } = require("../services/device");

const router = express.Router();

router.get("/", authorize(), listDevices);
router.get("/:deviceId", authorize(), getDevice);

router.post("/create", authorize(), createDeviceRoute);

router.post("/:deviceKey", authorize(), updateDeviceByKey);
router.post("/:deviceId", authorize(), updateDeviceById);

router.delete("/:deviceId", authorize(), deleteDevice);

async function testFCMPush(request, response, next) {
  const foundDevice = await findDeviceByKey(
    request.user.id,
    request.params.deviceKey
  );

  if (foundDevice) {
    console.log("foundDevice", foundDevice.nativeToken);

    const nativeTokenData = JSON.parse(foundDevice.nativeToken);
    console.log("nativeToken", nativeTokenData);

    if (nativeTokenData.type == "android") {
      const message = {
        token: nativeTokenData.data,
        android: {
          priority: "high",
        },
        data: {
          experienceId: "@tgxn/pushme",
          scopeKey: "@tgxn/pushme",
          categoryId: "button.approve_deny",
          title: "📧 You've got mail",
          message: "Hello world! 🌐",
          pushId: "111",
          pushIdent: "abc123",
          body: JSON.stringify({
            pushId: "111",
            pushIdent: "abc123",
          }),
        },
      };

      const ddd = await triggerPushSingleFCM(message);

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
router.post("/:deviceKey/test", authorize(), testFCMPush);

module.exports = router;
