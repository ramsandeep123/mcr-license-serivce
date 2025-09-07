const cheerio = require("cheerio");

function parseTrecLicense(html) {
  const $ = cheerio.load(html);

  const clean = (text) => text.replace(/\s+/g, " ").trim();

  // helper: get the value from label-based tables
  const getValueByLabel = (label) => {
    const row = $(`td:contains("${label}")`).closest("tr");
    return clean(row.find("td").eq(1).text() || "");
  };

  // --- License Info ---
  const licenseInfo = {
    licenseeName: getValueByLabel("Name:"),
    licenseNumber: getValueByLabel("License Number:"),
    licenseType: getValueByLabel("License Type:"),
    status: getValueByLabel("Status:"),
    originalIssueDate: getValueByLabel("Original Issue Date:"),
    expirationDate: getValueByLabel("Expiration Date:"),
    county: getValueByLabel("County:"),
    delegatedSupervisor: getValueByLabel("Delegated Supervisor:"),
  };

  // --- Sponsoring Broker ---
  const sponsorInfo = {
    name: getValueByLabel("Sponsoring Broker:"),
    licenseNumber: getValueByLabel("Broker License Number:"),
    licenseType: getValueByLabel("Broker License Type:"),
    sponsorDate: getValueByLabel("Sponsorship Date:"),
    expirationDate: getValueByLabel("Broker Expiration Date:"),
  };

  // --- Disciplinary Actions ---
  const disciplinary = getValueByLabel("Disciplinary Actions:");

  // --- Education History ---
  const educationHistory = [];
  $("#MainContent_grdEduHistory tr").each((i, row) => {
    if (i === 0) return; // skip header row
    const cols = $(row).find("td");
    if (cols.length) {
      educationHistory.push({
        date: clean($(cols[0]).text()),
        courseName: clean($(cols[1]).text()),
        provider: clean($(cols[2]).text()),
        hours: clean($(cols[3]).text()),
        category: clean($(cols[4]).text()),
      });
    }
  });

  return {
    licenseInfo,
    sponsorInfo
  };
}
