import axios from 'axios'

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WA_TOKEN}`
    }
}

function toTitleCase(str:string) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

const sendMessage = async (number:string, message:string, wmaid?:string) => {
    if (wmaid) {
        axios.post(`https://graph.facebook.com/v14.0/${process.env.WAID}/messages`, {
            messaging_product: 'whatsapp',
            context: {
                message_id: wmaid
            },
            to: number,
            type: "text",
            text: { 
                "body": message, 
            }
        }, axiosConfig)

        .then(function (response) {
            return true
        })
        .catch(function (error) {
            console.log(error);
        });
    } else {
        axios.post(`https://graph.facebook.com/v14.0/${process.env.WAID}/messages`, {
            messaging_product: 'whatsapp',
            to: number,
            type: "text",
            text: { 
                "body": message, 
            }
        }, axiosConfig)

        .then(function (response) {
            return true
        })
        .catch(function (error) {
            console.log(error);
        });
    }
}

const sendTranslatedMessage = async (number:string, message:string, wmaid:string, lang:"en"|"pt") => {
    const isEn = lang == "en"
    const translatedMessage = await axios.get("https://api.mymemory.translated.net/get", {
        params: {
            q: message,
            langpair: isEn ? "en-us|pt-pt" : "pt-pt|en-us"
        }
    })

    sendMessage(number, translatedMessage.data.responseData.translatedText, wmaid)
}

const sendNewsCategory = async (number:string, wmaid:string) => {
    axios.post(`https://graph.facebook.com/v14.0/${process.env.WAID}/messages`, {
        messaging_product: 'whatsapp',
        context: {
            message_id: wmaid
        },
        to: number,
        type: "interactive",
        interactive: {
            type: "button",
            header: {
                type: "text",
                text: "Notícias"
            },
            body: {
                text: "As notícias são retiradas do site *Kabum Digital*\n\nSelecione uma opção"
            },
            footer: {
                text: "https://kabum.digital/"
            },
            action: {
                buttons: [
                    {
                        type: "reply",
                        reply: {
                            id: "news.mostread",
                            title: "Mais lidas" 
                        }
                    },
                    {
                        type: "reply",
                        reply: {
                            id: "news.random",
                            title: "Aleatórias" 
                        }
                    },
                    {
                        type: "reply",
                        reply: {
                            id: "news.latest",
                            title: "Última notícia" 
                        }
                    }
                ]
            }  
        }
    }, axiosConfig)

    .then(function (response) {
        return true
    })
    .catch(function (error) {
        console.log(error);
    });
}

const sendNew = async (link:string, destination:string, wmaid:string) => {
    try {
        const post = await getNew(link)
        let caption = `*${post.title}*\n\n\n`

        post.content.map((item:any) => {
            caption += `${item}\n\n`
        })

        caption += `\n${post.link}`

        sendImage(destination, post.image, caption, wmaid)
    } catch (err) {
        console.log(err)
    }
}

const sendNewsList = async (number:string, wmaid:string, posts:any) => {
    const sections = posts.map((item:any) => {
        const DESCRIPTION_LIMIT = 68
        const aboveTitleDescription = DESCRIPTION_LIMIT < item.title.length 
        const dotsOrEmpyDescription = aboveTitleDescription ? "..." : ""

        return {
            title: posts.indexOf(item) + 1,
            rows: [
                {
                    id: item.link,
                    title: "Ler mais",
                    description: item.title.substring(0, DESCRIPTION_LIMIT) + dotsOrEmpyDescription
                }
            ]
        }
    })

    axios.post(`https://graph.facebook.com/v14.0/${process.env.WAID}/messages`, {
        messaging_product: 'whatsapp',
        context: {
            message_id: wmaid
        },
        to: number,
        type: "interactive",
        interactive: {
            type: "list",
            header: {
                type: "text",
                text: "Noticias"
            },
            body: {
                text: "Selecione uma noticia."
            },
            action: {
                button: "Ver noticias",
                sections,
            }
        }
    }, axiosConfig)

    .then(function (response) {
        return true
    })
    .catch(function (error) {
        console.log(error);
    });
}

