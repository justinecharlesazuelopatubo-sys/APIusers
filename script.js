'use strict';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

const loadBtn   = document.getElementById('load-btn');
const statusEl  = document.getElementById('status');
const grid      = document.getElementById('grid');
const countEl   = document.getElementById('count');

/**
 * Render a loading indicator in the status region.
 */
function showLoading() {
  statusEl.className = 'status';
  statusEl.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Loading…</span>';
  statusEl.setAttribute('role', 'status');
}

/**
 * Render an error message in the status region.
 * @param {string} message
 */
function showError(message) {
  statusEl.className = 'status status--error';
  statusEl.textContent = message;
  statusEl.setAttribute('role', 'alert');
}

/**
 * Clear the status region.
 */
function clearStatus() {
  statusEl.className = 'status';
  statusEl.textContent = '';
  statusEl.removeAttribute('role');
}

/**
 * Build a single card element for a user record.
 * @param {object} user
 * @returns {HTMLElement}
 */
function buildCard(user) {
  const card = document.createElement('article');
  card.className = 'card';

  const tab = document.createElement('span');
  tab.className = 'card__tab';
  tab.textContent = (user.name || '?').trim().charAt(0).toUpperCase();
  card.appendChild(tab);

  const name = document.createElement('h2');
  name.className = 'card__name';
  name.textContent = user.name || 'Unnamed';
  card.appendChild(name);

  const username = document.createElement('p');
  username.className = 'card__username';
  username.textContent = user.username ? `@${user.username}` : '';
  card.appendChild(username);

  const rule = document.createElement('hr');
  rule.className = 'card__rule';
  card.appendChild(rule);

  const dl = document.createElement('dl');

  const fields = [
    ['Email',   user.email],
    ['Phone',   user.phone],
    ['Company', user.company && user.company.name ? user.company.name : '—'],
  ];

  fields.forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value || '—';
    dl.appendChild(dt);
    dl.appendChild(dd);
  });

  card.appendChild(dl);
  return card;
}

/**
 * Render the full list of users into the grid.
 * @param {object[]} users
 */
function renderUsers(users) {
  grid.innerHTML = '';
  grid.classList.remove('is-visible');

  if (!Array.isArray(users) || users.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No entries found.';
    grid.appendChild(empty);
  } else {
    const fragment = document.createDocumentFragment();
    users.forEach((user) => fragment.appendChild(buildCard(user)));
    grid.appendChild(fragment);
  }

  // Force reflow so the reveal animation restarts on every load.
  void grid.offsetWidth;
  grid.classList.add('is-visible');

  countEl.textContent = `${users.length} ${users.length === 1 ? 'entry' : 'entries'}`;
}

/**
 * Fetch users from the API and render them, handling loading and error states.
 */
async function loadUsers() {
  loadBtn.disabled = true;
  grid.innerHTML = '';
  countEl.textContent = '';
  showLoading();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const users = await response.json();
    clearStatus();
    renderUsers(users);
  } catch (error) {
    const reason = error instanceof TypeError
      ? 'Check your network connection and try again.'
      : (error.message || 'Please try again.');
    showError(`Couldn't load the directory. ${reason}`);
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener('click', loadUsers);