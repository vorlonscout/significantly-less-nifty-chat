# Significantly Less Nifty Chat: An Edit of Nifty Chat Monitor

Userscript for Grease/Tampermonkey to inline Images, GIPHY GIFs, YouTube Thumbnails and Tweets in Twitch chat. It does nothing else.

This script was derived from the Paul Saunders' [Nifty Chat Monitor](https://github.com/paul-lrr/nifty-chat-monitor) script, created by Paul and with contributions from LoadingReadyRun viewers.

### Features
- inlines linked images
- inlines GIPHY GIFs
- inlines thumbnail images for YouTube video links
- inlines tweets

## Installation
- Install the [Tampermonkey](https://tampermonkey.net/) or [Greasemonkey](https://addons.mozilla.org/addon/greasemonkey/) (Firefox Only) extension for your browser
- [View the Raw JS Script File](https://github.com/Road-hog123/significantly-less-nifty-chat/raw/master/chat-monitor.user.js), Tampermonkey will detect that you're opening a userscript and prompt to install it
- If it doesn't, you can copy the contents of the Raw JS file into a new Tampermonkey userscript

## Usage
- Unlike the Nifty Chat Monitor script, this userscript works on any Twitch channel watch page.
- When posting a link in chat, note that it won't be inlined if it doesn't end in an image extension, or if the url involves ports.
