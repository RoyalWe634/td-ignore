// ==UserScript==
// @name         TD Ignore
// @namespace    td-ignore
// @version      0.1.3
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
        refreshPosts();
    }

    function unignoreUser(userId) {
        const ignoredUsers = getIgnoredUsers();

        delete ignoredUsers[userId];

        saveIgnoredUsers(ignoredUsers);
        refreshPosts();
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
    // Styling
    // -------------------------------------------------------------------------

    function addStyles() {
        const style = document.createElement('style');

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
        `;

        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------------
    // Start
    // -------------------------------------------------------------------------

    addStyles();
    refreshPosts();

})();
