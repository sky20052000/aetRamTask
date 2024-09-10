const express = require("express");
const userController = require("../controller/userController");
const upload = require("../utils/utils");
const userRouter = express.Router();

userRouter.post("/bulk_upload",upload.single("csv"),userController.uploadBulkCsvData);
userRouter.get("/get_temp", userController.getTemperature);
userRouter.get("/get_sma", userController.calculateSma)




module.exports = userRouter