const db = require("../database/connection");
const util = require("util");

const Query = util.promisify(db.query).bind(db);

const User = {
    insertBulkData: async (data, res) => {
        try {
          // Prepare the values array for bulk insert
          const values = data.map((record) => [record.username, record.email, record.phone_number]);
          const query = 'INSERT INTO users (username, email, phone_number) VALUES ?';
          return await Query(query, [values]);
        } catch (err) {
          return res.status(500).send({ status: false, message: err.message });
        }
      },
      insertTempData: async (data, res) => {
        try {
          return await Query("Insert INTO  temperature_data SET ?", [data]);
        } catch (err) {
          return res.status(500).send({ status: false, message: err.message });
        }
      },

      getTempData: async (data, res) => {
        // console.log(data,"ddddddddddddddddds")
        try {
            const query = `
            SELECT * FROM temperature_data WHERE city = ? ORDER BY created_at DESC LIMIT ?`;
    
        const values = [data.city, data.tempCount];
        
       return await Query(query, values);
        } catch (err) {
          return res.status(500).send({ status: false, message: err.message });
        }
      },

};

module.exports = User;