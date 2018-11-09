// ==UserScript==
// @name           Nifty Chat Monitor, Road-hog123 Customised
// @namespace      https://roadhog123.co.uk
// @description    adds inline images to Twitch chat
// @match        https://www.twitch.tv/*
// @version    0.302-RH3
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

// Redirect to new layout if we find the old layout
if (document.querySelector('.ember-application')) {
    window.location = window.location.href.replace('twitch.tv', 'twitch.tv/popout');
}

let getQS = (str)=>{
    let a, q = {},r = /([^?=&\r\n]+)(?:=([^&\r\n]*))?/g;
    while ((a = r.exec(str)) !== null) {
        q[a[1]] = a[2]||'';
    }
    return q;
};

var qs = getQS(location.search);

var inlineImages = false;

var scrollDistance = 0,
    scrollReference = +new Date();

var MESSAGE_CONTAINER = '.chat-list .tw-full-height';
waitForKeyElements(MESSAGE_CONTAINER, onChatLoad);
var twitterScript = document.createElement("script");
twitterScript.type = "text/javascript";
twitterScript.src = "https://platform.twitter.com/widgets.js";
document.body.appendChild(twitterScript);

function onChatLoad() {
    loadSettings();
    actionFunction();
}

//Checks all config options and loads them appropriately
function loadSettings() {
    inlineImages = true;
}

function actionFunction() {
    //add keyboard command and element to hide chat
    $('body').keydown((e)=>{
        if(e.key=="H" && e.shiftKey && e.ctrlKey){
            e.preventDefault();
            $('#hide').toggle();
        }
    });
    $('<div id="hide" />').html('Chat Hidden<br/><br/><br/>Ctrl-Shift-H to Show').hide().appendTo('body');
    // The node to be monitored
    var target = document.querySelector(MESSAGE_CONTAINER);

    // The div containing the scrollable area
    var chatContentDiv = target.parentNode.parentNode;
    // Create an observer instance
    var observer = new MutationObserver(function( mutations ) {
        mutations.forEach(function( mutation ) {
            var newNodes = mutation.addedNodes; // DOM NodeList
            if( newNodes !== null ) { // If there are new nodes added
                newNodes.forEach(function(newNode) {
                    if (newNode.nodeType == Node.ELEMENT_NODE) {
                        // Add the newly added node's height to the scroll distance and reset the reference distance
                        newNode.dataset.height = newNode.scrollHeight;
                        scrollReference = scrollDistance += newNode.scrollHeight;

                        if (!newNode.classList.contains('chat-line__message')) { // Only treat chat messages
                            return;
                        }

                        //add data-user=<username> for user-based highlighting
                        newNode.dataset.user = newNode.querySelector('.chat-author__display-name').textContent;

                        //add data-badges=<badges> for badge-based highlighting
                        var badges = [];
                        newNode.querySelectorAll("img.chat-badge").forEach(function(badge){
                            badges.push(badge.alt);
                        });
                        newNode.dataset.badges = badges.join(',');

                        //add data-message=<message> for keyword-based highlighting
                        var message = newNode.querySelector("span[data-a-target='chat-message-text']");
                        if (message) {
                            newNode.dataset.message = message.textContent.replace(/(\r|\s{2,})/gm," ").trim().toLowerCase();
                        } else if (newNode.querySelector('.chat-image')) {
                            newNode.dataset.message = 'Emote: ' + newNode.querySelector('.chat-image').alt;
                        }

                        //add inline images
                        if(inlineImages) {
                            newNode.querySelectorAll('.chat-line__message > a').forEach(function(link) {
                                var re = /(.*(?:jpg|png|gif|jpeg))$/mg;
                                if (re.test(link.textContent)){
                                    link.innerHTML = '<img src="'+link.textContent.replace("media.giphy.com", "media1.giphy.com")+'" alt="'+link.textContent+'"/>';
                                }
                                var match = /^https?:\/\/giphy\.com\/gifs\/(.*-)?([a-zA-Z0-9]+)$/mg.exec(link.textContent);
                                if (match) {
                                    var imageUrl = "https://media1.giphy.com/media/" + match[2].split("-").pop() + "/giphy.gif";
                                    link.innerHTML = '<img src="'+imageUrl+'" alt="'+link.textContent+'"/>';
                                }
                                match = /^https?:\/\/(www\.)?(youtu\.be\/|youtube\.com\/watch\?v=)([^&?]+).*$/mg.exec(link.textContent);
                                if (match) {
                                    var imageUrl = "https://img.youtube.com/vi/" + match[3] + "/mqdefault.jpg";
                                    link.innerHTML = link.textContent+'<br/><img src="'+imageUrl+'" alt="'+link.textContent+'"/>';
                                }
                                match = /^https?:\/\/(www\.)?twitter\.com.+\/([0-9]+)$/mg.exec(link.textContent);
                                if (match) {
                                    var tweetContainer = document.createElement('div');
                                    link.parentNode.appendChild(tweetContainer);
                                    tweetContainer.style.display = 'none';
                                    twttr.widgets.createTweet(match[2], tweetContainer, { theme: 'dark', conversation: 'hidden', cards: 'hidden' }).then(el => {
                                        tweetContainer.style.display = 'block';
                                        scrollReference = scrollDistance += el.scrollHeight;
                                    }).catch(e => console.log(e));
                                }
                            });
                        }

                        if (!newNode.previousElementSibling.classList.contains('odd')) {
                            newNode.classList.add('odd');
                        }

                        newNode.querySelectorAll('img').forEach(img => {
                            if (img.src.indexOf('jtvnw.net') === -1) { // don't do this for emoticons
                                img.style.display = 'none';
                                img.addEventListener('load', e => {
                                    img.style.display = 'inline';
                                    scrollReference = scrollDistance += Math.max(0, img.scrollHeight - newNode.dataset.height);
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
    observer.observe(target, { childList: true });

    // Continually scroll up, in a way to make the comments readable
    var lastFrame = +new Date();
    function scrollUp(now) {
        if (chatContentDiv.scrollTop > 0 && GM_config.get("ReverseDirection")) {
            if (scrollDistance > 0 && GM_config.get("SmoothScroll")) {
                // estimate how far along we are in scrolling in the current scroll reference
                var currentStep = parseFloat(GM_config.get("SmoothScrollSpeed")) * 1000 / (now - lastFrame);
                scrollDistance -= scrollReference / currentStep;
                scrollDistance = Math.max(Math.floor(scrollDistance), 0);
                chatContentDiv.scrollTop = scrollDistance;
            } else {
                chatContentDiv.scrollTop = 0;
            }
        }
        lastFrame = now;
        window.requestAnimationFrame(scrollUp);
    }
    window.requestAnimationFrame(scrollUp);
	chatContentDiv.scrollTop = 0;
}

//inject custom stylessheet
var style = GM_getResourceText('style');
GM_addStyle(style);
