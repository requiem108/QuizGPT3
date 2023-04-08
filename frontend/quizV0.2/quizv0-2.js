import {Obj_fetch} from  '../componentes/peticiones_fetch/main.js?v=1'
import { Spin } from '../componentes/Spin/main.js';

//Variables globales
var msg = [];
var resumen = document.querySelector(`.right-panel`).innerText;
var voiceSelected = '';
var contenedor_chat = document.querySelector(`.quiz-container-scroll`);
var areaChat = document.querySelector(`.message-container`);

/**CONTRLES DE VOZ */
var msg_delay = 1000;
var delay_escribe = 50;
var input_container = document.querySelector(`.input-container-off`);
var emitir_sonido = true;
var dessactivar_inicio = true
/**FIN DE CONTROLES */

var boton_grabar = document.querySelector(`#boton-grabar`);
var grabando = true;
var recognition = null;

var boton_enviar = document.querySelector(`#boton-enviar`);
var usuario_respuesta = document.querySelector('.usuario_respuesta')
var url = 'http://localhost:8000/IA/';

//variable para determinar si califica o si ya es chat continuo
var chat_continuo = false;

window.addEventListener('load', init);
async function init() {
    await getVoice();

    // Aquí va el resto de tu código en el evento de carga
    resumen = limpiarTexto(resumen);

    document.querySelector('#iniciar-quiz').addEventListener('click', async (event) => {
        event.target.disabled = dessactivar_inicio;
        iniciarConversacion();
    });

    boton_grabar.addEventListener('mousedown', async () => {
        boton_grabar.classList.add('boton-grabar-activo');
        grabando = true;
        captura_voz();
    });

    boton_grabar.addEventListener('mouseup', async () => {
        boton_grabar.classList.remove('boton-grabar-activo');
        grabando = false;
        if (recognition) {
            recognition.stop();
        }
    });

    boton_enviar.addEventListener('click', async (event) => {
        event.target.disabled = true;
        await enviarRespuestasUsuario();
        event.target.disabled = false;
    });
}

async function iniciarConversacion() {

    //SALUDO
    let message = await generateGreeting();  
    msg.push({'mensaje': message, 'tipo': 'IA'})  
    
    let div_msg = crearGloboTexto('IA');
    areaChat.appendChild(div_msg);    
    
    await speak(message);   
    await escribeMensaje(message, div_msg);
    await sleep(msg_delay);

    //SOLICITA EL RESUMEN
    message = complementoSaludo();
    msg.push({'mensaje': message, 'tipo': 'IA'})
    div_msg = crearGloboTexto('IA');
    areaChat.appendChild(div_msg);
    await speak(message);
    await escribeMensaje(message, div_msg);
    
    input_container.classList.remove('input-container-off');
}

async function enviarRespuestasUsuario() {
    let respuesta = usuario_respuesta.value;
 
    if (respuesta.length > 0) {
        msg.push({'mensaje': respuesta, 'tipo': 'usuario'})
        let div_msg = crearGloboTexto('usuario');
        areaChat.appendChild(div_msg);
        div_msg.innerText = respuesta;
        usuario_respuesta.value = '';
        contenedor_chat.scrollTop = contenedor_chat.scrollHeight;

        if(chat_continuo){
            //Obtiene la respuesta de la IA
            await chatContinuo();
        }else{
            //Obtiene la respuesta de la IA
            await getRespuestaIA(respuesta);
            chat_continuo = true;
        }        
    }
}
//"{evaluacion: 'bueno', IA: 'Excelente, has demostrado tener un buen conocimiento sobre el tema. ¿Quieres saber más sobre el liderazgo? '}"
async function getRespuestaIA(respuesta) {
    debugger
    let data = new FormData();    
    data.append('resumen', resumen);
    data.append('resumen_usuario', respuesta);

    Obj_fetch.setURL(url+'calificar_respuesta');
    let div_msg = crearGloboTexto('IA');
    areaChat.appendChild(div_msg);
    div_msg.innerText = 'Cargando...';
    const respuesta_ia = await Obj_fetch.getPost_Json(data);
    div_msg.innerText = '';

    console.log(respuesta_ia);
    msg.push({'mensaje': respuesta_ia.IA, 'tipo': 'IA'})
    
    await speak(respuesta_ia.IA);
    await escribeMensaje(respuesta_ia.IA, div_msg);
}

async function chatContinuo(){
    let data = new FormData();    
    data.append('resumen', resumen);
    data.append('msg', JSON.stringify(msg));

    Obj_fetch.setURL(url+'chat_continuo');
    let div_msg = crearGloboTexto('IA');
    areaChat.appendChild(div_msg);
    div_msg.innerText = 'Cargando...';
    const respuesta_ia = await Obj_fetch.getPost_Json(data);
    div_msg.innerText = '';
    console.log(respuesta_ia);

    msg.push({'mensaje': respuesta_ia.IA, 'tipo': 'IA'})   
    await speak(respuesta_ia.IA);
    await escribeMensaje(respuesta_ia.IA, div_msg);
}
    

