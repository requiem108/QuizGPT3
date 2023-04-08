import {Obj_fetch} from  '../peticiones_fetch/main.js?v=1'

var preguntas = [];
var conversationState = '';
var voiceSelected = '';
var textA_bot = document.getElementById("bot");

/*Carga*/
window.addEventListener("load", async ()=>{
    await getVoice();
    const button1 = document.querySelector('#button1');
    button1.addEventListener('click', iniciarConversacion);
    /*  
    const button2 = document.querySelector('#button2');
    button2.addEventListener('click', enviarRespuestas);

    const speack1 = document.querySelector('#speack1')
    const respuesta1 = document.querySelector('#respuesta1')

    const speack2 = document.querySelector('#speack2')
    const respuesta2 = document.querySelector('#respuesta2')

    speack1.addEventListener('click' ,async ()=>{
        capturarVoz(respuesta1)
    })
    speack2.addEventListener('click' ,async ()=>{        
        await capturarVoz(respuesta2)       
    })*/
});

async function iniciarConversacion() {
    //Saludamos
    let message = await generateGreeting();        
    textA_bot.innerText = ""; // Limpia el mensaje anterior
    debugger
    await speak(message);
    for (let i = 0; i < message.length; i++) {
        textA_bot.innerText += message.charAt(i);
        await sleep(50); // Espera 50ms antes de agregar la siguiente letra
    }
    //Como parte del ejercicio es importante que analices muy bien tus comentarios sobre todos los temas que revisaste en esta unidad.

    return

    //Consultamos al servidor       
    let texto = document.querySelectorAll("#TemaContenedor p")[0].innerText
    Obj_fetch.setURL("http://localhost:5000/api/")
    const rest = await Obj_fetch.getGet_Json(`?texto=${texto}`);
    console.log(rest);

    //Pasamos el texto a una opcion pasada
    copyTextToMessageDiv(textA_bot)

    preguntas = rest.preguntas
    conversationState = rest.conversationState;
    await sleep(1300);//Para dar naturalidad

    //Mostramos la primera pregunta              
    textA_bot.innerText = ''
    message = `Contesta las siguientes preguntas:
     ${preguntas[0]}
     `;
    await speak(message);
    for (let i = 0; i < message.length; i++) {
        textA_bot.innerText += message.charAt(i);
        await sleep(50); // Espera 50ms antes de agregar la siguiente letra
    }
}

async function enviarRespuestas() {
    let respuesta1 = document.getElementById("respuesta1").value;
    let respuesta2 = document.getElementById("respuesta2").value;
    let texto = document.querySelectorAll("#TemaContenedor p")[0].innerText
    debugger
    //Consulta al servidor
    Obj_fetch.setURL("http://localhost:5000/respuesta/")
    const rest = await Obj_fetch.getGet_Json(`?texto=${texto}&respuesta1=${respuesta1}&respuesta2=${respuesta2}&pregunta1=${preguntas[0]}`);
    console.log(rest);

    //Pasamos el texto a una opcion pasada
    copyTextToMessageDiv(textA_bot)

    textA_bot.innerText = ''; // Limpia el mensaje anterior
    let message = rest.textoRespuesta
    speak(message);
    for (let i = 0; i < message.length; i++) {
        textA_bot.innerText += message.charAt(i);
        await sleep(50); // Espera 50ms antes de agregar la siguiente letra
    }
}

