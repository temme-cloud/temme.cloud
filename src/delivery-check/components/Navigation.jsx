import { Show, createMemo } from 'solid-js';
import { triggerContactSubmit } from './ContactForm.jsx';

export function Navigation(props) {
  const { store } = props;
  const {
    currentStep,
    questionPath,
    isContactStep,
    goToNext,
    goToPrevious,
    isSubmitting,
    i18n
  } = store;

  const isFirstStep = createMemo(() => currentStep() === 0);
  const isLastQuestion = createMemo(() => currentStep() === questionPath().length - 1);

  const handleNextClick = () => {
    goToNext();
  };

  const handleSubmitClick = () => {
    triggerContactSubmit();
  };

  const nextButtonText = createMemo(() => {
    if (isLastQuestion()) {
      return i18n.continueToContact || 'Continue to Contact';
    }
    return i18n.next || 'Continue';
  });

  return (
    <div class="delivery-check-nav">
      <Show when={!isFirstStep()}>
        <button
          type="button"
          class="btn-outline delivery-check-nav__back"
          onClick={goToPrevious}
          aria-label={i18n.back || 'Back'}
        >
          {i18n.back || 'Back'}
        </button>
      </Show>

      <Show when={!isContactStep()}>
        <button
          type="button"
          class="btn-filled delivery-check-nav__next"
          onClick={handleNextClick}
          aria-label={nextButtonText()}
        >
          {nextButtonText()}
        </button>
      </Show>

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
