/* ── Validation rules ── */
const rules = {
  name:    { required: true, minLength: 2,  label: 'Name' },
  email:   { required: true, email: true,   label: 'Email' },
  subject: { required: true, minLength: 3,  label: 'Subject' },
  message: { required: true, minLength: 10, label: 'Message' },
};

function validateField(name, value) {
  const rule = rules[name];
  if (!rule) return null;
  if (rule.required && !value.trim())
    return `${rule.label} is required.`;
  if (rule.minLength && value.trim().length < rule.minLength)
    return `${rule.label} must be at least ${rule.minLength} characters.`;
  if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
    return 'Please enter a valid email address.';
  return null;
}

/* Bootstrap validation pattern: is-invalid / is-valid on the input,
   message written into the adjacent .invalid-feedback sibling. */
function applyFieldState(input, errorMsg) {
  const feedback = input.nextElementSibling;
  if (errorMsg) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (feedback) feedback.textContent = errorMsg;
  } else {
    input.classList.remove('is-invalid');
    if (input.value.trim()) input.classList.add('is-valid');
    if (feedback) feedback.textContent = '';
  }
}

/* ── DOM initialization — skipped when loaded by Jest ── */
function init() {
  /* Nav: Bootstrap handles open/close; we add Escape-to-close */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const navContent = document.getElementById('navbarContent');
    if (!navContent.classList.contains('show')) return;
    bootstrap.Collapse.getInstance(navContent)?.hide();
    document.getElementById('navToggle').focus();
  });

  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      applyFieldState(field, validateField(field.name, field.value));
    });
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) {
        applyFieldState(field, validateField(field.name, field.value));
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    let firstInvalid = null;
    let hasError = false;

    form.querySelectorAll('input, textarea').forEach(field => {
      const errorMsg = validateField(field.name, field.value);
      applyFieldState(field, errorMsg);
      if (errorMsg && !firstInvalid) firstInvalid = field;
      if (errorMsg) hasError = true;
    });

    if (hasError) { firstInvalid.focus(); return; }

    submitBtn.dataset.loading = '1';
    submitBtn.textContent = 'Sending';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    await new Promise(r => setTimeout(r, 1400));

    submitBtn.removeAttribute('data-loading');
    submitBtn.textContent = 'Send message';
    formStatus.textContent = "Message sent! I'll be in touch soon.";
    formStatus.className = 'form-status success';

    form.reset();
    form.querySelectorAll('input, textarea').forEach(f => {
      f.classList.remove('is-invalid', 'is-valid');
      const feedback = f.nextElementSibling;
      if (feedback) feedback.textContent = '';
    });

    setTimeout(() => {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }, 6000);
  });
}

/* In Node/Jest: export pure functions and skip DOM init.
   In the browser: module is undefined, so run init() directly. */
if (typeof module !== 'undefined') {
  module.exports = { validateField, applyFieldState, rules };
} else {
  init();
}
