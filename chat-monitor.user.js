// ==UserScript==
// @name           Nifty Chat Monitor, Road-hog123 Customised
// @namespace      https://roadhog123.co.uk
// @description    adds inline images to Twitch chat
// @match        https://www.twitch.tv/*
// @version    0.307-RH0
// @updateURL https://raw.githubusercontent.com/road-hog123/significantly-less-nifty-chat/master/chat-monitor.user.js
// @downloadURL https://raw.githubusercontent.com/road-hog123/significantly-less-nifty-chat/master/chat-monitor.user.js
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant       GM_getResourceText
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_log
// @resource style https://raw.githubusercontent.com/road-hog123/significantly-less-nifty-chat/master/chat-monitor.css
// ==/UserScript==

var MESSAGE_CONTAINER = ".chat-list .tw-full-height";
waitForKeyElements(MESSAGE_CONTAINER, onChatLoad);
var twitterScript = document.createElement("script");
twitterScript.type = "text/javascript";
twitterScript.src = "https://platform.twitter.com/widgets.js";
document.body.appendChild(twitterScript);

function onChatLoad() {
  // The node to be monitored
  var target = document.querySelector(MESSAGE_CONTAINER);

  // Create an observer instance
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      var newNodes = mutation.addedNodes; // DOM NodeList
      if (newNodes !== null) {
        // If there are new nodes added
        newNodes.forEach(function(newNode) {
          if (newNode.nodeType == Node.ELEMENT_NODE) {
            // Add the newly added node's height to the scroll distance and reset the reference distance
            newNode.dataset.height = newNode.scrollHeight;

            if (!newNode.classList.contains("chat-line__message")) {
              // Only treat chat messages
              return;
            }

            //add inline images
            newNode.querySelectorAll(".chat-line__message > a")
              .forEach(function(link) {
                var re = /(.*(?:jpg|png|gif|jpeg))$/gm;
                if (re.test(link.textContent)) {
                  link.innerHTML =
                    '<img src="' + link.textContent.replace("media.giphy.com", "media1.giphy.com") + '" alt="' + link.textContent + '"/>';
                }
                var match = /^https?:\/\/giphy\.com\/gifs\/(.*-)?([a-zA-Z0-9]+)$/gm.exec(link.textContent);
                if (match) {
                  var imageUrl = "https://media1.giphy.com/media/" + match[2].split("-").pop() + "/giphy.gif";
                  link.innerHTML = '<img src="' + imageUrl + '" alt="' + link.textContent + '"/>';
                }
                match = /^https?:\/\/(www\.)?(youtu\.be\/|youtube\.com\/watch\?v=)([^&?]+).*$/gm.exec(link.textContent);
                if (match) {
                  var imageUrl = "https://img.youtube.com/vi/" + match[3] + "/mqdefault.jpg";
                  link.innerHTML = link.textContent + '<br/><img src="' + imageUrl + '" alt="' + link.textContent + '"/>';
                }
                match = /^https?:\/\/(www\.)?twitter\.com.+\/([0-9]+)$/gm.exec(link.textContent);
                if (match) {
                  var tweetContainer = document.createElement("div");
                  link.parentNode.appendChild(tweetContainer);
                  tweetContainer.style.display = "none";
                  twttr.widgets
                    .createTweet(match[2], tweetContainer, {theme: "dark", conversation: "hidden", cards: "hidden"})
                    .then(el => {
                      tweetContainer.style.display = "block";
                    })
                    .catch(e => console.log(e));
                }
              });

            newNode.querySelectorAll("img").forEach(img => {
              if (img.src.indexOf("jtvnw.net") === -1) {
                // don't do this for emoticons
                img.style.display = "none";
                img.addEventListener("load", e => {
                  img.style.display = "inline";
                  newNode.dataset.height = newNode.scrollHeight;
                });
              }
            });
          }
        });
      }
    });
  });

  // Pass in the target node, as well as the observer options
  observer.observe(target, {childList: true});
}

//inject custom stylessheet
var style = GM_getResourceText("style");
GM_addStyle(style);
