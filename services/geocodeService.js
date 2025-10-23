import fetch from 'node-fetch';
import axios from 'axios';

const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
export async function getCoordinates(address,city) {
  try {
    const cityPart = city ? city : '';
    const query = encodeURIComponent(`${address},${cityPart},USA`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      {
        headers: {
          'User-Agent': 'AllisonJamesEstatesApp/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}

export async function getCoordinatesFromRapidAPI(address, city = '') {
  try {
    // Combine address and city
    const fullAddress = `${address},${city}`.trim();
    const query = encodeURIComponent(fullAddress);

    const url = `https://address-from-to-latitude-longitude.p.rapidapi.com/geolocationapi?address=${query}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '3974e618cdmsh9a6629205b46b55p184684jsn990795080200',
        'x-rapidapi-host': 'address-from-to-latitude-longitude.p.rapidapi.com',
        'User-Agent': 'AllisonJamesEstatesApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.statusText}`);
    }

    if (data?.Results?.length === 0) {
      throw new Error(`RapidAPI request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.Results?.length > 0) {
      const result = data.Results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching coordinates from RapidAPI:', error);
    return null;
  }
}

export async function getCoordinatesFromMapsCo(address, city = '') {
  try {
    // Combine address and city into one query string
    const query = encodeURIComponent(`${address},${city},USA`);

    // Your geocode.maps.co API endpoint with key
    const url = `https://geocode.maps.co/search?q=${query}&api_key=68f76eca3c05c793452222zioaf6ae2`;

    // Request
    const response = await axios.get(url, {
      maxBodyLength: Infinity,
      headers: {
        'User-Agent': 'AllisonJamesEstatesApp/1.0',
      },
    });

    const data = response.data;
    if (data.length === 0) {
      throw new Error(`Error from GeoCode: No results found`);
    }
    // Validate response
    if (Array.isArray(data) && data.length > 0) {
      const bestMatch = data[0]; // Take the first (most relevant) result

      return {
        latitude: parseFloat(bestMatch.lat),
        longitude: parseFloat(bestMatch.lon),
      };
    }

    return null; // No results found
  } catch (error) {
    console.error('Error fetching coordinates from Maps.co:', error.message);
    return null;
  }
}

export async function getGeocodeDatabyGoogle(address,city='') {
  const finalAddress = city ? `${address}, ${city},USA` : address;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(finalAddress)}&key=${mapsApiKey}`;
    const response = await axios.get(url);

    if (response.data.status !== "OK" || !response.data.results.length) {
      throw new Error("No results found or invalid address.");
    }

    const result = response.data.results[0];
    const { lat, lng } = result.geometry.location;

    return {
      latitude: lat,
      longitude: lng
    };
  } catch (error) {
    console.error("Error fetching geocode data:", error.message);
    return null;
  }
}