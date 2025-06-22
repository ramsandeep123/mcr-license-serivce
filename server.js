const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
// POST /check-license
app.post('/check-dc-license', async (req, res) => {
  const { licenseNumber } = req.body;

  if (!licenseNumber) {
    return res.status(400).json({ error: 'licenseNumber is required' });
  }

  const data = {
    licenseType: '',
    licenseNumber,
    licenseeName: '',
    licenseStatus: '',
    searchBeginDate: '',
    searchEndDate: '',
    sortName: '',
    pageIndex: 1,
    pageSize: 10,
    discipline: ''
  };

  try {
    const response = await axios.post(
      'https://govservices.dcra.dc.gov/oplaportal/Home/GetLicenseSearchDetailsByFilter',
      qs.stringify(data),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch license info', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`License Checker API running at http://localhost:${port}`);
});
