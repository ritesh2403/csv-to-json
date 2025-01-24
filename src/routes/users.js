const express = require('express');
const pool = require('../config/db');
const { parseCSVToJson } = require('../utils/csvparser');
const router = express.Router();
const fs = require('fs');
require('dotenv').config();

// Upload and process CSV
router.post('/upload', async (req, res) => {
    try {
      const filePath = `${process.env.UPLOAD_PATH}/file.csv`;
      if (!fs.existsSync(filePath)) {
        return res.status(400).send('CSV file not found.');
      }
  
      const jsonData = parseCSVToJson(filePath);
      console.log("jsonData::",jsonData)
      for (const item of jsonData) {
        const name = `${item.name.firstName} ${item.name.lastName}`;
        console.log("name is::",name)
        const age = parseInt(item.age, 10);
  
        // Validate age field
        if (isNaN(age)) {
          console.error(`Invalid age value: ${item.age}`);
          return res.status(400).send(`Invalid age value: ${item.age}`);
        }
  
        const address = item.address;
        delete item.name;
        delete item.age;
        delete item.address;
  
        await pool.query(
          `INSERT INTO users (name, age, address, additional_info) VALUES ($1, $2, $3, $4)`,
          [name, age, address, item]
        );
      }
  
      res.status(200).send('File processed and data uploaded.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error processing file.');
    }
  });
  

// Age Distribution
router.get('/distribution', async (req, res) => {
  try {
    const result = await pool.query('SELECT age FROM users');
    const ages = result.rows.map(row => row.age);
    console.log("ages::",ages);
    const distribution = {
      '<20': (ages.filter(age => age < 20).length / ages.length) * 100,
      '20-40': (ages.filter(age => age >= 20 && age <= 40).length / ages.length) * 100,
      '40-60': (ages.filter(age => age > 40 && age <= 60).length / ages.length) * 100,
      '>60': (ages.filter(age => age > 60).length / ages.length) * 100,
    };
    res.json(distribution);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error calculating distribution.');
  }
});

module.exports = router;
