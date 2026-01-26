import { createSignal, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';

const STORAGE_KEY = 'temme-delivery-check';
const STORAGE_EXPIRY_DAYS = 7;

/**
 * Create the quiz store with all state management
 */
export function createQuizStore(questionsData, i18n, config) {
  const questions = questionsData.questions;
  const results = questionsData.results;
  const language = config.language || 'de';
  const variant = config.variant || 'default';

  // Core state
  const [currentStep, setCurrentStep] = createSignal(0);
  const [responses, setResponses] = createStore({});
  const [scores, setScores] = createStore({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal(null);
  const [showResults, setShowResults] = createSignal(false);

  // Compute question path based on responses (reactive)
  const questionPath = createMemo(() => {
    const path = [];
    let currentId = questions[0]?.id;

    while (currentId && currentId !== 'contact' && currentId !== 'end') {
      const question = getQuestionById(currentId);
      if (!question) break;

      path.push(currentId);

      // Determine next question based on response
      const response = responses[currentId];
      currentId = determineNextQuestion(question, response);
    }

    return path;
  });

  // Total steps = questions + contact form
  const totalSteps = createMemo(() => questionPath().length + 1);

  // Current question (if on a question step)
  const currentQuestion = createMemo(() => {
    const path = questionPath();
    const step = currentStep();
    if (step < path.length) {
      return getQuestionById(path[step]);
    }
    return null;
  });

  // Are we on the contact form step?
  const isContactStep = createMemo(() => currentStep() >= questionPath().length);

  // Calculate total score
  const totalScore = createMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
  });

  // Get maturity level based on score
  const maturityLevel = createMemo(() => {
    const score = totalScore();
    for (const level of results.levels) {
      if (score >= level.min && score <= level.max) {
        return level;
      }
    }
    return results.levels[0];
  });

  // Helper functions
  function getQuestionById(id) {
    return questions.find(q => q.id === id);
  }

  function determineNextQuestion(question, response) {
    if (!question) return 'contact';
    if (!response) return question.next || 'contact';

    // For single select, check if selected option has specific next
    if (question.type === 'single' && typeof response === 'string') {
      const selectedOption = question.options.find(opt => opt.value === response);
      if (selectedOption?.next) {
        return selectedOption.next;
      }
    }

    return question.next || 'contact';
  }

  function getLocalizedText(textObj) {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj;
    return textObj[language] || textObj.de || textObj.en || '';
  }

  // Actions
  function selectOption(questionId, value, isMulti = false) {
    const question = getQuestionById(questionId);
    if (!question) return;

    // Clear any validation error when user makes a selection
    setSubmitError(null);

    if (isMulti) {
      // Toggle selection for multi-select - calculate new value first
      const current = responses[questionId] || [];
      const idx = current.indexOf(value);
      let newSelected;

      if (idx === -1) {
        newSelected = [...current, value];
      } else {
        newSelected = current.filter(v => v !== value);
      }

      // Update store with new value
      setResponses(questionId, newSelected);

      // Calculate score with the new value (not from store which might be stale)
      const score = newSelected.reduce((sum, val) => {
        const opt = question.options.find(o => o.value === val);
        return sum + (opt?.score || 0);
      }, 0);
      setScores(questionId, score);
    } else {
      // Single select - replace value
      setResponses(questionId, value);

      // Set score
      const opt = question.options.find(o => o.value === value);
      setScores(questionId, opt?.score || 0);
    }

    saveProgress();
  }

  function goToNext() {
    const step = currentStep();
    const path = questionPath();

    if (step < path.length) {
      // Validate current question has a response
      const questionId = path[step];
      const response = responses[questionId];
      const question = getQuestionById(questionId);

      if (!response || (Array.isArray(response) && response.length === 0)) {
        setSubmitError(i18n.selectRequired || 'Please select an option.');
        return false;
      }

      setSubmitError(null);
      setCurrentStep(step + 1);
      saveProgress();
      return true;
    }

    return false;
  }

  function goToPrevious() {
    const step = currentStep();
    if (step > 0) {
      setSubmitError(null);
      setCurrentStep(step - 1);
      saveProgress();
    }
  }

  function buildDetailedResponses() {
    const detailed = {
      summary: {},
      details: []
    };

    questionPath().forEach(questionId => {
      const question = getQuestionById(questionId);
      const response = responses[questionId];
      const score = scores[questionId] || 0;

      if (!question || response === undefined || response === null) return;

      const questionTitle = getLocalizedText(question.title);
      const questionText = getLocalizedText(question.text);

      // Get selected option labels
      const selectedValues = Array.isArray(response) ? response : [response];
      const selectedLabels = selectedValues.map(val => {
        const opt = question.options.find(o => o.value === val);
        return opt ? getLocalizedText(opt.label) : val;
      });

      detailed.summary[questionTitle] = selectedLabels.join(', ');
      detailed.details.push({
        id: questionId,
        title: questionTitle,
        question: questionText,
        selected: selectedValues,
        selectedLabels: selectedLabels,
        score: score
      });
    });

    detailed.totalScore = totalScore();
    detailed.maturityLevel = getLocalizedText(maturityLevel().label);
    detailed.language = language;
    detailed.variant = variant;

    return detailed;
  }

  function generateRecommendations() {
    const recs = [];
    const recommendations = results.recommendations;
    const levelKey = maturityLevel().key;

    // Add specific recommendations based on responses
    if (responses.delivery === 'manual' && recommendations.manual) {
      recs.push(getLocalizedText(recommendations.manual));
    }
    if (responses.risk === 'regulated' && recommendations.regulated) {
      recs.push(getLocalizedText(recommendations.regulated));
    }
    if (responses.ops === 'reactive' && recommendations.reactive) {
      recs.push(getLocalizedText(recommendations.reactive));
    }
    if (responses.handover === 'throw-over' && recommendations['throw-over']) {
      recs.push(getLocalizedText(recommendations['throw-over']));
    }

    // Check blockers (multi-select)
    const blockers = responses.blockers || [];
    if (blockers.includes('flaky-tests') && recommendations['flaky-tests']) {
      recs.push(getLocalizedText(recommendations['flaky-tests']));
    }

    // Add level-specific recommendation
    if (recommendations[levelKey]) {
      recs.push(getLocalizedText(recommendations[levelKey]));
    }

    return recs.slice(0, 4);
  }

  async function submitForm(contactData) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const detailed = buildDetailedResponses();

      const formData = new URLSearchParams();
      formData.append('form-name', 'delivery-check');
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('company', contactData.company);
      formData.append('phone', contactData.phone || '');
      formData.append('gdpr-consent', 'true');
      formData.append('delivery-check-version', '2.0');
      formData.append('delivery-check-variant', variant);
      formData.append('delivery-check-language', language);
      formData.append('delivery-check-score', String(totalScore()));
      formData.append('delivery-check-maturity', getLocalizedText(maturityLevel().label));
      formData.append('delivery-check-responses', JSON.stringify(detailed, null, 2));
      formData.append('delivery-check-timestamp', new Date().toISOString());

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      clearProgress();
      setShowResults(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(i18n.submitError || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // LocalStorage persistence
  function saveProgress() {
    try {
      const data = {
        currentStep: currentStep(),
        responses: { ...responses },
        scores: { ...scores },
        variant,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save progress:', e);
    }
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;

      const data = JSON.parse(saved);

      // Check expiry
      const savedAt = new Date(data.savedAt);
      const daysDiff = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > STORAGE_EXPIRY_DAYS) {
        clearProgress();
        return false;
      }

      // Check variant matches
      if (data.variant !== variant) {
        clearProgress();
        return false;
      }

      // Restore state
      if (data.responses) {
        Object.entries(data.responses).forEach(([key, value]) => {
          setResponses(key, value);
        });
      }
      if (data.scores) {
        Object.entries(data.scores).forEach(([key, value]) => {
          setScores(key, value);
        });
      }
      if (typeof data.currentStep === 'number') {
        setCurrentStep(data.currentStep);
      }

      return true;
    } catch (e) {
      console.warn('Could not load progress:', e);
      clearProgress();
      return false;
    }
  }

  function clearProgress() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear progress:', e);
    }
  }

  function restart() {
    // Clear all state and start over
    clearProgress();
    setCurrentStep(0);
    setSubmitError(null);
    setShowResults(false);

    // Clear responses and scores
    Object.keys(responses).forEach(key => {
      setResponses(key, undefined);
    });
    Object.keys(scores).forEach(key => {
      setScores(key, undefined);
    });
  }

  // Initialize - try to load saved progress
  loadProgress();

  return {
    // State
    currentStep,
    totalSteps,
    currentQuestion,
    isContactStep,
    responses,
    scores,
    totalScore,
    maturityLevel,
    isSubmitting,
    submitError,
    showResults,
    questionPath,

    // Helpers
    getQuestionById,
    getLocalizedText,
    generateRecommendations,

    // Actions
    selectOption,
    goToNext,
    goToPrevious,
    restart,
    submitForm,
    setSubmitError,

    // Config
    language,
    variant,
    i18n,
    config
  };
}