/*Genera el saludo*/
function generateGreeting() {
    var date = new Date();
    var hour = date.getHours();
    
    var greeting;
    
    if (hour < 12) {
        greeting = "Buenos días";
    } else if (hour < 18) {
        greeting = "Buenas tardes";
    } else {
        greeting = "Buenas noches";
    }
    
    // Arreglo con diferentes complementos
    var complements = [
        ", Soy tu asistente de aprendizaje, probaremos tu dominio sobre los temas vistos.",
        ", Estoy aquí para ayudarte a repasar los temas que has estudiado.",
        ", Juntos, revisaremos tus conocimientos sobre los temas aprendidos.",
        ", Como tu asistente, me aseguraré de que comprendas bien todos los temas.",
        ", Vamos a explorar juntos el conocimiento que has adquirido en esta unidad."
    ];
    
    // Selecciona un complemento aleatoriamente
    var randomComplement = complements[getRandomInt(complements.length)];
    
    // Concatena el saludo y el complemento seleccionado
    var message = greeting + randomComplement +'.';
    
    return message;
}


 
  

//FUNCIONES DE APOYO PARA GENERAR AUDIO DE LA IA---------------------
async function getVoice() {
    // Esperar hasta que las voces estén disponibles
    await new Promise(resolve => window.speechSynthesis.onvoiceschanged = resolve);

    // Buscar una voz en español de México
    var voices = window.speechSynthesis.getVoices();
    voiceSelected = voices.find(function(voice) {
        return voice.name === "Microsoft Sabina - Spanish (Mexico)";
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function speak(textToSpeak) {
    // Create a new instance of SpeechSynthesisUtterance
    var utterance = new SpeechSynthesisUtterance(textToSpeak);    
    utterance.voice = voiceSelected;
    // Speak the text
    speechSynthesis.speak(utterance);
}


//FUNCIONES DE APOYO GENERALES--------------------------------------
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//Genera divs como globos de dialogo
function copyTextToMessageDiv(divbot) {
    const parent = divbot.parentNode;
    const messageDiv = document.createElement('div');
    messageDiv.innerText = divbot.innerText;
    messageDiv.classList.add('msj');
    parent.insertBefore(messageDiv, divbot);
    divbot.innerText = ''
}

function capturarVoz(textarea) {
    // Comprobar si el navegador admite la API de reconocimiento de voz
    if ('webkitSpeechRecognition' in window) {
      // Crear un nuevo objeto de reconocimiento de voz
      var recognition = new webkitSpeechRecognition();
      
      // Configurar el reconocimiento de voz
      recognition.lang = 'es-ES'; // Idioma de reconocimiento (en este caso, español)
      //recognition.lang = 'en-US'; // Idioma de reconocimiento (en este caso, inglés)
      recognition.continuous = true; // Reconocimiento de voz único (no continuo)
      recognition.interimResults = true; // Resultados intermedios (para mostrar las palabras en tiempo real)
      
      // Variables para acumular las palabras y para identificar si ya se ha agregado la clase
      var textoAcumulado = '';
      var claseAgregada = false;
      
      // Evento que se dispara cuando se detecta un resultado intermedio
      recognition.oninterimresult = function(event) {
        // Obtener el texto reconocido (solo la última palabra)
        var texto = event.results[event.results.length - 1][0].transcript;
        
        // Acumular las palabras reconocidas
        textoAcumulado += texto;
        
        // Mostrar el texto acumulado en el textarea
        textarea.value = textoAcumulado;
        
        // Agregar la clase de cambio si no se ha agregado aún
        if (!claseAgregada) {
          textarea.classList.remove('active-audio-capture');
          claseAgregada = true;
        }
      };
      
      // Evento que se dispara cuando se detecta un resultado final
      recognition.onresult = function(event) {
        // Obtener el texto reconocido
        var texto = event.results[0][0].transcript;
        
        // Mostrar el texto reconocido en el textarea
        textarea.value = texto;
        
        // Quitar la clase de cambio
        textarea.classList.add('active-audio-capture');
        
        // Aquí puedes hacer lo que quieras con el texto reconocido (por ejemplo, enviarlo a un servidor)
      };
      
      // Empezar el reconocimiento de voz
      recognition.start();
    } else {
      // El navegador no admite la API de reconocimiento de voz
      console.error('Este navegador no admite la API de reconocimiento de voz');
    }
}