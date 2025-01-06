const Medicine = require("../models/Medicine");
const Doctor = require("../models/Doctor");
const PathologyTest = require("../models/PathologyTest");
const axios = require("axios");
exports.searchMedicines = async (req, res) => {
  const { name, manufacturer, category } = req.query;
  const filterobj = {};
  if (name) {
    filterobj.name = name;
  }
  if (manufacturer) {
    filterobj.brand = manufacturer;
  }
  if (category) {
    filterobj.category = category;
  }
  const result = await Medicine.find(filterobj);
  return res.json({ success: true, results: result.length, data: result });
};
exports.filterDoctorsByCategory = async (req, res) => {
  const { name } = req.query;

  const filterObj = {};
  if (name) {
    filterObj.name = name;
  }

  const filteredDoctor = await Doctor.find(filterObj).populate(
    "category",
    "name"
  );
  return res.json({
    success: true,
    results: filteredDoctor.length,
    data: filteredDoctor,
  });
};
exports.searchLabTestsByName = async (req, res) => {
  const { name } = req.query;

  const filterobj = {};
  if (name) {
    filterobj.name = name;
  }
  const filteredLabTests = await PathologyTest.find(filterobj).populate(
    "category",
    "name"
  );

  return res.json({
    success: true,
    results: filteredLabTests.length,
    data: filteredLabTests,
  });
};

exports.getLiveLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    // Build the Google Maps API URL
    const apiKey = "AIzaSyByNeYE_Ni2ChK0hJtK8aAUm0J_4YwY20M";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    // Make the request to Google Maps API
    const response = await axios.get(url);

    // Check the API response
    if (response.data.status === "OK" && response.data.results.length > 0) {
      return res.status(200).json({
        address: response.data.results[0].formatted_address,
      });
    } else {
      return res.status(500).json({
        error: "Unable to fetch location data",
        details: response.data,
      });
    }
  } catch (error) {
    console.error("Error fetching location data:", error.message);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};