const getNew = async (link:string) => {
    const id = link.replace("https://kabum.digital/", "")
    const data = await axios.get(`https://kabum-digital.herokuapp.com/post/${id}`)
    .then(async res => {
        const post = res.data.post
        return post
    }).catch(err => {
        throw new Error("Erro")
    })
    return data
}

const sendAudio = async (number:string, link:string, wmaid:string) => {
    axios.post(`https://graph.facebook.com/v14.0/${process.env.WAID}/messages`, {
        messaging_product: 'whatsapp',
        context: {
            message_id: wmaid
        },
        to: number,
        type: "audio",
        audio: { 
            link: link, 
        }
    }, axiosConfig)

    .then(function (response) {
        return true
    })
    .catch(function (error) {
        console.log(error);
    });
}

const sendImage = async (number:string, link:string, caption:string, wmaid:string) => {
    axios.post(`https://graph.facebook.com/v14.0/${process.env.WAID}/messages`, {
        messaging_product: 'whatsapp',
        context: {
            message_id: wmaid
        },
        to: number,
        type: "image",
        image: { 
            link: link,
            caption: caption 
        }
    }, axiosConfig)

    .then(function (response) {
        return true
    })
    .catch(function (error) {
        console.log(error);
    });
}

const sendDevContact = async (number:string, wmaid:string) => {
    axios.post(`https://graph.facebook.com/v14.0/${process.env.WAID}/messages`, {
        messaging_product: 'whatsapp',
        context: {
            message_id: wmaid
        },
        to: number,
        type: "contacts",
        contacts: [
            {
                "birthday": "2006-04-14",
                "emails": [
                    {
                        "email": "jeffersunde72@gmail.com",
                        "type": "WORK"
                    }
                ],
                "name": {
                    "first_name": "Jeffer",
                    "formatted_name": "Jeffer Marcelino",
                    "last_name": "Sunde"
                },
                "org": {
                    "company": "CEG Microsystems",
                    "department": "Tech",
                    "title": "Developer"
                },
                "phones": [
                    {
                        "phone": "+258 84 399 7730",
                        "type": "WORK",
                        "wa_id": "258843997730"
                    },
                    {
                        "phone": "+258 87 012 6103",
                        "type": "HOME"
                    }
                ],
                "urls": [
                    {
                        "url": "https://github.com/JefferMarcelino",
                        "type": "WORK"
                    }
                ]
            }
        ]
    }, axiosConfig)

    .then(function (response) {
        return true
    })
    .catch(function (error) {
        console.log(error);
    });
}

const removeCommand = (command:string, text:string) => {
    const slipted = text.split(" ")
    let params = ""
    slipted.forEach(item => {
        if (item.toLowerCase() !== command) {
            params += ` ${ item }`
        }
    })
    return params.trim()
}

const getNewsByCategory = async (category: "random" | "mostread") => {
    if (category == "mostread") {
        const data = axios.get("https://kabum-digital.herokuapp.com/mostread")
        .then(async res => {
            const posts = res.data.posts
            return posts
        }).catch(err => {
            throw new Error("Erro")
        })
        return data
    } else if (category == "random") {
        const data = axios.get("https://kabum-digital.herokuapp.com/random")
        .then(async res => {
            const posts = res.data.posts
            return posts
        }).catch(err => {
            throw new Error("Erro")
        })
        return data
    }
}

const generateRandomInteger =(max:number) => {
    return Math.floor(Math.random() * max) + 1;
}

export { sendNewsList, sendMessage, sendImage, sendAudio, sendDevContact, removeCommand, toTitleCase, sendNewsCategory, getNewsByCategory, generateRandomInteger, sendTranslatedMessage, sendNew }
