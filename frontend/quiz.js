
import {Obj_fetch} from  './peticiones_fetch/main.js?v=1'

var preguntas = [];
var conversationState = '';
var voiceSelected = '';
var textA_bot = document.getElementById("bot");
/*Carga*/
window.addEventListener("load", ()=>{
    const button1 = document.querySelector('#button1');
    button1.addEventListener('click', async () => {
        let message = await generateGreeting();        
        textA_bot.innerText = ""; // Limpia el mensaje anterior
        await speak(message);
        for (let i = 0; i < message.length; i++) {
            textA_bot.innerText += message.charAt(i);
            await sleep(50); // Espera 50ms antes de agregar la siguiente letra
        }

        //Consultamos al servidor       
        let texto = document.querySelectorAll("#TemaContenedor p")[0].innerText
        Obj_fetch.setURL("http://localhost:5000/api/")
        const rest = await Obj_fetch.getGet_Json(`?texto=${texto}`);
        console.log(rest);

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
    });
      

    const button2 = document.querySelector('#button2');
    button2.addEventListener('click', async () => {
        let respuesta1 = document.getElementById("respuesta1").value;
        let respuesta2 = document.getElementById("respuesta2").value;
        let texto = document.querySelectorAll("#TemaContenedor p")[0].innerText
        
        //Consulta al servidor
        Obj_fetch.setURL("http://localhost:5000/respuesta/")
        const rest = await Obj_fetch.getGet_Json(`?texto=${texto}&respuesta1=${respuesta1}&respuesta2=${respuesta2}&pregunta1=${preguntas[0]}`);
        console.log(rest);
        textA_bot.innerText = ''; // Limpia el mensaje anterior
        BotResponde(rest.textoRespuesta);
    });
    
});

function speak(textToSpeak) {
    
    // Create a new instance of SpeechSynthesisUtterance
    var utterance = new SpeechSynthesisUtterance(textToSpeak);    
    if(voiceSelected == ''){
        // Escuchar cuando las voces estén listas
        speechSynthesis.onvoiceschanged = function() {
        
        
            // Buscar una voz en español de México
            var voices = window.speechSynthesis.getVoices();
            voiceSelected = voices.find(function(voice) {
                //return voice.lang === "es-MX";
                return voice.name === "Microsoft Sabina - Spanish (Mexico)";
            });
        
            utterance.voice = voiceSelected;            
            // Speak the text
            speechSynthesis.speak(utterance);
        };
    }else{
        utterance.voice = voiceSelected;            
        // Speak the text
        speechSynthesis.speak(utterance);
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

var message = greeting + ", Soy tu asistente de aprendizaje, probaremos tu dominio sobre los temas vistos.";

return message;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function BotResponde(message){
    await speak(message);
    for (let i = 0; i < message.length; i++) {
        textA_bot.innerText += message.charAt(i);
        await sleep(62); // Espera 50ms antes de agregar la siguiente letra
    }
}

