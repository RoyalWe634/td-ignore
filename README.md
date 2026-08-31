# TD Ignore

TD Ignore is an early working browser userscript prototype for TigerDroppings.com. It gives each user a local ignore list and hides posts from selected posters without changing the TigerDroppings server or account.

Version 0.1.2 builds on a prototype tested successfully in Microsoft Edge with Tampermonkey.

## Current working features

- Adds an **Ignore** button beside usernames in TigerDroppings thread posts.
- Does not offer the **Ignore** control on the logged-in user's own posts.
- Identifies users internally by their TigerDroppings numeric user ID rather than display name.
- Immediately collapses all posts on the current page from an ignored user.
- Persists the ignore list locally across reloads and browser sessions.
- Leaves a compact gold **IGNORED** marker where a hidden post was.
- Provides **Show** to reveal one hidden post temporarily.
- Provides **Unignore** to restore that user's posts.

The ignore list remains local to the user's browser and userscript manager. TD Ignore does not modify the TigerDroppings server or the user's TigerDroppings account.

## Development installation

1. Install a userscript manager such as Tampermonkey.
2. Create a new userscript.
3. Replace its sample contents with [`src/td-ignore.user.js`](src/td-ignore.user.js).
4. Save the userscript.
5. Visit or reload a TigerDroppings thread.

## Planned future direction

Possible future improvements include:

- An ignored-user management UI.
- Hiding board-list threads started by ignored users.
- Optional handling of quoted content.
- Greasy Fork distribution.
- A possible packaged browser extension later.
