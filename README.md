# TD Ignore

TD Ignore is a browser userscript for TigerDroppings.com. It maintains a local ignore list, hides posts from selected users, and collapses board topics they start.

The current release is **version 0.3.1**.

## Features

- Maintains a local ignored-user list across browser sessions.
- Adds an **Ignore** button beside usernames in TigerDroppings thread posts.
- Does not offer the **Ignore** control on the logged-in user's own posts, identified by comparing the post author's numeric user ID with the account/avatar profile ID.
- Collapses posts from ignored users.
- Collapses topics started by ignored users on TigerDroppings board/index pages.
- Provides **Show** to reveal one hidden post or topic temporarily.
- Provides **Unignore** to restore that user's posts and started topics.
- Provides a fixed **TD Ignore** manager with an ignored-user count, individual **Unignore** controls, and **Unignore All** with confirmation.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Open the [TD Ignore page on Greasy Fork](https://greasyfork.org/en/scripts/593685-td-ignore).
3. Click **Install this script**.
4. Confirm the installation in Tampermonkey.
5. Visit or reload [TigerDroppings](https://www.tigerdroppings.com/).

Users who prefer a manual installation can copy the repository's [`src/td-ignore.user.js`](src/td-ignore.user.js) into a new Tampermonkey userscript.

## Browser compatibility

Tested with Tampermonkey on:

- Microsoft Edge
- Brave
- Mozilla Firefox

Edge and Brave are Chromium-based, while Firefox uses Gecko. Google Chrome is expected to work based on Chromium compatibility, but it has not been directly tested.

## Privacy

Ignored users are stored locally by the userscript manager. TD Ignore does not modify the user's TigerDroppings account or send the ignore list to TigerDroppings. It contains no analytics or tracking and makes no external network requests.

## Planned future direction

A packaged browser extension may be considered later.
