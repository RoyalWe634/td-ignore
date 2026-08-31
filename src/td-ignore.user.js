// ==UserScript==
// @name         TD Ignore
// @namespace    td-ignore
// @version      0.3.0
// @description  Locally ignore selected posters on TigerDroppings.
// @match        https://www.tigerdroppings.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'tdIgnoreUsers';

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    function getIgnoredUsers() {
        return GM_getValue(STORAGE_KEY, {});
    }

    function saveIgnoredUsers(users) {
        GM_setValue(STORAGE_KEY, users);
    }

    function isIgnored(userId) {
        const ignoredUsers = getIgnoredUsers();
        return Boolean(ignoredUsers[userId]);
    }

    function ignoreUser(userId, username) {
        const ignoredUsers = getIgnoredUsers();

        ignoredUsers[userId] = {
            username: username
        };

        saveIgnoredUsers(ignoredUsers);
        refreshPage();
        refreshIgnoreManager();
    }

    function unignoreUser(userId) {
        const ignoredUsers = getIgnoredUsers();

        delete ignoredUsers[userId];

        saveIgnoredUsers(ignoredUsers);
        refreshPage();
        refreshIgnoreManager();
    }

    // -------------------------------------------------------------------------
    // TigerDroppings user identification
    // -------------------------------------------------------------------------

    function getUserIdFromLink(userLink) {
        if (!userLink) {
            return null;
        }

        const match = userLink.href.match(/[?&]u=(\d+)/);

        return match ? match[1] : null;
    }

    function getLoggedInUserId() {
        const profileLink = document.querySelector(
            '.menu-ava a[href*="/users/prof.aspx?u="]'
        );

        return getUserIdFromLink(profileLink);
    }

    function getUserInfo(post) {
        const userLink = post.querySelector('.author a.RegUser');

        if (!userLink) {
            return null;
        }

        const username = userLink.textContent.trim();
        const userId = getUserIdFromLink(userLink);

        if (!userId) {
            return null;
        }

        return {
            id: userId,
            username: username,
            link: userLink
        };
    }

    // -------------------------------------------------------------------------
    // Ignore button
    // -------------------------------------------------------------------------

    function isOwnPost(userId, loggedInUserId) {
        return loggedInUserId !== null && userId === loggedInUserId;
    }

    function addIgnoreButton(post, user) {
        if (post.querySelector('.td-ignore-button')) {
            return;
        }

        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'td-ignore-button';
        button.textContent = 'Ignore';
        button.title = `Ignore ${user.username}`;

        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            ignoreUser(user.id, user.username);
        });

        user.link.insertAdjacentElement('afterend', button);
    }

    // -------------------------------------------------------------------------
    // Collapse / restore posts
    // -------------------------------------------------------------------------

    function collapsePost(post, user) {
        post.classList.add('td-ignore-collapsed');

        let placeholder = post.querySelector('.td-ignore-placeholder');

        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'td-ignore-placeholder';

            const message = document.createElement('span');
            message.className = 'td-ignore-message';
            message.textContent = `IGNORED - Post by ${user.username} hidden`;

            const showButton = document.createElement('button');
            showButton.type = 'button';
            showButton.textContent = 'Show';

            showButton.addEventListener('click', function () {
                post.classList.remove('td-ignore-collapsed');
                placeholder.style.display = 'none';
            });

            const unignoreButton = document.createElement('button');
            unignoreButton.type = 'button';
            unignoreButton.textContent = 'Unignore';

            unignoreButton.addEventListener('click', function () {
                unignoreUser(user.id);
            });

            placeholder.appendChild(message);
            placeholder.appendChild(showButton);
            placeholder.appendChild(unignoreButton);

            post.appendChild(placeholder);
        }

        placeholder.style.display = '';
    }

    function restorePost(post) {
        post.classList.remove('td-ignore-collapsed');

        const placeholder = post.querySelector('.td-ignore-placeholder');

        if (placeholder) {
            placeholder.remove();
        }
    }

    // -------------------------------------------------------------------------
    // Process page
    // -------------------------------------------------------------------------

    function refreshPosts() {
        const loggedInUserId = getLoggedInUserId();
        const posts = document.querySelectorAll(
            '.maincont1.indRow, .maincont1.indRowAlt'
        );

        posts.forEach(function (post) {
            const user = getUserInfo(post);

            if (!user) {
                return;
            }

            if (!isOwnPost(user.id, loggedInUserId)) {
                addIgnoreButton(post, user);
            }

            if (isIgnored(user.id)) {
                collapsePost(post, user);
            } else {
                restorePost(post);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Collapse / restore board threads
    // -------------------------------------------------------------------------

    function collapseBoardThread(thread, user) {
        thread.classList.add('td-ignore-thread-collapsed');

        let placeholder = thread.querySelector(
            '.td-ignore-thread-placeholder'
        );

        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className =
                'td-ignore-placeholder td-ignore-thread-placeholder';

            const message = document.createElement('span');
            message.className = 'td-ignore-message';
            message.textContent =
                `IGNORED - Thread by ${user.username} hidden`;

            const showButton = document.createElement('button');
            showButton.type = 'button';
            showButton.textContent = 'Show';

            showButton.addEventListener('click', function () {
                thread.classList.remove('td-ignore-thread-collapsed');
                placeholder.style.display = 'none';
            });

            const unignoreButton = document.createElement('button');
            unignoreButton.type = 'button';
            unignoreButton.textContent = 'Unignore';

            unignoreButton.addEventListener('click', function () {
                unignoreUser(user.id);
            });

            placeholder.appendChild(message);
            placeholder.appendChild(showButton);
            placeholder.appendChild(unignoreButton);

            thread.appendChild(placeholder);
        }

        placeholder.style.display = '';
    }

    function restoreBoardThread(thread) {
        thread.classList.remove('td-ignore-thread-collapsed');

        const placeholder = thread.querySelector(
            '.td-ignore-thread-placeholder'
        );

        if (placeholder) {
            placeholder.remove();
        }
    }

    function refreshBoardThreads() {
        const threads = document.querySelectorAll('div.index.indRow');

        threads.forEach(function (thread) {
            const starterLink = thread.querySelector(
                '.author-ind a.author[href*="/users/prof.aspx?u="]'
            );
            const userId = getUserIdFromLink(starterLink);

            if (!starterLink || !userId) {
                return;
            }

            const user = {
                id: userId,
                username: starterLink.textContent.trim()
            };

            if (isIgnored(user.id)) {
                collapseBoardThread(thread, user);
            } else {
                restoreBoardThread(thread);
            }
        });
    }

    function refreshPage() {
        refreshPosts();
        refreshBoardThreads();
    }

    // -------------------------------------------------------------------------
    // Ignored-user manager
    // -------------------------------------------------------------------------

    function refreshIgnoreManager() {
        const ignoredUsers = getIgnoredUsers();
        const ignoredEntries = Object.entries(ignoredUsers);
        const managerButton = document.querySelector(
            '.td-ignore-manager-button'
        );

        if (managerButton) {
            managerButton.textContent = `TD Ignore (${ignoredEntries.length})`;
        }

        const list = document.querySelector('.td-ignore-manager-list');

        if (!list) {
            return;
        }

        list.replaceChildren();

        if (ignoredEntries.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'td-ignore-manager-empty';
            emptyMessage.textContent = 'No users currently ignored.';
            list.appendChild(emptyMessage);
        } else {
            ignoredEntries.forEach(function ([userId, user]) {
                const row = document.createElement('div');
                row.className = 'td-ignore-manager-row';

                const username = document.createElement('span');
                username.className = 'td-ignore-manager-username';
                username.textContent = user.username;

                const unignoreButton = document.createElement('button');
                unignoreButton.type = 'button';
                unignoreButton.textContent = 'Unignore';

                unignoreButton.addEventListener('click', function () {
                    unignoreUser(userId);
                });

                row.appendChild(username);
                row.appendChild(unignoreButton);
                list.appendChild(row);
            });
        }

        const unignoreAllButton = document.querySelector(
            '.td-ignore-manager-unignore-all'
        );

        if (unignoreAllButton) {
            unignoreAllButton.disabled = ignoredEntries.length === 0;
        }
    }

    function openIgnoreManager() {
        const overlay = document.querySelector('.td-ignore-manager-overlay');

        if (!overlay) {
            return;
        }

        refreshIgnoreManager();
        overlay.hidden = false;
    }

    function closeIgnoreManager() {
        const overlay = document.querySelector('.td-ignore-manager-overlay');

        if (overlay) {
            overlay.hidden = true;
        }
    }

    function unignoreAllUsers() {
        const ignoredUsers = getIgnoredUsers();

        if (Object.keys(ignoredUsers).length === 0) {
            return;
        }

        if (!window.confirm('Unignore all users?')) {
            return;
        }

        saveIgnoredUsers({});
        refreshPage();
        refreshIgnoreManager();
    }

    function addIgnoreManager() {
        let managerButton = document.querySelector(
            '.td-ignore-manager-button'
        );

        if (!managerButton) {
            managerButton = document.createElement('button');
            managerButton.type = 'button';
            managerButton.className = 'td-ignore-manager-button';
            managerButton.addEventListener('click', openIgnoreManager);
            document.body.appendChild(managerButton);
        }

        if (!document.querySelector('.td-ignore-manager-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'td-ignore-manager-overlay';
            overlay.hidden = true;
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'td-ignore-manager-title');

            const panel = document.createElement('div');
            panel.className = 'td-ignore-manager-panel';

            const header = document.createElement('div');
            header.className = 'td-ignore-manager-header';

            const title = document.createElement('h2');
            title.id = 'td-ignore-manager-title';
            title.textContent = 'TD Ignore';

            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', closeIgnoreManager);

            const list = document.createElement('div');
            list.className = 'td-ignore-manager-list';

            const actions = document.createElement('div');
            actions.className = 'td-ignore-manager-actions';

            const unignoreAllButton = document.createElement('button');
            unignoreAllButton.type = 'button';
            unignoreAllButton.className = 'td-ignore-manager-unignore-all';
            unignoreAllButton.textContent = 'Unignore All';
            unignoreAllButton.addEventListener('click', unignoreAllUsers);

            header.appendChild(title);
            header.appendChild(closeButton);
            actions.appendChild(unignoreAllButton);
            panel.appendChild(header);
            panel.appendChild(list);
            panel.appendChild(actions);
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
        }

        refreshIgnoreManager();
    }

    // -------------------------------------------------------------------------
    // Styling
    // -------------------------------------------------------------------------

    function addStyles() {
        if (document.querySelector('.td-ignore-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.className = 'td-ignore-styles';

        style.textContent = `
            .td-ignore-button {
                margin-left: 8px;
                padding: 2px 7px;
                border: 1px solid #777;
                border-radius: 4px;
                background: #333;
                color: #ddd;
                font-size: 11px;
                cursor: pointer;
                vertical-align: middle;
            }

            .td-ignore-button:hover {
                background: #555;
                color: #fff;
            }

            .td-ignore-collapsed > * {
                display: none !important;
            }

            .td-ignore-collapsed > .td-ignore-placeholder {
                display: flex !important;
            }

            .td-ignore-thread-collapsed > * {
                display: none !important;
            }

            .td-ignore-thread-collapsed > .td-ignore-thread-placeholder {
                display: flex !important;
            }

            .td-ignore-placeholder {
                align-items: center;
                gap: 10px;
                min-height: 44px;
                padding: 9px 12px;
                box-sizing: border-box;
                background: rgba(255, 193, 7, 0.14);
                border-left: 5px solid #ffc107;
                border-top: 1px solid rgba(255, 193, 7, 0.35);
                border-bottom: 1px solid rgba(255, 193, 7, 0.35);
            }

            .td-ignore-thread-placeholder {
                width: 100%;
                grid-column: 1 / -1;
            }

            .td-ignore-message {
                font-weight: bold;
                color: #ffc107;
            }

            .td-ignore-placeholder button {
                padding: 3px 8px;
                border: 1px solid #777;
                border-radius: 4px;
                background: #333;
                color: #ddd;
                cursor: pointer;
            }

            .td-ignore-placeholder button:hover {
                background: #555;
                color: #fff;
            }

            .td-ignore-manager-button {
                position: fixed;
                right: 12px;
                bottom: 12px;
                z-index: 2147483645;
                padding: 6px 10px;
                border: 1px solid #777;
                border-radius: 4px;
                background: #333;
                color: #ffc107;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
            }

            .td-ignore-manager-button:hover {
                background: #555;
            }

            .td-ignore-manager-overlay {
                position: fixed;
                inset: 0;
                z-index: 2147483646;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
                background: rgba(0, 0, 0, 0.55);
            }

            .td-ignore-manager-overlay[hidden] {
                display: none;
            }

            .td-ignore-manager-panel {
                width: 360px;
                max-width: calc(100vw - 32px);
                max-height: calc(100vh - 32px);
                overflow: auto;
                padding: 16px;
                box-sizing: border-box;
                border: 1px solid #777;
                border-radius: 6px;
                background: #222;
                color: #eee;
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
            }

            .td-ignore-manager-header,
            .td-ignore-manager-row,
            .td-ignore-manager-actions {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .td-ignore-manager-header {
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .td-ignore-manager-header h2 {
                margin: 0;
                color: #ffc107;
                font-size: 18px;
            }

            .td-ignore-manager-row {
                justify-content: space-between;
                padding: 8px 0;
                border-top: 1px solid #444;
            }

            .td-ignore-manager-username {
                overflow-wrap: anywhere;
            }

            .td-ignore-manager-empty {
                margin: 16px 0;
                color: #ccc;
            }

            .td-ignore-manager-actions {
                justify-content: flex-end;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #444;
            }

            .td-ignore-manager-panel button {
                padding: 4px 9px;
                border: 1px solid #777;
                border-radius: 4px;
                background: #333;
                color: #eee;
                cursor: pointer;
            }

            .td-ignore-manager-panel button:hover:not(:disabled) {
                background: #555;
            }

            .td-ignore-manager-panel button:disabled {
                opacity: 0.5;
                cursor: default;
            }
        `;

        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------------
    // Start
    // -------------------------------------------------------------------------

    addStyles();
    addIgnoreManager();
    refreshPage();

})();
