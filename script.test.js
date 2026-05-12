const { validateField, applyFieldState, rules } = require('./script');

// ─── Helper ───────────────────────────────────────────────────────────────────
// Creates an <input> with a sibling .invalid-feedback <div> in a wrapper,
// matching the DOM structure expected by applyFieldState.
function makeField(value = '', ...initialClasses) {
  const wrapper  = document.createElement('div');
  const input    = document.createElement('input');
  const feedback = document.createElement('div');
  input.value = value;
  initialClasses.forEach(c => input.classList.add(c));
  wrapper.appendChild(input);
  wrapper.appendChild(feedback);
  document.body.appendChild(wrapper);
  return { input, feedback, wrapper };
}

afterEach(() => {
  document.body.innerHTML = '';
});

// ─── validateField ────────────────────────────────────────────────────────────
describe('validateField', () => {

  describe('unknown field name', () => {
    it('returns null for an unrecognised field', () => {
      expect(validateField('nonexistent', 'anything')).toBeNull();
    });
  });

  // ── name ──
  describe('name', () => {
    it('returns required error for empty string', () => {
      expect(validateField('name', '')).toBe('Name is required.');
    });

    it('returns required error for whitespace-only value', () => {
      expect(validateField('name', '   ')).toBe('Name is required.');
    });

    it('returns minLength error for a single character', () => {
      expect(validateField('name', 'A')).toBe('Name must be at least 2 characters.');
    });

    it('returns null at exactly the minimum length (2 chars)', () => {
      expect(validateField('name', 'Jo')).toBeNull();
    });

    it('returns null for a normal full name', () => {
      expect(validateField('name', 'Jane Smith')).toBeNull();
    });

    it('trims before checking length — whitespace padding does not satisfy minimum', () => {
      expect(validateField('name', ' A ')).toBe('Name must be at least 2 characters.');
    });
  });

  // ── email ──
  describe('email', () => {
    it('returns required error for empty string', () => {
      expect(validateField('email', '')).toBe('Email is required.');
    });

    it('returns required error for whitespace-only value', () => {
      expect(validateField('email', '   ')).toBe('Email is required.');
    });

    it('returns format error when @ is missing', () => {
      expect(validateField('email', 'notanemail')).toBe('Please enter a valid email address.');
    });

    it('returns format error when domain is missing', () => {
      expect(validateField('email', 'user@')).toBe('Please enter a valid email address.');
    });

    it('returns format error when TLD is missing', () => {
      expect(validateField('email', 'user@domain')).toBe('Please enter a valid email address.');
    });

    it('returns format error when local part contains a space', () => {
      expect(validateField('email', 'bad email@example.com')).toBe('Please enter a valid email address.');
    });

    it('returns null for a valid standard email', () => {
      expect(validateField('email', 'user@example.com')).toBeNull();
    });

    it('returns null for an email with subdomain', () => {
      expect(validateField('email', 'user@mail.example.co.uk')).toBeNull();
    });

    it('trims surrounding whitespace before validating', () => {
      expect(validateField('email', '  user@example.com  ')).toBeNull();
    });
  });

  // ── subject ──
  describe('subject', () => {
    it('returns required error for empty string', () => {
      expect(validateField('subject', '')).toBe('Subject is required.');
    });

    it('returns minLength error for 2-character value', () => {
      expect(validateField('subject', 'Hi')).toBe('Subject must be at least 3 characters.');
    });

    it('returns null at exactly the minimum length (3 chars)', () => {
      expect(validateField('subject', 'Hey')).toBeNull();
    });

    it('returns null for a normal subject line', () => {
      expect(validateField('subject', 'Project inquiry')).toBeNull();
    });
  });

  // ── message ──
  describe('message', () => {
    it('returns required error for empty string', () => {
      expect(validateField('message', '')).toBe('Message is required.');
    });

    it('returns minLength error for a 9-character value', () => {
      expect(validateField('message', '123456789')).toBe('Message must be at least 10 characters.');
    });

    it('returns null at exactly the minimum length (10 chars)', () => {
      expect(validateField('message', '1234567890')).toBeNull();
    });

    it('returns null for a normal message', () => {
      expect(validateField('message', 'Hello, I would like to discuss a project with you.')).toBeNull();
    });

    it('trims before checking — padded whitespace does not satisfy minimum', () => {
      // 9 content chars + whitespace padding = still fails
      expect(validateField('message', '  12345678  ')).toBe('Message must be at least 10 characters.');
    });
  });

  // ── rules snapshot ──
  describe('rules configuration', () => {
    it('covers exactly the four expected fields', () => {
      expect(Object.keys(rules).sort()).toEqual(['email', 'message', 'name', 'subject']);
    });

    it('all fields are marked as required', () => {
      Object.values(rules).forEach(rule => expect(rule.required).toBe(true));
    });
  });
});