//////////////////////////////
/*FUNCIONES COMPLEMENTARIAS*/
//////////////////////////////

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
    var complements = [  "¡Bienvenido a tu quiz interactivo! \n Vamos a repasar lo que has aprendido.", 
     "¡Hora de poner a prueba tus conocimientos!\n  Bienvenido a tu quiz interactivo.",
     "¿Listo para demostrar todo lo que has aprendido?\n  ¡Bienvenido a tu quiz interactivo!", 
     "¡Bienvenido al quiz interactivo!\n  Demuestra tus conocimientos y aprende más.", 
     "¡Es hora de demostrar lo que sabes!\n  Bienvenido al quiz interactivo.", 
     "¡Bienvenido al quiz interactivo!\n  Comprueba tus conocimientos y aprende más.", 
     "¿Estás preparado para el reto?\n  Bienvenido a tu quiz interactivo.", 
     "¡Bienvenido al quiz interactivo!\n  Demuestra tus habilidades y aprende de forma interactiva.", 
     "¡Comienza la diversión!\n  Bienvenido al quiz interactivo, repasemos lo que has aprendido."
    
    ];
    
    let indice = Math.floor(Math.random() * complements.length);
    
    // Selecciona un complemento aleatoriamente
    var randomComplement = complements[indice];
    
    // Concatena el saludo y el complemento seleccionado
    var message = `${greeting}.
    ${randomComplement}`;
    
    return message;
}

function limpiarTexto(texto) {
    // Reemplazar los saltos de línea, retornos de carro y tabulaciones por espacios
    let textoLimpio = texto.replace(/[\n\r\t]/g, ' ');
  
    // Eliminar otros caracteres especiales
    //textoLimpio = textoLimpio.replace(/[^\w\s.,¿¡!?]/g, '');
  
    return textoLimpio;
}

function crearGloboTexto(usuario) {
    
    let div = document.createElement('div');
    switch (usuario) {
        case 'usuario':
            div.classList.add('usuario-msg');
        break;

        case 'IA':
            div.classList.add('ia-msg');    
        break;
    }    
    return div;
}

function complementoSaludo() {
    const variantes = [
      "¿Qué aprendiste en esta unidad? Menciona todo lo que recuerdes.",
      //"¿Recuerdas todo lo que aprendiste en la unidad? Cuéntamelo.",      
      "¿Listo para demostrar todo lo que aprendiste? Menciona todo lo que puedas.",
      "Repasemos lo que aprendiste en esta unidad. ¿Puedes recordarlo todo?",
      "Mencioname todo lo que aprendiste en la unidad. ¡Acepto cualquier detalle!",
      "¿Qué se te quedó grabado de esta unidad? Mencioname todo lo que puedas recordar.",      
      "¿Recuerdas todo lo que aprendiste en la unidad? ¡Cuéntamelo todo!"
    ];
    return variantes[Math.floor(Math.random() * variantes.length)];
}




/*Este bloque es para que el asistentes de voz hable*/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function speak(textToSpeak) {
    if(!emitir_sonido){
        //evita que el asistente de voz hable
        return;
    }
    // Create a new instance of SpeechSynthesisUtterance
    var utterance = new SpeechSynthesisUtterance(textToSpeak);   
    if(voiceSelected == null) {
        voiceSelected = await speechSynthesis.getVoices().filter(function(voice) { return voice.lang == 'es-MX'; })[1];
    }
    utterance.voice = voiceSelected;

    // Ajustar la velocidad de la voz (0.5 = más lento, 2 = más rápido)
    utterance.rate = 1.8; // Ajusta este valor según tus preferencias
    
    // Ajustar el tono de la voz (0.5 = más grave, 2 = más agudo)
    utterance.pitch = 1.8; // Ajusta este valor según tus preferencias
    // Speak the text
    speechSynthesis.speak(utterance);
}

async function escribeMensaje(message, div_msg){
    for (let i = 0; i < message.length; i++) {
        div_msg.innerHTML += (message.charAt(i) === ' ') ? ' ' : message.charAt(i);
        await sleep(delay_escribe); // Espera 50ms antes de agregar la siguiente letra
    }
    contenedor_chat.scrollTop = contenedor_chat.scrollHeight;
}
/*FIN del bloque ----------------------------------*/

// recognition.lang = 'es-MX'; // Establecer el idioma a español de México
function captura_voz() {
    recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'es-MX'; // Establecer el idioma a español de México
    recognition.continuous = true;
    recognition.interimResults = true;
  
    recognition.onresult = (event) => {
      const resultado = event.results[event.results.length - 1];
      const texto = resultado[0].transcript;
  
      if (resultado.isFinal) { // Agregar solo si el resultado es final      
        usuario_respuesta.value += texto;
      }
    };
  
    recognition.onerror = (event) => {
      console.error(event.error);
    };
  
    recognition.onend = () => {
      if (grabando) {
        recognition.start();
      }
    };
  
    recognition.start();
  }
  

async function getVoice() {
    // Esperar hasta que las voces estén disponibles
    await new Promise(resolve => window.speechSynthesis.onvoiceschanged = resolve);

    // Buscar una voz en español de México
    var voices = window.speechSynthesis.getVoices();
    voiceSelected = voices.find(function(voice) {
        //return voice.name === "Microsoft Raul - Spanish(Mexico)";
        return voice.lang === 'Microsoft Sabina - Spanish (Mexico)';
    });

   
}

/*
El liderazgo es una serie de habilidades que permiten motivar y dirigir a un equipo de personas hacia un mismo objetivo.También debe de poseer cualidades como la Honestidad la integridad y empatía.Existen varios tipos de liderazgo.¿Como el autoritario o el democrático?

 */