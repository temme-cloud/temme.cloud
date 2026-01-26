import { For, createMemo } from 'solid-js';
import { OptionCard } from './OptionCard.jsx';

const AUTO_ADVANCE_DELAY = 250;

export function Question(props) {
  const { store } = props;
  const { currentQuestion, responses, selectOption, goToNext, getLocalizedText, i18n } = store;

  const question = createMemo(() => currentQuestion());
  const isMulti = createMemo(() => question()?.type === 'multi');
  const questionId = createMemo(() => question()?.id);

  const isOptionSelected = (value) => {
    const response = responses[questionId()];
    if (isMulti()) {
      return (response || []).includes(value);
    }
    return response === value;
  };

  const handleSelect = (value) => {
    const qId = questionId();
    const multi = isMulti();

    selectOption(qId, value, multi);

    // Auto-advance for single select (with delay for visual feedback)
    if (!multi) {
      setTimeout(() => {
        goToNext();
      }, AUTO_ADVANCE_DELAY);
    }
  };

  return (
    <div class="delivery-check-step" data-question-id={questionId()}>
      <h2 class="delivery-check-step__title">
        {getLocalizedText(question()?.title)}
      </h2>

      {question()?.text && (
        <p class="delivery-check-step__description">
          {getLocalizedText(question()?.text)}
        </p>
      )}

      <div
        class={`delivery-check-options ${isMulti() ? 'delivery-check-options--multi' : ''}`}
        role={isMulti() ? 'group' : 'radiogroup'}
        aria-label={getLocalizedText(question()?.title)}
      >
        <For each={question()?.options || []}>
          {(option) => (
            <OptionCard
              option={option}
              questionId={questionId()}
              isMulti={isMulti()}
              isSelected={() => isOptionSelected(option.value)}
              onSelect={handleSelect}
              getLocalizedText={getLocalizedText}
            />
          )}
        </For>
      </div>

      {isMulti() && (
        <p class="delivery-check-hint">
          {question()?.helper
            ? getLocalizedText(question().helper)
            : (i18n.selectMultiple || 'Multiple selections allowed')}
        </p>
      )}
    </div>
  );
}
