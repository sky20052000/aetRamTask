const User = require("../query/user");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
dotenv.config();

const uploadBulkCsvData = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    if (!req.file.mimetype.includes("csv")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Please upload a CSV file.",
      });
    }

    const filePath = req.file.path;
    const results = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        const { username, email, phone_number } = data;

        // Basic validation
        if (!username || !email || !phone_number) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields in CSV data.",
          });
        }

        results.push(data);
      })
      .on("end", async () => {
        //console.log(results,"resultss")
        try {
          await User.insertBulkData(results);

          fs.unlinkSync(filePath);
          return res.status(200).json({
            success: true,
            message: `Bulk data uploaded successfully!`,
          });
        } catch (e) {
          console.error("Error during database insertion:", e);
          return res
            .status(500)
            .json({ success: false, message: "Database insertion failed." });
        }
      });
  } catch (e) {
    console.log(e, "Error during bulk CSV upload");
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
const getTemperature = async (req, res) => {
  try {
    let { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }
    const apiKey = process.env.API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    // Fetch weather data
    const response = await axios.get(weatherUrl);
    //console.log(response,"nnn")

    // Extract temperature
    if (
      response.data &&
      response.data.main &&
      typeof response.data.main.temp !== "undefined"
    ) {
      const temperature = response.data.main.temp;
      let created_date = new Date();
      let saveData = {
        city: String(city),
        temperature,
        created_at: created_date,
      };
      await User.insertTempData(saveData, res);
      return res.status(200).json({ success: true, city, temperature });
    } else {
      return res
        .status(404)
        .json({
          success: false,
          message: "Weather data not found for this city",
        });
    }
  } catch (e) {
    console.log(e, "error");
    return res
      .status(500)
      .json({ sucess: false, message: "Something went wrong!" });
  }
};

function calculateSMA(data, tempCount) {
  if (data.length < tempCount) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < tempCount; i++) {
    sum += data[i];
  }

  return sum / tempCount;
}

const calculateSma = async (req, res) => {
  try {
    let { city, tempCount } = req.body;
    tempCount = Number(tempCount ? tempCount : 1);
    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }
    let data = {
      city,
      tempCount,
    };

    const getTempData = await User.getTempData(data, res);
    if (getTempData.length === 0) {
      return res.status(200).json({ success: true, message: "No data found!" });
    }
    // console.log(getTempData, "getTempData");
    const temperatures = getTempData.map((row) => row.temperature);
    const sma = calculateSMA(temperatures, tempCount);
    let returnData = {
      city:getTempData[0].city,
      tempCount,
      temperatures,
      sma,
    };
    return res.status(200).json({ success: true, data:returnData });
  } catch (e) {
    console.log(e, "error");
    return res
      .status(500)
      .json({ sucess: false, message: "Something went wrong!" });
  }
};

module.exports = {
  uploadBulkCsvData,
  getTemperature,
  calculateSma,
};
