import { createMemo } from 'solid-js';

export function Progress(props) {
  const { store } = props;
  const { currentStep, totalSteps, showResults, i18n } = store;

  const progressPercent = createMemo(() => {
    if (showResults()) return 100;
    return Math.max(5, ((currentStep() + 1) / totalSteps()) * 100);
  });

  const displayStep = createMemo(() => {
    if (showResults()) return totalSteps();
    return currentStep() + 1;
  });

  return (
    <div
      class="delivery-check-progress"
      role="progressbar"
      aria-valuemin="1"
      aria-valuemax={totalSteps()}
      aria-valuenow={displayStep()}
    >
      <div class="delivery-check-progress__bar">
        <div
          class="delivery-check-progress__fill"
          style={{ width: `${progressPercent()}%` }}
        />
      </div>
      <span class="delivery-check-progress__text">
        {i18n.step || 'Step'} {displayStep()} {i18n.of || 'of'} {totalSteps()}
      </span>
    </div>
  );
}
