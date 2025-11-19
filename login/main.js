const form = document.getElementById('access-form');
const emailInput = document.getElementById('email');
const codeInput = document.getElementById('course-code');
const statusMessage = document.getElementById('status-message');
const submitBtn = document.getElementById('submit-btn');
const spinner = document.getElementById('spinner');
const buttonText = document.getElementById('button-text');
const params = new URLSearchParams(window.location.search);
const nextPath = params.get('next') || '/index.html';
const ACCESS_KEY = 'courseAccess';
const ENDPOINT = '/.netlify/functions/validate-code';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPINNER_ACTIVE_CLASS = 'is-loading';

function toggleLoading(isLoading) {
  if (isLoading) {
    submitBtn.setAttribute('disabled', 'disabled');
    spinner.classList.add(SPINNER_ACTIVE_CLASS);
    buttonText.textContent = 'Checking…';
  } else {
    submitBtn.removeAttribute('disabled');
    spinner.classList.remove(SPINNER_ACTIVE_CLASS);
    buttonText.textContent = 'Request access';
  }
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = isError ? 'error' : 'success';
}

function persistEmail(value) {
  try {
    localStorage.setItem('lastCourseEmail', value);
  } catch (error) {
    console.debug('Unable to persist email', error);
  }
}

function hydrateEmail() {
  try {
    const existing = localStorage.getItem('lastCourseEmail');
    if (existing) {
      emailInput.value = existing;
    }
  } catch (error) {
    console.debug('No stored email found', error);
  }
}

function storeAccessSession(email) {
  const payload = {
    email,
    grantedAt: Date.now(),
  };
  sessionStorage.setItem(ACCESS_KEY, JSON.stringify(payload));
}

async function validateCredentials(email, courseCode) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, courseCode }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Unable to validate credentials.');
  }

  return response.json();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const courseCode = codeInput.value.trim();

  if (!emailRegex.test(email)) {
    setStatus('Please enter a valid university email address.', true);
    emailInput.focus();
    return;
  }

  if (!courseCode) {
    setStatus('The private course code is required.', true);
    codeInput.focus();
    return;
  }

  toggleLoading(true);
  setStatus('');

  try {
    const result = await validateCredentials(email, courseCode);
    storeAccessSession(email);
    persistEmail(email);
    setStatus('Access granted. Redirecting…');
    const destination = (result && result.nextPath) || nextPath;
    window.location.replace(destination);
  } catch (error) {
    console.error(error);
    setStatus('Access denied. Please double-check your details or contact your instructor.', true);
  } finally {
    toggleLoading(false);
  }
});

hydrateEmail();
