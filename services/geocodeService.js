import fetch from 'node-fetch';

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