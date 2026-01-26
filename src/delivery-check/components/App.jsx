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
