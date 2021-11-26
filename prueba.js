console.clear();
var maximo = 0;
var started = null;
const CVS = document.body.querySelector('canvas'); //Obtiene elemento canvas
const W = CVS.width = window.innerWidth; //Ancho de la ventana
const H = CVS.height = window.innerHeight; //Alto de la ventana
const CTX = CVS.getContext('2d'); // Toma contexto en 2d 

var countClick = 0;

document.body.querySelector('canvas').style.display = 'none';
document.body.querySelector('.interface').style.display = 'none';
document.body.querySelector('.title-container').style.display = 'none';

document.body.querySelector('#frecuencias_manual').addEventListener('click', () => {
  if (started) return;
  started = true;
  
  initialize2();
})
document.body.querySelector('#frecuencias_voz').addEventListener('click', () => {
  if (started) return;
  started = true;
  initialize();
})



function initialize2(){
  window.addEventListener("load",iniciar())

  document.body.querySelector('.interface').style = 'block';
  document.body.querySelector('.wrapper-buttons').remove();

  document.getElementById('iniciar').addEventListener("click",iniciarFrequency);
  document.getElementById('range').addEventListener("change", changeFrequency);
}


function iniciar(){
  try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
  } catch (error) {
    console.error(error)  
  }
}

function iniciarFrequency(){
  if (countClick == 0) {
    countClick++;
    let range = document.getElementById("range").value;
    
    const analyser = context.createAnalyser();
    analyser.fftSize = 4096;
    analyser.connect(context.destination);
    let frequencyBins = new Uint8Array(analyser.frequencyBinCount);

    osc = context.createOscillator();
    osc.frequency.value = range;
    osc.connect(analyser);
    osc.start(0);
    document.querySelector(".show-Frequency").innerHTML = range + "Hz";
    process2(analyser);
  }
}

function changeFrequency(){
  let range = document.getElementById("range").value;
  osc.frequency.value = range;
  document.querySelector(".show-Frequency").innerHTML = range + "Hz"
  process2(analyser);
}

function process2(analyser){
  document.body.querySelector('canvas').style.display = 'block'
  document.body.querySelector('.interface').style.display = 'block';
    const DATA = new Uint8Array(analyser.frequencyBinCount);
    const LEN = DATA.length;
    const h = H / LEN;
    const x = W - 1;
    CTX.fillStyle = 'hsl(2, 100%, 10%)';
    CTX.fillRect(0, 0, W, H);
      loop();
    //Se genera la imagen del espectrograma
    function loop() {
      window.requestAnimationFrame(loop);
      let imgData = CTX.getImageData(1, 0, W-1, H);
      CTX.fillRect(0, 0, W, H);
      CTX.putImageData(imgData, 0, 0);
      analyser.getByteFrequencyData(DATA);
      for (let i = 0; i < LEN; i++) {
        let rat = DATA[i] / 255;
        let hue = Math.round((rat * 120) + 280 % 360);
        let sat = '100%';
        let lit = 10 + (70 * rat) + '%';
        CTX.beginPath();
        CTX.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;
        CTX.moveTo(x, H - (i * h));
        CTX.lineTo(x, H - (i * h + h));
        CTX.stroke();
      }
    }


}


function initialize() {
  
  document.body.querySelector('canvas').style.display = 'block'
  document.body.querySelector('.title-container').style.display = 'flex';
  document.body.querySelector('.wrapper-buttons').remove();
  const ACTX = new AudioContext(); //Instancia de la clase AudioContext
  const ANALYSER = ACTX.createAnalyser(); //Crea nodo analizador
  ANALYSER.fftSize = 4096;  //Rango de frecuencias cubierto por el analisis FFT dependiendo de la cantidad de muestras recogidas 
  //Permisos de microfono
  navigator.mediaDevices
  .getUserMedia({ audio: true })
  //Si acepta los terminos entonces inicia la funcion process
  .then(process);
  console.log(ANALYSER.frequencyBinCount);

  
  function process(stream) {
    console.log(stream);
    const SOURCE = ACTX.createMediaStreamSource(stream);
    SOURCE.connect(ANALYSER);
    const DATA = new Uint8Array(ANALYSER.frequencyBinCount);
    const LEN = DATA.length;
    const h = H / LEN;
    const x = W - 1;
    CTX.fillStyle = "#7b113a";
    CTX.fillRect(0, 0, W, H);
      loop();
    //Se genera la imagen del espectrograma
    function loop() {
      setTimeout(() => {
        getLoudestFrequency()
      }, 500);
      window.requestAnimationFrame(loop);
      let imgData = CTX.getImageData(1, 0, W - 1, H);
      CTX.fillRect(0, 0, W, H);
      CTX.putImageData(imgData, 0, 0);
      ANALYSER.getByteFrequencyData(DATA);
      for (let i = 0; i < LEN; i++) {
        let rat = DATA[i] / 255;
        let hue = Math.round((rat * 120) + 280 % 360);
        let sat = '100%';
        let lit = 10 + (70 * rat) + '%';
        CTX.beginPath();
        CTX.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;
        CTX.moveTo(x, H - (i * h));
        CTX.lineTo(x, H - (i * h + h));
        CTX.stroke();
      }
    }

    function getLoudestFrequency() {
      var nyquist = ANALYSER.fftSize / 2; // 22050
      var numberOfBins = DATA.length;
      var maxAmp = 0;
      var largestBin;
  
      var aux;
      for (var i = 0; i < numberOfBins; i++) {
          var thisAmp = DATA[i]; // amplitude of current bin
          if (thisAmp > maxAmp) {
              maxAmp = thisAmp;
              largestBin = i;
          }
      }
      var loudestFreq = largestBin * (nyquist / numberOfBins);
      if (maximo < loudestFreq){
        maximo = loudestFreq
        document.querySelector('#frecuenciaAlta').innerHTML = maximo * 10 + ' Hz';
      }


      if(isNaN(loudestFreq)){
        document.querySelector('#frecuenciaActual').innerHTML = '0 Hz';

      }else{
        document.querySelector('#frecuenciaActual').innerHTML = loudestFreq * 10 + ' Hz';

      }

      console.log(loudestFreq);
  }
  }
  
  
}
