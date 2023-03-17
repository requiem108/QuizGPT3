const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");

// Habilitar CORS para todas las solicitudes
app.use(cors());

app.get('/', function (req, res) {  
  console.log('Hola mundo');
  res.send('¡Hola, mundo!');
});

app.get('/api/', async (req, res) =>{
  //res.json({preguntas:["¿Qué son las lenguas romances?¿Cuál es la diferencia entre latín clásico y latín vulgar?"]})
  //return
  //console.log(req.query.texto)
  var texto = req.query.texto;  
  let prompt= `interpreta a un docente y a partir del texto crea dos preguntas menores de 10 palabras.\n\nTEXTO A ANALIZAR:${texto}\n\n\nescribe las 2 preguntas menores de 10 palabras aqui:`;
  
  //Aqui generamos las preguntas a partir del texto
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);


  const response = await openai.createCompletion({
    model: "text-davinci-003",  
    prompt,  
    temperature: 0.5,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0   
    
  });

  console.log(response.data);
   // Extraer las dos preguntas del objeto 'choices' en la respuesta
   const choices = response.data.choices;
   const preguntas = choices.map(choice => choice.text.trim());
 
   // Enviar las dos preguntas en formato JSON como respuesta
   const preguntasJSON = { preguntas: preguntas};
   res.json(preguntasJSON);
   //res.json({preguntas:["¿Qué aspectos abarca la definición de liderazgo?↵¿En qué medios se puede ejercer el liderazgo?"]});
});

app.get('/respuesta/', async (req, res) =>{
  let texto = req.query.texto;
  let preguntas = req.query.pregunta1;
  let respuesta1 = req.query.respuesta1; 
  let respuesta2 = req.query.respuesta2;

  //res.json({textoRespuesta:"Esta es ka resouesta"})
 // return

  let prompt= `TEXTO A ANALIZADO:${texto}
  preguntas generadas:
  ${preguntas}
  Respuestas
  1: ${respuesta1}
  2: ${respuesta2}
  DIME SI LAS RESPUESTAS SON CORRECTAS Y COMPLEMENTA SI SON SIMPLES SE BREVE:
  `

  //Consulta a la api OPENAI
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log(prompt)
  const openai = new OpenAIApi(configuration);
  
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.5,
    max_tokens: 140,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    
  });

    // Crear el objeto de respuesta
    const respuestaObj = {
      textoRespuesta: response.data.choices[0].text
    };
   
    // Enviar la respuesta como un JSON
    res.json(respuestaObj);
    //res.json({"textoRespuesta":"\nLas respuestas son correctas, pero son demasiado simples. El liderazgo abarca varios aspectos, tales como la capacidad de influir, motivar, organizar, llevar a cabo acciones para lograr objetivos y generar cambio y transformación personal y colectiva. Además, el liderazgo se puede desarrollar en diferentes contextos, como los educativos, familiares, deportivos, profesionales, científicos, sociales, militares y políticos."})
});


app.listen(5000, function () {
  console.log('Servidor Express escuchando en el puerto 5000');
});