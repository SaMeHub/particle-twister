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
let wheel_over = document.querySelector(".wheel_over");
let ctx = wheel_over.getContext("2d");
let cards = document.querySelectorAll(".card");
let overlay_wrapper = document.querySelector(".overlay_wrapper");
let overlay = document.querySelector(".overlay");
let version = document.querySelector(".version");
let timer = null;

window.onload = function() {
  window.addEventListener('resize', (event) => {
    let content_rect = content.getBoundingClientRect();
    let wheel_comp = getComputedStyle(wheel);
    
    ctx.canvas.width  = wheel_img.width;
    ctx.canvas.height = wheel_img.height;
  
    wheel_over.style.position = 'absolute';
    wheel_over.style.left = wheel_comp.paddingLeft;
    wheel_over.style.top = (wheel_img.y - content_rect.top) + 'px';
    wheel_over.style.width = wheel_img.width + 'px';
    wheel_over.style.height = wheel_img.height + 'px';
    wheel_over.style.zIndex = 3;
    wheel_over.style.display = 'None'; // added, as canvas still needs some fixing on mobile

    // ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    // ctx.fillRect(0, 0, 0.5*wheel_img.width, 0.5*wheel_img.width);
    
    // overlay.style.width = 0.8 * content_rect.width + 'px';
    // overlay.style.height = 0.7 * content_rect.height + 'px';
  }, true);
  window.dispatchEvent(new Event('resize'));

  wheel.addEventListener('click', (event) => {
    if ('wheel' in data_store) {
      var random = Math.floor(Math.random() * (data_store.wheel.length));
      // var random = Math.floor(Math.random() * (max - min + 1)) + min;
      overlay.innerHTML = '<p class="head">wheel turn</p>'
        + '<p class="limb">' + data_store.wheel[random].limb + '</p>'
        + '<p>on</p>'
        + '<p class="label">' + data_store.wheel[random].label + '</p>'
        + '<p class="color_label">(' + data_store.wheel[random].color_label + ')</p>';
      speak(data_store.wheel[random].limb + ' on ' + data_store.wheel[random].label);
      overlay_wrapper.classList.remove('fadeOut');
      overlay_wrapper.classList.add('fadeIn');
      clearTimeout(timer);
      timer = setTimeout(() => {
        overlay_wrapper.classList.remove('fadeIn');
        overlay_wrapper.classList.add('fadeOut');
      }, 5000);
    }
  }, true);

  cards.forEach(card => card.addEventListener('click', (event) => {
    let color = card.dataset.color;
    if ('cards' in data_store && color in data_store.cards && data_store.cards[color].length > 0) {
      var random = Math.floor(Math.random() * (data_store.cards[color].length));
      // var random = Math.floor(Math.random() * (max - min + 1)) + min;
      overlay.innerHTML = '<p class="head">' + color + ' card</p>'
        + '<p class="limb">' + data_store.cards[color][random].limb + '</p>'
        + '<p>on</p>'
        + '<p class="label">' + data_store.cards[color][random].label + '</p>';
      speak(data_store.cards[color][random].limb + ' on ' + data_store.cards[color][random].label);
      overlay_wrapper.classList.remove('fadeOut');
      overlay_wrapper.classList.add('fadeIn');
      clearTimeout(timer);
      timer = setTimeout(() => {
        overlay_wrapper.classList.remove('fadeIn');
        overlay_wrapper.classList.add('fadeOut');
      }, 10000);
    }
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
    u.lang = 'en-US';
    u.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Google UK English Male'; })[0];
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

