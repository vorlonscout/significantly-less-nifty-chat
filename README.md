# Nifty Chat Monitor: Rustproof Bee Shed Edition

Userscript for Grease/Tampermonkey to reformat the twitch chat for use on an non-interactive chat monitor. It removes all extraneous formatting to maximize screen real estate for the chat text and adds various hooks to each chat message so that they can be effectively targeted by CSS rules.

## Features

- removes header
- removes leaderboard
- removes notifications
- removes scrollbars
- increases text size
- changes font to Open Sans Condensed to maximize text density and legibility
- adds zebra striping for legibility
- configurable username colors
- optionally removes text input field
- optionally reverse chat direction
- optionally inlines linked images, videos, youtube video thumbnails and tweets
- smooth scrolling in of new messages

## Default Highlighting

- Broadcaster messages highlighted in blue
- Moderator usernames are light blue
- LRRbot username in purple
- LRRbot sub welcome messages highlighted in purple
- LoadingReadyRun mentions highlighted in dark blue

## Installation

- Install the [Tampermonkey](https://tampermonkey.net/) or [Greasemonkey](https://addons.mozilla.org/addon/greasemonkey/) (Firefox Only) extension for your browser
- [View the Raw JS Script File](https://github.com/Road-hog123/significantly-less-nifty-chat/raw/rustproof-bee-shed/chat-monitor.user.js), Tampermonkey will detect that you're opening a userscript and prompt to install it
- If it doesn't, you can copy the contents of the Raw JS file into a new Tampermonkey userscript

## Usage

To view the reformatted chat, go to `https://www.twitch.tv/popout/<CHANNEL NAME>/chat?display`

To access options click the settings wheel in the top right hand corner of the screen. Remember to save, and then refresh the page to apply the new options.

## Hooks

- Every other message is given a `odd` class for accurate zebra striping
- The root element of each message is given the following extra attributes:
  - `data-user` - contains the message author
  - `data-badges` - comma seperated list of author's badges
  - `data-message` - the full text of the message
