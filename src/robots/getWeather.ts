import axios from 'axios'

const getLatAndLonByCityName = async (city:any) => {
  const data = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city.replace(" ", "%20")}&limit=1&appid=${process.env.WEATHER_API}&lang=pt`)
  .then(function(response) {
    return response.data[0]
  })
  .then(async (response) => {
    return  { lat: response.lat, lon:response.lon }
  })
  .catch((error) => {
    return error
  })

  return data
}

const getWeatherByCords = async (lat:number, lon:number) => {
  const weather = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API}&units=metric&lang=pt`)
  .then(function(response) {
    return response.data
  })
  .then(async (response) => {
    return response
  })
  .catch((error) => {
      console.log(error)
  })

  return weather
}

const getWeatherByCityName = async (city:string) => {
  const { lat, lon } = await getLatAndLonByCityName(city)
  const weather = await getWeatherByCords(lat, lon)

  return weather
}

export { getWeatherByCityName, getWeatherByCords }