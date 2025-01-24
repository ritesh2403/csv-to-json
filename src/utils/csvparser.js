const fs = require('fs');

function parseCSVToJson(filePath) {
  const data = fs.readFileSync(filePath, 'utf8').split('\n');
  const headers = data.shift().split(',');
  
  return data.map(row => {
    const values = row.split(',');
    const record = {};
    headers.forEach((header, i) => {
      const keys = header.split('.');
      keys.reduce((obj, key, index) => {
        if (index === keys.length - 1) obj[key] = values[i];
        else obj[key] = obj[key] || {};
        return obj[key];
      }, record);
    });
    return record;
  });
}

module.exports = { parseCSVToJson };