// ─── applyFieldState ──────────────────────────────────────────────────────────
describe('applyFieldState', () => {

  describe('when called with an error message', () => {
    it('adds is-invalid to the input', () => {
      const { input } = makeField('');
      applyFieldState(input, 'Name is required.');
      expect(input.classList.contains('is-invalid')).toBe(true);
    });

    it('removes is-valid if it was previously set', () => {
      const { input } = makeField('Jo', 'is-valid');
      applyFieldState(input, 'Name is required.');
      expect(input.classList.contains('is-valid')).toBe(false);
    });

    it('does not add is-valid', () => {
      const { input } = makeField('');
      applyFieldState(input, 'Name is required.');
      expect(input.classList.contains('is-valid')).toBe(false);
    });

    it('writes the error message into the feedback element', () => {
      const { input, feedback } = makeField('');
      applyFieldState(input, 'Name is required.');
      expect(feedback.textContent).toBe('Name is required.');
    });

    it('does not throw when there is no sibling feedback element', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      expect(() => applyFieldState(input, 'Name is required.')).not.toThrow();
    });
  });

  describe('when called without an error (valid, non-empty value)', () => {
    it('removes is-invalid', () => {
      const { input } = makeField('Jane', 'is-invalid');
      applyFieldState(input, null);
      expect(input.classList.contains('is-invalid')).toBe(false);
    });

    it('adds is-valid when the field has a non-empty value', () => {
      const { input } = makeField('Jane');
      applyFieldState(input, null);
      expect(input.classList.contains('is-valid')).toBe(true);
    });

    it('clears the feedback element text', () => {
      const { input, feedback } = makeField('Jane', 'is-invalid');
      feedback.textContent = 'Previous error';
      applyFieldState(input, null);
      expect(feedback.textContent).toBe('');
    });
  });

  describe('when called without an error on an empty field', () => {
    it('removes is-invalid', () => {
      const { input } = makeField('', 'is-invalid');
      applyFieldState(input, null);
      expect(input.classList.contains('is-invalid')).toBe(false);
    });

    it('does NOT add is-valid for an empty value', () => {
      const { input } = makeField('');
      applyFieldState(input, null);
      expect(input.classList.contains('is-valid')).toBe(false);
    });

    it('clears the feedback element text', () => {
      const { input, feedback } = makeField('');
      feedback.textContent = 'Stale error';
      applyFieldState(input, null);
      expect(feedback.textContent).toBe('');
    });
  });

  describe('state transitions', () => {
    it('transitions from invalid to valid when error is cleared with a value present', () => {
      const { input, feedback } = makeField('Jane', 'is-invalid');
      feedback.textContent = 'Name is required.';

      applyFieldState(input, null);

      expect(input.classList.contains('is-invalid')).toBe(false);
      expect(input.classList.contains('is-valid')).toBe(true);
      expect(feedback.textContent).toBe('');
    });

    it('transitions from valid to invalid when an error is applied', () => {
      const { input, feedback } = makeField('J', 'is-valid');

      applyFieldState(input, 'Name must be at least 2 characters.');

      expect(input.classList.contains('is-valid')).toBe(false);
      expect(input.classList.contains('is-invalid')).toBe(true);
      expect(feedback.textContent).toBe('Name must be at least 2 characters.');
    });
  });
});
