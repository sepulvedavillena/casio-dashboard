/*
 * CASIO FAMILY TIME
 * WEATHER PROXY V6
 * Valdivia, Chile
 *
 * Pronostico actual + proximos 3 dias.
 */

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=600'
  );

  var lat = '-39.8142';
  var lon = '-73.2459';

  var url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=' + lat +
    '&longitude=' + lon +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset' +
    '&temperature_unit=celsius' +
    '&wind_speed_unit=kmh' +
    '&timezone=America%2FSantiago' +
    '&forecast_days=4';

  try {

    var response = await fetch(url);

    if (!response.ok) {

      return res.status(502).json({
        ok: false,
        error: 'OPEN_METEO_' + response.status
      });
    }

    var data = await response.json();

    if (!data.current || !data.daily) {

      return res.status(502).json({
        ok: false,
        error: 'NO_DATA'
      });
    }


    var daily = data.daily;

    var forecast = [];

    var i;

    for (i = 1; i <= 3; i++) {

      forecast.push({

        date:
          daily.time &&
          daily.time[i]
            ? daily.time[i]
            : '',

        weatherCode:
          daily.weather_code &&
          typeof daily.weather_code[i] !== 'undefined'
            ? daily.weather_code[i]
            : null,

        max:
          daily.temperature_2m_max &&
          typeof daily.temperature_2m_max[i] !== 'undefined'
            ? daily.temperature_2m_max[i]
            : null,

        min:
          daily.temperature_2m_min &&
          typeof daily.temperature_2m_min[i] !== 'undefined'
            ? daily.temperature_2m_min[i]
            : null,

        rain:
          daily.precipitation_probability_max &&
          typeof daily.precipitation_probability_max[i] !== 'undefined'
            ? daily.precipitation_probability_max[i]
            : null
      });
    }


    var result = {

      ok: true,

      city: 'VALDIVIA',

      temperature:
        data.current.temperature_2m,

      feels:
        data.current.apparent_temperature,

      humidity:
        data.current.relative_humidity_2m,

      wind:
        data.current.wind_speed_10m,

      weatherCode:
        data.current.weather_code,

      isDay:
        data.current.is_day,

      max:
        daily.temperature_2m_max
          ? daily.temperature_2m_max[0]
          : null,

      min:
        daily.temperature_2m_min
          ? daily.temperature_2m_min[0]
          : null,

      rain:
        daily.precipitation_probability_max
          ? daily.precipitation_probability_max[0]
          : null,

      sunrise:
        daily.sunrise
          ? daily.sunrise[0]
          : null,

      sunset:
        daily.sunset
          ? daily.sunset[0]
          : null,

      forecast: forecast,

      updated:
        data.current.time || ''
    };


    return res.status(200).json(result);


  } catch (e) {

    return res.status(500).json({

      ok: false,

      error:
        String(
          e.message || e
        )
    });
  }
};
