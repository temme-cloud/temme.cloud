import { render } from 'solid-js/web';
import { App } from './components/App.jsx';
import { createQuizStore } from './stores/quiz.js';

/**
 * Initialize the Delivery Check app
 * Expects window.DELIVERY_CHECK_QUESTIONS and window.DELIVERY_CHECK_I18N to be set
 */
function init() {
  const container = document.getElementById('delivery-check-container');
  if (!container) return;

  // Get config from DOM data attributes
  const language = container.dataset.lang || 'de';
  const variant = container.dataset.variant || 'default';
  const privacyUrl = container.dataset.privacyUrl || `/${language}/datenschutz/`;
  const contactUrl = container.dataset.contactUrl || `/${language}/contact/`;

  // Get questions data from global (set by Hugo template)
  const questionsData = window.DELIVERY_CHECK_QUESTIONS;
  const i18n = window.DELIVERY_CHECK_I18N || {};

  if (!questionsData || !questionsData.questions) {
    console.error('Delivery Check: Questions data not found');
    container.textContent = 'Error loading quiz. Please refresh the page.';
    return;
  }

  // Create the store
  const store = createQuizStore(questionsData, i18n, { language, variant });

  // Clear any existing content (safe - removes children)
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Render the app
  render(
    () => (
      <App
        store={store}
        privacyUrl={privacyUrl}
        contactUrl={contactUrl}
        containerRef={container}
      />
    ),
    container
  );
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
