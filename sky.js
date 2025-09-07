// skySlopeService.js
require('dotenv').config();
const puppeteer = require("puppeteer-extra"); // Use puppeteer-extra
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const { executablePath } = require('puppeteer');
async function createSkySlopeAgent(firstName,lastName,email,streetNo,streetName,zip,phone,stateCode) {
  // SkySlope login credentials (store securely in env vars in production!)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 50));
  const USERNAME = process.env.SKY_USERNAME || "";
  const PASSWORD = process.env.SKY_PASSWORD || "";
  console.log("USERNAME", USERNAME);
  console.log("PASSWORD", PASSWORD );
   const browser = await puppeteer.launch({ 
    headless: "new", // Use the new headless mode
    defaultViewport: null,
    executablePath: executablePath(), // Specify executable path for Render
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--window-size=1920,1080"
    ]
  });

   const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    window.chrome = { runtime: {} };
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
  );

  const officeMapping = {
  "CA-01": "CA - ONE",
  "CA-02": "CA - TWO",
  "CA-03": "CA - THREE",
  "CA-04": "CA - FOUR",
  "CA-05": "CA - FIVE",
  "CA-06": "CA - SIX-SEVEN",
  "CA-07": "CA - SIX-SEVEN",
  "CA-08": "CA - EIGHT",
  "MD-01": "MD",
  "VA-01": "VA",
  "TX-01": "TX",
  "DC-01": "DC",
  "FL-01": "FL",
  "MA-01": "MA",
  "NV-01": "NV",
};
    const selected_stateCode = officeMapping[stateCode];

  try {
    // Login
    console.log("Selected State Code:", selected_stateCode);
    if(firstName === undefined || lastName === undefined || email === undefined || selected_stateCode === undefined){
      return { success: false, error: "Missing required agent fields" };
    }

    await page.goto("https://app.skyslope.com/LoginIntegrated.aspx", { waitUntil: "networkidle2" });
    await delay(2000);

    await page.type("#idp-discovery-username", USERNAME, { delay: 100 });
    await page.click("#input34");
    await delay(1500);

    await page.click("#idp-discovery-submit");

    await page.waitForSelector("#input61", { visible: true,timeout: 10000 });
    await delay(1000);
    await page.type("#input61", PASSWORD, { delay: 100 });
    await delay(1000);

    await page.click(".o-form-button-bar");

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("✅ Logged into SkySlope!");
    await delay(2000);

    // Navigate to Add Agent page
    await page.goto("https://app.skyslope.com/ManageBrokerAgents.aspx", { waitUntil: "networkidle2" });
    await delay(2000);

    await page.click("#ContentPlaceHolder1_ibtnAddAgents");
   await delay(2000);
    // Fill Agent Form

    await page.waitForSelector("#ContentPlaceHolder1_txtfname", { visible: true });
    await delay(2000);

    await page.type("#ContentPlaceHolder1_txtfname", firstName, { delay: 100 });


    await page.type("#ContentPlaceHolder1_txtlname", lastName, { delay: 100 });


    await page.type("#ContentPlaceHolder1_txttitle", "Realtor", { delay: 100 });
 

    await page.type("#ContentPlaceHolder1_txtemail", email, { delay: 100 });

    streetNo && await page.type("#ContentPlaceHolder1_txtStreetNo", streetNo, { delay: 100 });


    streetName && await page.type("#ContentPlaceHolder1_txtStreetName", streetName, { delay: 100 });
 

    zip && await page.type("#ContentPlaceHolder1_txtzip", zip, { delay: 100 });


    phone && await page.type("#ContentPlaceHolder1_txtphone",phone, { delay: 100 });

    await page.click("#ContentPlaceHolder1_MultiCheckOfficeCombo1_txtCombo");
    await delay(1000);

    await page.waitForSelector("#ContentPlaceHolder1_MultiCheckOfficeCombo1_Panel111", { visible: true });
    await delay(1500);

    await page.evaluate((selected_stateCode) => {
      const labels = Array.from(document.querySelectorAll("#ContentPlaceHolder1_MultiCheckOfficeCombo1_chkList label"));
      target = labels.find(el => el.innerText.trim() === selected_stateCode)
      if (target) target.click();
     },selected_stateCode);
 
    // Save agent
    await delay(2000);
    await page.click("#ContentPlaceHolder1_btnSave");
    console.log("✅ Agent creation form submitted!");
    return { success: true, message:"Agent Created Successfully" };

  } catch (err) {
    console.error("❌ Puppeteer Error:", err);
    return { success: false, error: err.message };
  } finally {
    setTimeout(()=>{
        browser.close();
    },14000)
    
    console.log("🔒 Browser closed")
  } 
} 

module.exports = { createSkySlopeAgent };
