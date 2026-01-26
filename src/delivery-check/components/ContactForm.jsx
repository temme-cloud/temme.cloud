import { createSignal } from 'solid-js';

export function ContactForm(props) {
  const { store, privacyUrl } = props;
  const { i18n, submitForm, isSubmitting, setSubmitError } = store;

  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [company, setCompany] = createSignal('');
  const [phone, setPhone] = createSignal('');
  const [gdprConsent, setGdprConsent] = createSignal(false);

  const [fieldErrors, setFieldErrors] = createSignal({});

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const errors = {};

    if (!name().trim()) errors.name = true;
    if (!email().trim() || !validateEmail(email())) errors.email = true;
    if (!company().trim()) errors.company = true;
    if (!gdprConsent()) errors.gdpr = true;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmitError(i18n.fillRequired || 'Please fill in all required fields.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    submitForm({
      name: name(),
      email: email(),
      company: company(),
      phone: phone()
    });
  };

  return (
    <div class="delivery-check-step delivery-check-contact">
      <h2 class="delivery-check-step__title">
        {i18n.contactTitle || 'Almost there!'}
      </h2>
      <p class="delivery-check-step__description">
        {i18n.contactDescription || 'Enter your contact details to receive your personalized results.'}
      </p>

      <div class="delivery-check-fields">
        <div class={`delivery-check-field ${fieldErrors().name ? 'delivery-check-field--error' : ''}`}>
          <label for="contact-name" class="delivery-check-field__label">
            {i18n.fieldName || 'Name'} <span aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="contact-name"
            name="name"
            required
            autocomplete="name"
            class="delivery-check-field__input"
            value={name()}
            onInput={(e) => setName(e.target.value)}
          />
        </div>

        <div class={`delivery-check-field ${fieldErrors().email ? 'delivery-check-field--error' : ''}`}>
          <label for="contact-email" class="delivery-check-field__label">
            {i18n.fieldEmail || 'Email'} <span aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id="contact-email"
            name="email"
            required
            autocomplete="email"
            class="delivery-check-field__input"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
          />
        </div>

        <div class={`delivery-check-field ${fieldErrors().company ? 'delivery-check-field--error' : ''}`}>
          <label for="contact-company" class="delivery-check-field__label">
            {i18n.fieldCompany || 'Company'} <span aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="contact-company"
            name="company"
            required
            autocomplete="organization"
            class="delivery-check-field__input"
            value={company()}
            onInput={(e) => setCompany(e.target.value)}
          />
        </div>

        <div class="delivery-check-field">
          <label for="contact-phone" class="delivery-check-field__label">
            {i18n.fieldPhone || 'Phone (optional)'}
          </label>
          <input
            type="tel"
            id="contact-phone"
            name="phone"
            autocomplete="tel"
            class="delivery-check-field__input"
            value={phone()}
            onInput={(e) => setPhone(e.target.value)}
          />
        </div>

        <div class={`delivery-check-field delivery-check-field--checkbox ${fieldErrors().gdpr ? 'delivery-check-field--error' : ''}`}>
          <label class="delivery-check-checkbox">
            <input
              type="checkbox"
              id="contact-gdpr"
              name="gdpr-consent"
              required
              checked={gdprConsent()}
              onChange={(e) => setGdprConsent(e.target.checked)}
            />
            <span class="delivery-check-checkbox__mark" />
            <span class="delivery-check-checkbox__label">
              {i18n.gdprConsent || 'I agree to the Privacy Policy and consent to being contacted.'}
              {' '}
              (<a href={privacyUrl} target="_blank" rel="noopener">
                {i18n.gdprLink || 'Privacy Policy'}
              </a>)
            </span>
          </label>
        </div>
      </div>

      {/* Hidden submit button for form submission via parent */}
      <button
        type="button"
        id="delivery-check-contact-submit"
        style={{ display: 'none' }}
        onClick={handleSubmit}
      />
    </div>
  );
}

// Export the submit handler so it can be triggered from navigation
export function triggerContactSubmit() {
  const btn = document.getElementById('delivery-check-contact-submit');
  if (btn) btn.click();
}
