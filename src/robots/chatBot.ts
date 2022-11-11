import axios from "axios"
import { removeEmojis } from "@nlpjs/emoji"
import { dockStart } from "@nlpjs/basic"
import { Normalizer } from "@nlpjs/core"
import { sendMessage, sendImage, toTitleCase, sendNewsCategory, sendTranslatedMessage } from './functions'
import corpusPt from "./corpus-pt.json"

const normalizer = new Normalizer()

let manager:any;

async function train(nlp:any) {
  const dock = await dockStart({ use: ["Basic", "LangPt"] });
  nlp = dock.get('nlp');
 
  await nlp.addCorpus(corpusPt);
  nlp.addLanguage("pt");

  await nlp.train();

  return nlp;
}

async function compute(nlp:any, msg:string) {
  msg = normalizer.normalize(msg);

  const reply = await nlp.process(removeEmojis(msg));

  return reply
}

// The input given to the bot
const chatBot = async (number:string, name:string, input:string, wamid:string) => {  
  train(manager)
  .then(async (nlp) => {
    const answer = await compute(nlp, input)

    if (answer.intent == "usuario.precisadeconselhos") {
      axios.get("https://api.adviceslip.com/advice")
      .then(async res => {
        sendTranslatedMessage(number, `${res.data.slip.advice}`, wamid, "en")
      }).catch(err => {
        sendMessage(number, "Not available", wamid)
      })
    } else if (answer.intent == "piada") {
      axios.get("https://v2.jokeapi.dev/joke/Any")
      .then(async res => {
        if (res.data.type == "single") {
          sendTranslatedMessage(number, `*Category:* ${res.data.category}\n\n${res.data.joke}`, wamid, "en")
        } else {
          sendTranslatedMessage(number, `*Category:* ${res.data.category}\n\n${res.data.setup}\n*R:* ${res.data.delivery}`, wamid, "en")
        }
      }).catch(err => {
        sendMessage(number, "Indisponivel.", wamid)
      })
    } else if (answer.intent == "noticias") {
      await sendNewsCategory(number, wamid)
    } else if (answer.intent == "None" || answer.intent == "jeffer") {
      sendMessage(number, `${answer.answer}`, wamid)
    } else if (answer.intent == "usuario.informacao") {
      sendMessage(number, `${answer.answer.replace(/{{name}}/gi, name)}`, wamid)
    } else if (answer.intent == "usuario.tedio") {
      axios.get("https://www.boredapi.com/api/activity")
      .then(async res => {
        sendTranslatedMessage(number, `*Type:* ${toTitleCase(res.data.type)}\n*Participants:* ${res.data.participants}\n*Activity:* ${res.data.activity}`, wamid, "en")
      }).catch(err => {
        sendMessage(number, "Indisponivel.", wamid)
      })
    } else if (answer.intent == "citacoes") {
      axios.get("https://api.fisenko.net/v1/quotes/en/random")
      .then(async res => {
        sendTranslatedMessage(number, `${res.data.text} - _${res.data.author.name}_`, wamid, "en")
      }).catch(err => {
        sendMessage(number, "Indisponivel", wamid)
      })
    } else if (answer.intent == "citacoes.programacao") {
      axios.get("https://programming-quotes-api.herokuapp.com/quotes/random")
      .then(async res => {
        sendTranslatedMessage(number, `${res.data.en} - _${res.data.author}_`, wamid, "en")
      }).catch(err => {
        sendMessage(number, "Indisponivel", wamid)
      })
    } else if (answer.intent == "usuario.fome") {
      const res = await axios.get("https://foodish-api.herokuapp.com/api/")
      try {
        sendImage(number, `${res.data.image}`, `${answer.answer}`, wamid)
      } catch(err) {
        sendMessage(number, `Not available`, wamid)
      }
    } else {
      sendMessage(number, `${answer.answer}`, wamid)
    }
  })
  .catch(err => console.log(err))
}

export default chatBot