import { createMemo } from 'solid-js';

export function OptionCard(props) {
  const { option, questionId, isMulti, isSelected, onSelect, getLocalizedText } = props;

  const handleClick = (e) => {
    // Prevent default to avoid native checkbox/radio behavior conflicting with our state
    e.preventDefault();
    e.stopPropagation();
    onSelect(option.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onSelect(option.value);
    }
  };

  return (
    <label
      class={`delivery-check-option ${isSelected() ? 'delivery-check-option--selected' : ''}`}
      tabindex="0"
      role={isMulti ? 'checkbox' : 'radio'}
      aria-checked={isSelected()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <input
        type={isMulti ? 'checkbox' : 'radio'}
        name={isMulti ? `${questionId}[]` : questionId}
        value={option.value}
        checked={isSelected()}
        class="delivery-check-option__input"
        tabindex="-1"
        onClick={(e) => e.stopPropagation()}
        onChange={() => {}}
      />
      <span class="delivery-check-option__card">
        <span class="delivery-check-option__text">
          {getLocalizedText(option.label)}
        </span>
      </span>
      <span class="delivery-check-option__check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </label>
  );
}
