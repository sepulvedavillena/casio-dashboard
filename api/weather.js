/*
 * CASIO DASHBOARD - WEATHER PROXY
 * Valdivia, Chile
 *
 * Vercel consulta Open-Meteo.
 * El iPad antiguo solo consulta este endpoint.
 */

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  /*
   * Permitimos que Vercel mantenga el clima en cache unos minutos.
   * No necesitamos consultar Open-Meteo cada vez que el iPad recarga.
   */
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=600'
  );

  /*
   * VALDIVIA, CHILE
   */
  var lat = '-39.8142';
  var lon = '-73.2459';

  var url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=' + lat +
    '&longitude=' + lon +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset' +
    '&temperature_unit=celsius' +
    '&wind_speed_unit=kmh' +
    '&timezone=America%2FSantiago' +
    '&forecast_days=1';

  try {

    var response = await fetch(url);

    if (!response.ok) {

      return res.status(502).json({
        ok: false,
        error: 'OPEN_METEO_' + response.status
      });
    }

    var data = await response.json();

    if (!data.current) {

      return res.status(502).json({
        ok: false,
        error: 'NO_CURRENT_DATA'
      });
    }

    var daily = data.daily || {};

    /*
     * Enviamos al iPad solamente los datos necesarios.
     * Esto hace la respuesta pequeña y fácil de interpretar
     * por Safari antiguo.
     */

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
        daily.temperature_2m_max ?
        daily.temperature_2m_max[0] :
        null,

      min:
        daily.temperature_2m_min ?
        daily.temperature_2m_min[0] :
        null,

      rain:
        daily.precipitation_probability_max ?
        daily.precipitation_probability_max[0] :
        null,

      sunrise:
        daily.sunrise ?
        daily.sunrise[0] :
        null,

      sunset:
        daily.sunset ?
        daily.sunset[0] :
        null,

      updated:
        data.current.time || ''
    };

    return res.status(200).json(result);

  } catch (e) {

    return res.status(500).json({
      ok: false,
      error: String(e.message || e)
    });
  }
};
