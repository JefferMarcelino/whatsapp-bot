import express from 'express'
import bodyParser from "body-parser"
import axios from 'axios'
import YTSeacher from "./robots/YTSearch"
import chatBot from './robots/chatBot'
import { 
  getWeatherByCityName, 
  getWeatherByCords 
} from './robots/getWeather'
import { 
  removeCommand, 
  sendMessage, 
  sendImage, 
  toTitleCase, 
  sendAudio, 
  getNewsByCategory,
  sendNew,
  sendNewsList,
  sendTranslatedMessage
} from './robots/functions'

const app = express()
const PORT = process.env.PORT || 3333 

const searcher = new YTSeacher();

app.use(bodyParser.json())
/*app.post("/hook", async (req:any, res:any) => {
    const { value } = req?.body?.entry[0]?.changes[0]
    
    if (value?.messages) {
        console.log(value?.messages)
        const { id, from: destination } = value?.messages[0]
        const message = value?.messages[0]?.text?.body
        const location = value?.messages[0].location
        const interactive = value?.messages[0].interactive

        if (message) {
            if (message.toLowerCase().includes("#temperatura")) {                
                try {
                    const params = removeCommand("#temperatura", message)

                    let weather = await getWeatherByCityName(params)

                    let newWeathers = []

                    for (let index = 0; index < 10; index++) {
                        newWeathers.push(weather.list[index])
                    }

                    weather.list = newWeathers

                    let weatherInfo = `*${weather.city.country} - ${weather.city.name}*\n\nCordenadas Geograficas\n*Longitude:* ${weather.city.coord.lon}\n*Latitude:* ${weather.city.coord.lat}\n\n`

                    weather.list.map((item:any) => {
                        weatherInfo += `${item.dt_txt}\n${toTitleCase(item.weather[0].description)}\n*Temperatura:* ${item.main.temp}ºC\n*Chuva:* ${Math.round(item.pop * 100)}%\n*Humidade:* ${item.main.humidity}%\n*Vento:* ${item.wind.speed}m/s\n\n\n`
                    })

                    sendMessage(destination, weatherInfo, id);
                } catch(error) {
                    sendMessage(destination, `Região não encontrada.`, id)
                }
            } else if (message.toLowerCase().includes("#rm")) {
                try {
                    const params = removeCommand("#rm", message)
                    axios.get("https://rickandmortyapi.com/api/character/", {
                        params: {
                            name: params.replace(" ", "%20")
                        }
                    })
                    .then(async res => {
                        await sendImage(destination, `${res.data.results[0].image}`, `*Name:* ${res.data.results[0].name}\n*Status:* ${res.data.results[0].status}\n*Species:* ${res.data.results[0].species}\n*Gender:* ${res.data.results[0].gender}\n*Origin:* ${res.data.results[0].origin.name}\n*Location:* ${res.data.results[0].location.name}`, id)
                    })
                    .catch(err => {
                        sendMessage(destination, `No results found.`, id)
                    }) 
                } catch (err) {
                    sendMessage(destination, `No results found.`, id)
                }
            } else if (message.toLowerCase().includes("+en")) {
                try {
                    const params = removeCommand("+en", message)
                    sendTranslatedMessage(destination, params, id, "en") 
                } catch (err) {
                    sendMessage(destination, `No results found.`, id)
                }
            } else if (message.toLowerCase().includes("#procura")) {
                try {
                    const params = removeCommand("#procura", message)
                    axios.get(`https://search-api-flask.herokuapp.com/search?q=${params}`)
                    .then(res => {
                        sendMessage(destination, `*${res.data.title}*\n${res.data.field}\n\n${res.data.content}\n\n${res.data.link}`, id)
                    })
                    .catch(err => sendMessage(destination, "Não encontrado", id))
                } catch (err) {
                    sendMessage(destination, `No results found.`, id)
                }
            } else if (message.toLowerCase().includes("#send")) {
                if (destination == "258843997730") {
                    try {
                        const params = removeCommand("#send", message)
                        const number = params.split(" ")[0]
                        sendMessage(number, params.replace(number, ""))
                    } catch (err) {
                        sendMessage(destination, `No results found.`, id)
                    }
                } else {
                    sendMessage(destination, "Não autorizado", id)
                }
            } else if (message.toLowerCase().includes("+pt")) {
                try {
                    const params = removeCommand("+pt", message)
                    sendTranslatedMessage(destination, params, id, "pt") 
                } catch (err) {
                    sendMessage(destination, `No results found.`, id)
                }
            } else if (message.toLowerCase().includes("#play")) {
                try {
                    const params = removeCommand("#play", message)
                    const { title, url } = await searcher.find(params)
                    sendMessage(destination, `Espere, baixando ${title}.`, id)
                    axios.get(" https://youtube.michaelbelgium.me/api/converter/convert/", {
                        params: {
                            api_token: process.env.YOUTUBE_TO_AUDIO,
                            url
                        }
                    })
                    .then(async res => {
                        await sendAudio(destination, res.data.file, id)
                    }).catch(err => {
                        sendMessage(destination, `Indisponviel..`, id)
                    }) 
                } catch (err) {
                    sendMessage(destination, `Não encontrado`, id)
                }
            } else {
                try {
                    chatBot(destination, value?.contacts[0].profile.name, message, id)
                } catch (error) {
                    console.log(error)
                }
            }
        }

        if (location) {
            try {
                let weather = await getWeatherByCords(location.latitude, location.longitude)

                let newWeathers = []

                for (let index = 0; index < 10; index++) {
                    newWeathers.push(weather.list[index])
                }

                weather.list = newWeathers

                let weatherInfo = `*${weather.city.country} - ${weather.city.name}*\n\nCordenadas Geograficas\n*Longitude:* ${weather.city.coord.lon}\n*Latitude:* ${weather.city.coord.lat}\n\n`

                weather.list.map((item:any) => {
                    weatherInfo += `${item.dt_txt}\n${toTitleCase(item.weather[0].description)}\n*Temperatura:* ${item.main.temp}ºC\n*Chuva:* ${Math.round(item.pop * 100)}%\n*Humidade:* ${item.main.humidity}%\n*Vento:* ${item.wind.speed}m/s\n\n\n`
                })

                sendMessage(destination, weatherInfo , id);
            } catch(error) {
                sendMessage(destination, `Região não encontrada.`, id)
            }
        }

        if (interactive) {
            console.log(interactive)
            const buttonReply = interactive.button_reply
            const listReply = interactive.list_reply


            if (buttonReply) {
                switch(buttonReply.id) {
                    case "news.mostread":
                        await sendMessage(destination, "Então você gosta de estar atualizado. Aguarde, por favor!", id)
                        const mostread:any = await getNewsByCategory("mostread")
                        await sendNewsList(destination, id, mostread)
                        break;
                    case "news.random":
                        await sendMessage(destination, "Aguarde, por favor!", id)
                        const random:any = await getNewsByCategory("random")
                        await sendNewsList(destination, id, random)
                        break;
                    case "news.latest":
                        axios.get("https://kabum-digital.herokuapp.com/latest")
                        .then(res => {
                            sendNew(res.data.post.link, destination, id)
                        })
                        .catch(err => sendMessage(destination, "Indisponivel.", id))
                        break;
                    default:
                        console.log(buttonReply.id)
                }
            } 

            if (listReply) {
                sendNew(listReply.id, destination, id)
            }
        }
    }

    res.status(200).end()
})*/

app.get("/hook", (req, res) => {
    res.send(req.query["hub.challenge"]).status(200).end() // Responding is important
})

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
