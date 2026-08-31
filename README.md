# TD Ignore

TD Ignore is a browser userscript for TigerDroppings.com. It maintains a local ignore list, hides posts from selected users, and collapses board topics they start.

Version 0.3.1 improves release metadata and documentation without changing the behavior validated in version 0.3.0.

## Features

- Maintains a local ignored-user list across browser sessions.
- Adds an **Ignore** button beside usernames in TigerDroppings thread posts.
- Does not offer the **Ignore** control on the logged-in user's own posts, identified by comparing the post author's numeric user ID with the account/avatar profile ID.
- Collapses posts from ignored users.
- Collapses topics started by ignored users on TigerDroppings board/index pages.
- Provides **Show** to reveal one hidden post or topic temporarily.
- Provides **Unignore** to restore that user's posts and started topics.
- Provides a fixed **TD Ignore** manager with an ignored-user count, individual **Unignore** controls, and **Unignore All** with confirmation.

## Browser compatibility

- Microsoft Edge + Tampermonkey: tested
- Brave + Tampermonkey: tested
- Mozilla Firefox + Tampermonkey: tested

Edge and Brave are Chromium-based, while Firefox uses Gecko. Google Chrome is expected to work based on Chromium compatibility, but it has not been directly tested.

## Privacy

Ignored users are stored locally by the userscript manager. TD Ignore does not modify the user's TigerDroppings account or send the ignore list to TigerDroppings. It contains no analytics or tracking and makes no external network requests.

## Installation

TD Ignore is not yet published on Greasy Fork. To install it manually with Tampermonkey:

1. Install Tampermonkey.
2. Create a new userscript.
3. Replace its sample contents with [`src/td-ignore.user.js`](src/td-ignore.user.js).
4. Save it.
5. Visit or reload TigerDroppings.

## Planned future direction

Possible future improvements include:

- Greasy Fork distribution.
- A possible packaged browser extension later.
