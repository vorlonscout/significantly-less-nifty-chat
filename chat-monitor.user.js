// ==UserScript==
// @name           Nifty Chat Monitor, Road-hog123 Customised
// @namespace      https://roadhog123.co.uk/
// @description    inlines Images, GIPHY GIFs, YouTube Thumbnails and Tweets in Twitch chat
// @match          https://www.twitch.tv/*
// @version        0.307-RH6
// @updateURL      https://raw.githubusercontent.com/road-hog123/significantly-less-nifty-chat/master/chat-monitor.user.js
// @downloadURL    https://raw.githubusercontent.com/road-hog123/significantly-less-nifty-chat/master/chat-monitor.user.js
// @require        https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require        https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant          GM_log
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
      // Get list of new nodes
      var newNodes = mutation.addedNodes;

      // Check if there are new nodes added
      if (newNodes == null) {
        return;
      }

      newNodes.forEach(function(newNode) {
        if (newNode.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        // Only treat chat messages
        if (!newNode.classList.contains("chat-line__message")) {
          return;
        }

        //add inline images
        newNode.querySelectorAll(".chat-line__message > a")
          .forEach(function(link) {
            if (isImageLink(link.href)) {
              linkImage(link.parentNode, link.href.replace("media.giphy.com", "media1.giphy.com"));
              return;
            }
            giphyID = getGiphyID(link.href)
            if (giphyID) {
              linkImage(link.parentNode, "https://media1.giphy.com/media/" + giphyID + "/giphy.gif");
              return;
            }
            videoID = getYouTubeVideoID(link.href)
            if (videoID) {
              linkImage(link.parentNode, "https://img.youtube.com/vi/" + videoID + "/mqdefault.jpg");
              return;
            }
            twitterID = getTweetID(link.href)
            if (twitterID) {
              linkTwitter(link, twitterID);
              return;
            }
          });
      });
    });
  });

  // Pass in the target node, as well as the observer options
  observer.observe(target, {childList: true});
}

function isImageLink(url) {
  return /(.*(?:jpg|png|gif|jpeg))$/gm.test(url);
}

function getGiphyID(url) {
  let match = /^https?:\/\/giphy\.com\/gifs\/(.*-)?([a-zA-Z0-9]+)$/gm.exec(url);
  return ((match) ? match[2] : "")
}

function getYouTubeVideoID(url) {
  let match = /^https?:\/\/(www\.)?(youtu\.be\/|youtube\.com\/watch\?v=)([^&?]+).*$/gm.exec(url);
  return ((match) ? match[3] : "");
}

function getTweetID(url) {
  let match = /^https?:\/\/(www\.)?twitter\.com.+\/([0-9]+)$/gm.exec(url);
  return ((match) ? match[2] : "");
}

function linkImage(node, imageURL) {
  var image = document.createElement("img")
  node.appendChild(image);
  image.style.display = "none";
  image.style.maxWidth = "100%";
  image.style.maxHeight = "50vh";
  image.style.margin = "0.25em 0";
  image.src = imageURL
  image.addEventListener("load", function(){ image.style.display = "inline"; })
}

function linkTwitter(node, tweetURL) {
  var tweet = document.createElement("div")
  node.appendChild(tweet);
  tweet.style.display = "none";
  twttr.widgets
    .createTweet(tweetURL, tweet, {theme: "dark", conversation: "hidden", cards: "hidden"})
    .then(function(){ tweet.style.display = "block"; })
    .catch(e => console.log(e));
}
