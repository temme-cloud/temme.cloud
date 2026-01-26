import { Show, createEffect } from 'solid-js';
import { Progress } from './Progress.jsx';
import { Question } from './Question.jsx';
import { ContactForm } from './ContactForm.jsx';
import { Results } from './Results.jsx';
import { Navigation } from './Navigation.jsx';

export function App(props) {
  const { store, privacyUrl, contactUrl, containerRef } = props;
  const { isContactStep, showResults, submitError, currentStep } = store;

  // Scroll to top when step changes
  createEffect(() => {
    // Track currentStep to trigger effect
    currentStep();

    if (containerRef) {
      containerRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return (
    <>
      {/* Netlify Forms hidden form for static detection */}
      <form name="delivery-check" netlify netlify-honeypot="bot-field" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="text" name="company" />
        <input type="tel" name="phone" />
        <input type="checkbox" name="gdpr-consent" />
        <input type="hidden" name="delivery-check-version" />
        <input type="hidden" name="delivery-check-variant" />
        <input type="hidden" name="delivery-check-language" />
        <input type="hidden" name="delivery-check-score" />
        <input type="hidden" name="delivery-check-maturity" />
        <input type="hidden" name="delivery-check-responses" />
        <input type="hidden" name="delivery-check-timestamp" />
      </form>

      {/* Progress bar - hidden when showing results */}
      <Show when={!showResults()}>
        <Progress store={store} />
      </Show>

      {/* Main content area */}
      <Show when={!showResults()}>
        <Show when={!isContactStep()}>
          <Question store={store} />
        </Show>

        <Show when={isContactStep()}>
          <ContactForm store={store} privacyUrl={privacyUrl} />
        </Show>
      </Show>

      {/* Results */}
      <Show when={showResults()}>
        <Results store={store} contactUrl={contactUrl} />
      </Show>

      {/* Error message */}
      <Show when={submitError()}>
        <div class="delivery-check-error" role="alert">
          {submitError()}
        </div>
      </Show>

      {/* Navigation - hidden when showing results */}
      <Show when={!showResults()}>
        <Navigation store={store} />
      </Show>
    </>
  );
}
