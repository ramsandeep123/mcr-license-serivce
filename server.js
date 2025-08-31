const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');
const cors = require('cors');
// const { createSkySlopeAgent } = require('./sky');
const app = express();
const jwt = require('jsonwebtoken');
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

//spinup the server

app.get("/spin-up",async(req,res)=>{
  res.status(200).json({message:"Server is up and running"})
})

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

app.post("/singed-the-payload",(req,res)=>{

  try {
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  const telephone = req.body.telephone;
  const secret = "hKguq8pikkXGHt+Mve5uoMX5Y5siOB6sgaBlzfjVf3ErSFU0p1NX/q3qYtU+lWu+Pf61sotsCr5wL7vkstKgKA==";

  if(!email || !firstName || !lastName || !password || !confirmPassword || !telephone){
    return res.status(400).json({error:"All fields are required for signing the payload"})
  }

const payload = {
   email: email,
   firstName: firstName,
   lastName: lastName,
   password: password,
   confirmPassword : confirmPassword,
   telephone:telephone
  }

  const token = jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: "5m" });
  token && res.status(200).json({sign_token:token})

 }catch (error) {
    res.status(500).json({ error: 'Failed to sign the payload', details: error.message });
  }
 

})


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
app.post('/check-tx-license', async (req, res) => {
  const { licenseNumber } = req.body;

  if (!licenseNumber) {
    return res.status(400).json({ error: 'licenseNumber is required' });
  }

  try {
    // Request to TREC license search
    const response = await axios.get(
      'https://www.trec.texas.gov/apps/license-holder-search',
      {
        params: {
          lic_name: licenseNumber,
          industry: 'Real Estate',
          county: '',
          display_status: '',
          lic_hp: '',
          ws: 641,
          license_search: 'Search'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://www.trec.texas.gov/apps/license-holder-search/index.php?lic_name=&lic_hp=&industry=Real+Estate'
        }
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);

    const clean = (txt) => txt.replace(/\s+/g, ' ').trim();

    // Extract main panel title (License Type + License Number)
    const panelTitle = clean($('.panel-title').first().text());
    const [licenseType, licenseId] = panelTitle.split(', License #').map(clean);

    // Extract common fields
    const getField = (label) => {
      const el = $(`.label-fluid:contains("${label}")`).next('.data-fluid');
      return clean(el.text());
    };

    // Sponsoring Broker block
    const sponsoringBroker = {
      name: clean($('.license-sponsor').nextAll('.field-fluid').find('.label-fluid:contains("Name")').next('.data-fluid').text()),
      sponsorDate: getField('Sponsor Date'),
      licenseNumber: getField('License #'),
      licenseType: getField('License Type'),
      expirationDate: getField('Expiration Date')
    };

    const licenseData = {
      licenseType,
      licenseId,
      delegatedSupervisor: getField('Delegated Supervisor'),
      licenseStatus: getField('License Status'),
      expirationDate: getField('Expiration Date'),
      county: getField('County'),
      sponsoringBroker
    };

    res.json({ success: true, data: licenseData });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch license info', details: err.message });
  }
});

// app.post("/create-skyslope-agent", async (req, res) => {
//   const { firstName,lastName,email,streetNo,streetName,zip,phone,stateCode } = req.body;

//   if (!firstName || !lastName || !email || !stateCode) {
//     return res.status(400).json({ error: "firstName, lastName, email and stateCode are required" });
//   }

//   try {
//     const result = await createSkySlopeAgent(firstName,lastName,email,streetNo,streetName,zip,phone,stateCode);
//     res.status(result.success ? 200 : 500).json({message: result.success ? "Agent created successfully" : "Failed to create agent" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create agent", details: err.message });
//   }
// });

app.listen(port, () => {
  console.log(`License Checker API running at http://localhost:${port}`);
});
