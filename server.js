const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
// POST /check-license
app.post('/check-dc-license', async (req, res) => {
  const { licenseNumber } = req.body;
  console.log("licenseNumber",licenseNumber)
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

app.post('/check-ca-license', async (req, res) => {
  const { licenseNumber } = req.body;

  if (!licenseNumber) {
    return res.status(400).json({ error: 'licenseNumber is required' });
  }

  try {
    const response = await axios.post(
      'https://www2.dre.ca.gov/PublicASP/pplinfo.asp',
      qs.stringify({
        h_nextstep: 'SEARCH',
        LICENSE_ID: licenseNumber,
        LICENSEE_NAME: '',
        CITY_STATE: '',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          'Referer': 'https://www2.dre.ca.gov/PublicASP/pplinfo.asp',
          'Origin': 'https://www2.dre.ca.gov',
        },
      }
    );

   const html = response.data;
   const $ = cheerio.load(html);

const clean = (text) => text.replace(/\s+/g, ' ').trim();

const getValueByLabel = (label) => {
  const row = $(`td:contains("${label}")`).closest('tr');
  return clean(row.find('td').eq(1).text());
};

const getFormerBroker = () => {
  const row = $(`td:contains("Former Responsible Broker")`).closest('tr');
  return clean(row.find('td').eq(1).text());
};

const licenseData = {
  licenseType: getValueByLabel("License Type:"),
  licenseId: getValueByLabel("License ID:"),
  licenseeName: getValueByLabel("Name:"),
  expirationDate: getValueByLabel("Expiration Date:"),
  licenseStatus: getValueByLabel("License Status"),
  issuedDate: getValueByLabel("Salesperson License Issued"),
  responsibleBroker: getValueByLabel("Responsible Broker:"),
  formerBroker: getFormerBroker(),
  comments: getValueByLabel("Comment:")
};

    res.json({ success: true, data: licenseData });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch license info', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`License Checker API running at http://localhost:${port}`);
});
