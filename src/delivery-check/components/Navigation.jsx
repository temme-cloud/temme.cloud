import { Show, createMemo } from 'solid-js';
import { triggerContactSubmit } from './ContactForm.jsx';

export function Navigation(props) {
  const { store } = props;
  const {
    currentStep,
    isContactStep,
    goToNext,
    goToPrevious,
    restart,
    isSubmitting,
    i18n
  } = store;

  const isFirstStep = createMemo(() => currentStep() === 0);

  const handleNextClick = () => {
    goToNext();
  };

  const handleSubmitClick = () => {
    triggerContactSubmit();
  };

  return (
    <div class="delivery-check-nav">
      {/* Small navigation buttons at left */}
      <div class="delivery-check-nav__mini-buttons">
        {/* Restart button only on contact step */}
        <Show when={isContactStep()}>
          <button
            type="button"
            class="delivery-check-nav__mini-btn"
            onClick={restart}
            aria-label={i18n.restart || 'Start over'}
            title={i18n.restart || 'Start over'}
          >
            ↺
          </button>
        </Show>
        {/* Back button on all pages except first */}
        <Show when={!isFirstStep()}>
          <button
            type="button"
            class="delivery-check-nav__mini-btn"
            onClick={goToPrevious}
            aria-label={i18n.back || 'Back'}
            title={i18n.back || 'Back'}
          >
            ←
          </button>
        </Show>
      </div>

      {/* During quiz: always show "Weiter" button */}
      <Show when={!isContactStep()}>
        <button
          type="button"
          class="btn-filled delivery-check-nav__next"
          onClick={handleNextClick}
          aria-label={i18n.next || 'Continue'}
        >
          {i18n.next || 'Continue'}
        </button>
      </Show>

      {/* Contact step: submit button */}
      <Show when={isContactStep()}>
        <button
          type="button"
          class="btn-filled delivery-check-nav__submit"
          onClick={handleSubmitClick}
          disabled={isSubmitting()}
        >
          {isSubmitting()
            ? (i18n.submitting || 'Submitting...')
            : (i18n.submit || 'Submit & View Results')}
        </button>
      </Show>
    </div>
  );
}
