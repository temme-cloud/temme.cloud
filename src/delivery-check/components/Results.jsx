import { For, createMemo } from 'solid-js';

export function Results(props) {
  const { store, contactUrl } = props;
  const { totalScore, maturityLevel, getLocalizedText, generateRecommendations, restart, i18n } = store;

  const recommendations = createMemo(() => generateRecommendations());

  return (
    <div class="delivery-check-results" aria-live="polite">
      <div class="delivery-check-results__header">
        <h2 class="delivery-check-results__title">
          {i18n.resultsTitle || 'Your Results'}
        </h2>
      </div>

      <div class="delivery-check-results__score">
        <div class="delivery-check-results__level">
          <span
            class="delivery-check-results__badge"
            style={{ 'background-color': maturityLevel().color }}
          >
            {getLocalizedText(maturityLevel().label)}
          </span>
        </div>
        <div class="delivery-check-results__points">
          {totalScore()} {i18n.points || 'Points'}
        </div>
      </div>

      <div class="delivery-check-results__interpretation">
        <p>{getLocalizedText(maturityLevel().interpretation)}</p>
      </div>

      <div class="delivery-check-results__recommendations">
        <h3>{i18n.recommendationsTitle || 'Recommendations for You'}</h3>
        <ul>
          <For each={recommendations()}>
            {(rec) => <li>{rec}</li>}
          </For>
        </ul>
      </div>

      <div class="delivery-check-results__cta">
        <p>{i18n.resultsCTA || 'Want to learn more? We\'d be happy to help improve your delivery process.'}</p>
        <a href={contactUrl} class="btn-filled">
          {i18n.bookConsultation || 'Book Free Consultation'}
        </a>
      </div>

    </div>
  );
}
