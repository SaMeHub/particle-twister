/* particle-twister.mehlhase.info */
/* (c) Sascha Mehlhase - kontakt@mehlhase.info */
/* game idea: Sascha Mehlhase */
/* board design: Katarina Anthony and Sascha Mehlhase */
/* coding/PWA: Sascha Mehlhase */

// Registering Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("./sw.js", { scope: "./" });
}

var data_store = {};
fetch('./data/wheel_card_data.json')
  .then(response => response.json())
  .then(data => data_store = data)
  .catch(error => console.log(error));

let content = document.querySelector(".content");
let wheel = document.querySelector(".wheel");
let wheel_img = document.querySelector(".wheel_img");
let wheel_canvas = document.createElement('canvas');
let ctx = null;
let cards = document.querySelectorAll(".card");
let langs = document.querySelectorAll(".lang");
let overlay_wrapper = document.querySelector(".overlay_wrapper");
let overlay = document.querySelector(".overlay");
let version = document.querySelector(".version");
let timer = null;
let wheel_pos = 0;
let step_time = 10;
let scale = 2;
let language = 'en';

window.onload = function() {
  wheel_canvas.id = 'wheel_canvas';
  wheel.appendChild(wheel_canvas);
  wheel_img.remove();

  ctx = wheel_canvas.getContext("2d");
  let devicePixelRatio = window.devicePixelRatio || 1;
  let backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
  scale = 2 * devicePixelRatio / backingStoreRatio;

  function checkLanguage() {
    let lang_enable = document.querySelector(".buttons a.lang[data-lang='" + language + "']");
    // lang_enable.style.background = 'rgba(254, 240, 105, 1)';
    // lang_enable.style.color = 'rgba(0, 0, 0, 1)';
    lang_enable.style.border = '3px solid rgba(0, 0, 0, 1)';
    document.querySelectorAll(".buttons a.lang:not([data-lang='" + language + "'])").forEach(lang_disable => {
      // lang_disable.style.background = 'rgba(239, 80, 152, 1)';
      // lang_disable.style.color = 'rgba(255, 255, 255, 1)';
      lang_disable.style.border = '';
    });
  }
  checkLanguage();

  window.addEventListener('resize', (event) => {
    let content_comp = window.getComputedStyle(content, null);
    content.style.width = (parseFloat(content_comp.height)) * 9 / 16 + 'px';

    let wheel_comp = window.getComputedStyle(wheel, null);
    let size = parseFloat(wheel_comp.width) - parseFloat(wheel_comp.paddingLeft) - parseFloat(wheel_comp.paddingRight);
    wheel_canvas.style.width = size + 'px';
    wheel_canvas.style.height = size + 'px';
    wheel_canvas.width = size * scale;
    wheel_canvas.height = size * scale;
    ctx.drawImage(wheel_img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    drawArrow(wheel_pos);
  }, true);
  window.dispatchEvent(new Event('resize'));

  function drawArrow(pos) {
    let mid = ctx.canvas.width * 0.5;
    let len = ctx.canvas.width * 0.4;
    let rad = Math.PI / 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(mid, mid);
    ctx.lineTo(mid + Math.cos(pos * rad + rad / 2 - rad / 3) * len * 0.75, mid - Math.sin(pos * rad + rad / 2 - rad / 3) * len * 0.75);
    ctx.lineTo(mid + Math.cos(pos * rad + rad / 2) * len, mid - Math.sin(pos * rad + rad / 2) * len);
    ctx.lineTo(mid + Math.cos(pos * rad + rad / 2 + rad / 3) * len * 0.75, mid - Math.sin(pos * rad + rad / 2 + rad / 3) * len * 0.75);
    ctx.closePath();
    ctx.fill();
  }
  
  function moveArrow(steps) {
    wheel_pos = (wheel_pos + 1) % data_store.wheel.length;
    window.dispatchEvent(new Event('resize'));
    if (steps <= 0) {
      overlay.innerHTML = '<p class="head">' + data_store.lang[language].turn + '</p>'
        + '<p class="limb">' + data_store.wheel[wheel_pos]['limb_' + language] + '</p>'
        + '<p>' + data_store.lang[language].on + '</p>'
        + '<p class="label">' + data_store.wheel[wheel_pos]['label_' + language] + '</p>'
        + '<p class="color_label">(' + data_store.wheel[wheel_pos]['color_label_' + language] + ')</p>';
      speak(data_store.wheel[wheel_pos]['limb_' + language] + ' ' + data_store.lang[language].on + ' ' + data_store.wheel[wheel_pos]['label_' + language]);
      overlay_wrapper.classList.remove('fadeOut');
      overlay_wrapper.classList.add('fadeIn');
      clearTimeout(timer);
      timer = setTimeout(() => {
        overlay_wrapper.classList.remove('fadeIn');
        overlay_wrapper.classList.add('fadeOut');
      }, 5000);
      return 0;
    }
    // let step_time_eff = Math.round(step_time + (5 * step_time - 5 * step_time * Math.tanh((steps - 30) / 10)), 0);
    // let step_time_eff = Math.round(step_time + (7.5 * step_time - 7.5 * step_time * Math.tanh((steps - 10) / 30)), 0);
    // let step_time_eff = Math.round((10 * step_time) / (steps + 0) + step_time, 0);
    // let step_time_eff = Math.round((100 * step_time) / (steps + 0) + step_time / 2, 0);
    let step_time_eff = Math.round((50 * step_time) / (steps + 0) + step_time / 2, 0);
    // console.log('steps = ' + steps + '; step_time_eff = ' + step_time_eff);
    setTimeout(() => {
      moveArrow(steps - 1)
    }, step_time_eff);
    return steps;
  }

  wheel.addEventListener('click', (event) => {
    if ('wheel' in data_store) {
      // var random = Math.floor(Math.random() * (max - min + 1)) + min;
      var new_pos = Math.floor(Math.random() * (data_store.wheel.length));
      // console.log('moving from ' + wheel_pos + ' to ' + new_pos);
      var steps = (new_pos - wheel_pos + data_store.wheel.length) % data_store.wheel.length + 3 * data_store.wheel.length;
      // console.log('that\'s ' + steps + ' steps');
      overlay_wrapper.classList.remove('fadeIn');
      moveArrow(steps);
    }
  }, true);

  cards.forEach(card => card.addEventListener('click', (event) => {
    let color = card.dataset.color;
    if ('cards' in data_store && color in data_store.cards && data_store.cards[color].length > 0) {
      var random = Math.floor(Math.random() * (data_store.cards[color].length));
      // var random = Math.floor(Math.random() * (max - min + 1)) + min;
      overlay.innerHTML = '<p class="head">' + data_store.lang[language].pick + '</p>'
        + '<p class="limb">' + data_store.cards[color][random]['limb_' + language] + '</p>'
        + '<p>' + data_store.lang[language].on + '</p>'
        + '<p class="label">' + data_store.cards[color][random]['label_' + language] + '</p>';
      speak(data_store.cards[color][random]['limb_' + language] + ' ' + data_store.lang[language].on + ' ' + data_store.cards[color][random]['label_' + language]);
      overlay_wrapper.classList.remove('fadeOut');
      overlay_wrapper.classList.add('fadeIn');
      clearTimeout(timer);
      timer = setTimeout(() => {
        overlay_wrapper.classList.remove('fadeIn');
        overlay_wrapper.classList.add('fadeOut');
      }, 10000);
    }
  }, true));

  langs.forEach(lang => lang.addEventListener('click', (event) => {
    language = lang.dataset.lang;
    checkLanguage();
  }, true));

  // setting up text-to-speech feature
  function loadVoices() {
    window.speechSynthesis.getVoices();
    // console.log(window.speechSynthesis.getVoices());
  }
  loadVoices();
  window.speechSynthesis.onvoiceschanged = function(e) {loadVoices();};

  // function to speak out a given text
  function speak(text, callback) {
    let u = new SpeechSynthesisUtterance();
    u.text = text;
    switch (language) {
      case "de":
        u.lang = 'de-DE';
        u.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Google Deutsch'; })[0];
        break;
      default:
        u.lang = 'en-US';
        u.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Google UK English Male'; })[0];
    }
    u.onend = function () {
      if (callback) {
        callback();
      }
    };
    u.onerror = function (e) {
      if (callback) {
        callback(e);
      }
    };
    window.speechSynthesis.speak(u);
  }
};

