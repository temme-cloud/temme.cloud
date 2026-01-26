/**
 * Delivery Assessment Form Module
 * Multi-step quiz with conditional branching, scoring, and Netlify Forms integration
 *
 * @version 1.0.0
 */
(function() {
  'use strict';

  // ==========================================================================
  // Configuration & Constants
  // ==========================================================================

  var CONFIG = {
    storageKey: 'temme-delivery-assessment',
    formName: 'delivery-assessment',
    autoAdvanceDelay: 250
  };

  // ==========================================================================
  // State Management
  // ==========================================================================

  var state = {
    currentStep: 0,
    totalSteps: 0,
    questions: [],
    responses: {},
    scores: {},
    variant: 'default',
    language: 'de',
    questionPath: [],
    isSubmitting: false,
    questionsData: null,
    i18n: {}
  };

  // ==========================================================================
  // DOM Elements Cache
  // ==========================================================================

  var elements = {};

  function cacheElements() {
    elements = {
      container: document.getElementById('assessment-container'),
      form: document.getElementById('delivery-assessment-form'),
      questionsContainer: document.getElementById('assessment-questions'),
      contactStep: document.getElementById('contact-step'),
      resultsStep: document.getElementById('results-step'),
      progressFill: document.getElementById('progress-fill'),
      currentStepSpan: document.getElementById('current-step'),
      totalStepsSpan: document.getElementById('total-steps'),
      nav: document.getElementById('assessment-nav'),
      backBtn: document.getElementById('assessment-back'),
      nextBtn: document.getElementById('assessment-next'),
      submitBtn: document.getElementById('assessment-submit'),
      loading: document.getElementById('assessment-loading'),
      // Hidden fields
      variantInput: document.getElementById('assessment-variant'),
      scoreInput: document.getElementById('assessment-score'),
      maturityInput: document.getElementById('assessment-maturity'),
      responsesInput: document.getElementById('assessment-responses'),
      timestampInput: document.getElementById('assessment-timestamp')
    };
  }

  // ==========================================================================
  // Question Data & Flow Logic
  // ==========================================================================

  function loadQuestions() {
    state.questionsData = window.ASSESSMENT_QUESTIONS;
    state.i18n = window.ASSESSMENT_I18N || {};

    if (!state.questionsData || !state.questionsData.questions) {
      console.error('Assessment questions data not found');
      return;
    }

    state.questions = filterQuestionsForVariant(state.questionsData.questions, state.variant);
    buildQuestionPath();
  }

  function filterQuestionsForVariant(questions, variant) {
    return questions.filter(function(q) {
      if (!q.variants) return true;
      return q.variants.indexOf(variant) !== -1 || q.variants.indexOf('all') !== -1;
    });
  }

  function buildQuestionPath() {
    state.questionPath = [];
    var currentId = state.questions[0] ? state.questions[0].id : null;

    while (currentId && currentId !== 'contact' && currentId !== 'end') {
      var question = getQuestionById(currentId);
      if (!question) break;

      state.questionPath.push(currentId);
      currentId = question.next || 'contact';
    }

    state.totalSteps = state.questionPath.length + 1; // +1 for contact form
    updateTotalSteps();
  }

  function recalculatePathFromStep(stepIndex) {
    state.questionPath = state.questionPath.slice(0, stepIndex + 1);

    var currentQuestionId = state.questionPath[stepIndex];
    var currentQuestion = getQuestionById(currentQuestionId);
    var response = state.responses[currentQuestionId];

    var nextId = determineNextQuestion(currentQuestion, response);

    while (nextId && nextId !== 'contact' && nextId !== 'end') {
      var question = getQuestionById(nextId);
      if (!question) break;

      state.questionPath.push(nextId);

      var existingResponse = state.responses[nextId];
      if (existingResponse) {
        nextId = determineNextQuestion(question, existingResponse);
      } else {
        nextId = question.next || 'contact';
      }
    }

    state.totalSteps = state.questionPath.length + 1;
    updateTotalSteps();
  }

  function determineNextQuestion(question, response) {
    if (!question || !response) return question ? question.next : 'contact';

    // For single select, check if selected option has specific next
    if (question.type === 'single' && typeof response === 'string') {
      var selectedOption = question.options.find(function(opt) {
        return opt.value === response;
      });
      if (selectedOption && selectedOption.next) {
        return selectedOption.next;
      }
    }

    return question.next || 'contact';
  }

  function getQuestionById(id) {
    return state.questions.find(function(q) {
      return q.id === id;
    });
  }

  function getLocalizedText(textObj) {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj;
    return textObj[state.language] || textObj.de || textObj.en || '';
  }

  // ==========================================================================
  // Safe DOM Manipulation
  // ==========================================================================

  /**
   * Creates a text node - safe from XSS
   */
  function createTextNode(text) {
    return document.createTextNode(text || '');
  }

  /**
   * Creates an element with optional attributes and text content
   * All content is safely escaped via textContent
   */
  function createElement(tag, attrs, textContent) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function(key) {
        if (attrs[key] !== null && attrs[key] !== undefined) {
          el.setAttribute(key, attrs[key]);
        }
      });
    }
    if (textContent) {
      el.textContent = textContent;
    }
    return el;
  }

  // ==========================================================================
  // Rendering (using safe DOM methods)
  // ==========================================================================

  function renderCurrentStep() {
    var stepIndex = state.currentStep;

    hideAllSteps();

    if (stepIndex < state.questionPath.length) {
      var questionId = state.questionPath[stepIndex];
      var question = getQuestionById(questionId);
      renderQuestion(question);
      elements.questionsContainer.style.display = 'block';
      updateNavigation('question');
    } else {
      elements.contactStep.style.display = 'block';
      updateNavigation('contact');
      // Focus first field
      var firstInput = elements.contactStep.querySelector('input');
      if (firstInput) firstInput.focus();
    }

    updateProgress();
    saveProgress();
  }

  function renderQuestion(question) {
    var isMultiSelect = question.type === 'multi';
    var existingResponse = state.responses[question.id];

    // Clear container
    elements.questionsContainer.textContent = '';

    // Create step container
    var stepDiv = createElement('div', {
      'class': 'assessment-step',
      'data-question-id': question.id
    });

    // Title
    var title = createElement('h2', { 'class': 'assessment-step__title' }, getLocalizedText(question.title));
    stepDiv.appendChild(title);

    // Description
    if (question.text) {
      var desc = createElement('p', { 'class': 'assessment-step__description' }, getLocalizedText(question.text));
      stepDiv.appendChild(desc);
    }

    // Options container
    var optionsDiv = createElement('div', {
      'class': 'assessment-options' + (isMultiSelect ? ' assessment-options--multi' : ''),
      'role': isMultiSelect ? 'group' : 'radiogroup',
      'aria-label': getLocalizedText(question.title)
    });

    // Render each option
    question.options.forEach(function(opt, idx) {
      var optionEl = renderOption(question, opt, idx, isMultiSelect, existingResponse);
      optionsDiv.appendChild(optionEl);
    });

    stepDiv.appendChild(optionsDiv);

    // Hint for multi-select
    if (isMultiSelect) {
      var hintText = question.helper ? getLocalizedText(question.helper) : (state.i18n.selectMultiple || 'Multiple selections allowed');
      var hint = createElement('p', { 'class': 'assessment-hint' }, hintText);
      stepDiv.appendChild(hint);
    }

    elements.questionsContainer.appendChild(stepDiv);

    // Add event listeners
    var options = elements.questionsContainer.querySelectorAll('.assessment-option');
    options.forEach(function(option) {
      option.addEventListener('click', handleOptionClick);
      option.addEventListener('keydown', handleOptionKeydown);
    });

    // Focus first option
    if (options.length > 0) {
      options[0].focus();
    }
  }

  function renderOption(question, option, index, isMultiSelect, existingResponse) {
    var inputType = isMultiSelect ? 'checkbox' : 'radio';
    var inputName = isMultiSelect ? question.id + '[]' : question.id;
    var isSelected = false;

    if (isMultiSelect) {
      isSelected = Array.isArray(existingResponse) && existingResponse.indexOf(option.value) !== -1;
    } else {
      isSelected = existingResponse === option.value;
    }

    // Create label (acts as option card)
    var label = createElement('label', {
      'class': 'assessment-option' + (isSelected ? ' assessment-option--selected' : ''),
      'tabindex': '0',
      'role': isMultiSelect ? 'checkbox' : 'radio',
      'aria-checked': String(isSelected),
      'data-value': option.value,
      'data-score': String(option.score || 0)
    });

    // Hidden input
    var input = createElement('input', {
      'type': inputType,
      'name': inputName,
      'value': option.value,
      'class': 'assessment-option__input'
    });
    if (isSelected) {
      input.checked = true;
    }
    label.appendChild(input);

    // Card content
    var card = createElement('span', { 'class': 'assessment-option__card' });
    var text = createElement('span', { 'class': 'assessment-option__text' }, getLocalizedText(option.label));
    card.appendChild(text);
    label.appendChild(card);

    // Checkmark
    var check = createElement('span', { 'class': 'assessment-option__check', 'aria-hidden': 'true' });
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '3');
    var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '20 6 9 17 4 12');
    svg.appendChild(polyline);
    check.appendChild(svg);
    label.appendChild(check);

    return label;
  }

  function hideAllSteps() {
    elements.questionsContainer.style.display = 'none';
    elements.contactStep.style.display = 'none';
    elements.resultsStep.style.display = 'none';
    if (elements.loading) elements.loading.style.display = 'none';
  }

  // ==========================================================================
  // Navigation & Progress
  // ==========================================================================

  function updateProgress() {
    var progress = ((state.currentStep + 1) / (state.totalSteps + 1)) * 100;
    elements.progressFill.style.width = Math.max(5, progress) + '%';
    elements.currentStepSpan.textContent = state.currentStep + 1;

    var progressBar = elements.progressFill.parentElement.parentElement;
    progressBar.setAttribute('aria-valuenow', state.currentStep + 1);
  }

  function updateTotalSteps() {
    elements.totalStepsSpan.textContent = state.totalSteps;
    var progressBar = elements.progressFill.parentElement.parentElement;
    progressBar.setAttribute('aria-valuemax', state.totalSteps);
  }

  function updateNavigation(stepType) {
    var isFirstStep = state.currentStep === 0;
    var isContactStep = stepType === 'contact';
    var isLastQuestion = state.currentStep === state.questionPath.length - 1;

    elements.nav.style.display = 'flex';
    elements.backBtn.style.display = isFirstStep ? 'none' : 'inline-flex';
    elements.nextBtn.style.display = isContactStep ? 'none' : 'inline-flex';
    elements.submitBtn.style.display = isContactStep ? 'inline-flex' : 'none';

    // Update next button text for last question
    if (isLastQuestion) {
      elements.nextBtn.textContent = state.i18n.continueToContact || 'Continue to Contact';
    } else {
      elements.nextBtn.textContent = state.i18n.next || 'Continue';
    }
  }

  function goToNextStep() {
    if (!validateCurrentStep()) return;

    captureCurrentResponse();
    recalculatePathFromStep(state.currentStep);

    state.currentStep++;
    renderCurrentStep();

    scrollToTop();
  }

  /**
   * Silent version of goToNextStep - used for auto-advance
   * Does not show validation error if no selection (just does nothing)
   */
  function goToNextStepSilent() {
    // Check if there's a selection without showing error
    var container = elements.questionsContainer.querySelector('.assessment-options');
    var selectedInputs = container ? container.querySelectorAll('input:checked') : [];

    if (!selectedInputs || selectedInputs.length === 0) {
      return; // Silently do nothing
    }

    clearValidationError();
    captureCurrentResponse();
    recalculatePathFromStep(state.currentStep);

    state.currentStep++;
    renderCurrentStep();

    scrollToTop();
  }

  function goToPreviousStep() {
    if (state.currentStep > 0) {
      state.currentStep--;
      renderCurrentStep();
      scrollToTop();
    }
  }

  function scrollToTop() {
    elements.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ==========================================================================
  // Response Handling
  // ==========================================================================

  function handleOptionClick(event) {
    var option = event.currentTarget;
    var input = option.querySelector('input');
    var container = option.closest('.assessment-options');
    var isMultiSelect = container.classList.contains('assessment-options--multi');

    if (isMultiSelect) {
      input.checked = !input.checked;
      option.classList.toggle('assessment-option--selected', input.checked);
      option.setAttribute('aria-checked', input.checked);
    } else {
      // Single select - deselect others
      container.querySelectorAll('.assessment-option').forEach(function(opt) {
        opt.classList.remove('assessment-option--selected');
        opt.setAttribute('aria-checked', 'false');
        opt.querySelector('input').checked = false;
      });
      input.checked = true;
      option.classList.add('assessment-option--selected');
      option.setAttribute('aria-checked', 'true');

      // Auto-advance on single select (skip validation error display)
      setTimeout(function() {
        goToNextStepSilent();
      }, CONFIG.autoAdvanceDelay);
    }
  }

  function handleOptionKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOptionClick(event);
    }
  }

  function captureCurrentResponse() {
    if (state.currentStep >= state.questionPath.length) return;

    var questionId = state.questionPath[state.currentStep];
    var question = getQuestionById(questionId);
    var container = elements.questionsContainer.querySelector('.assessment-options');

    if (!container) return;

    var isMultiSelect = question.type === 'multi';
    var selectedInputs = container.querySelectorAll('input:checked');

    if (isMultiSelect) {
      state.responses[questionId] = Array.from(selectedInputs).map(function(i) {
        return i.value;
      });
      state.scores[questionId] = Array.from(selectedInputs).reduce(function(sum, input) {
        var opt = question.options.find(function(o) {
          return o.value === input.value;
        });
        return sum + (opt ? (opt.score || 0) : 0);
      }, 0);
    } else {
      var selectedValue = selectedInputs[0] ? selectedInputs[0].value : null;
      state.responses[questionId] = selectedValue;
      var opt = question.options.find(function(o) {
        return o.value === selectedValue;
      });
      state.scores[questionId] = opt ? (opt.score || 0) : 0;
    }
  }

  function validateCurrentStep() {
    if (state.currentStep >= state.questionPath.length) {
      return validateContactForm();
    }

    var container = elements.questionsContainer.querySelector('.assessment-options');
    var selectedInputs = container ? container.querySelectorAll('input:checked') : [];

    if (!selectedInputs || selectedInputs.length === 0) {
      showValidationError(state.i18n.selectRequired || 'Please select an option.');
      return false;
    }

    clearValidationError();
    return true;
  }

  function validateContactForm() {
    var form = elements.form;
    var name = form.querySelector('#contact-name');
    var email = form.querySelector('#contact-email');
    var company = form.querySelector('#contact-company');
    var gdpr = form.querySelector('#contact-gdpr');

    var isValid = true;

    // Clear previous errors
    form.querySelectorAll('.assessment-field--error').forEach(function(f) {
      f.classList.remove('assessment-field--error');
    });

    if (!name.value.trim()) {
      markFieldError(name);
      isValid = false;
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
      markFieldError(email);
      isValid = false;
    }

    if (!company.value.trim()) {
      markFieldError(company);
      isValid = false;
    }

    if (!gdpr.checked) {
      markFieldError(gdpr);
      isValid = false;
    }

    if (!isValid) {
      showValidationError(state.i18n.fillRequired || 'Please fill in all required fields.');
    } else {
      clearValidationError();
    }

    return isValid;
  }

  function markFieldError(input) {
    var field = input.closest('.assessment-field');
    if (field) field.classList.add('assessment-field--error');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showValidationError(message) {
    clearValidationError();

    var errorEl = createElement('div', {
      'class': 'assessment-error',
      'id': 'assessment-error',
      'role': 'alert'
    }, message);

    elements.nav.parentNode.insertBefore(errorEl, elements.nav);
  }

  function clearValidationError() {
    var existingError = document.getElementById('assessment-error');
    if (existingError) existingError.remove();
  }

  // ==========================================================================
  // Scoring & Results
  // ==========================================================================

  function calculateTotalScore() {
    return Object.values(state.scores).reduce(function(sum, score) {
      return sum + score;
    }, 0);
  }

  function getMaturityLevel(score) {
    var levels = state.questionsData.results.levels;

    for (var i = 0; i < levels.length; i++) {
      var level = levels[i];
      if (score >= level.min && score <= level.max) {
        return level;
      }
    }

    return levels[0];
  }

  function renderResults() {
    var totalScore = calculateTotalScore();
    var maturityLevel = getMaturityLevel(totalScore);

    // Update hidden fields
    elements.scoreInput.value = totalScore;
    elements.maturityInput.value = getLocalizedText(maturityLevel.label);
    elements.responsesInput.value = JSON.stringify(state.responses);
    elements.timestampInput.value = new Date().toISOString();

    // Update score display
    document.getElementById('results-score').textContent = totalScore;

    // Update level badge (safe DOM manipulation)
    var levelEl = document.getElementById('results-level');
    levelEl.textContent = '';
    var badge = createElement('span', {
      'class': 'assessment-results__badge',
      'style': 'background-color: ' + maturityLevel.color
    }, getLocalizedText(maturityLevel.label));
    levelEl.appendChild(badge);

    // Update interpretation
    var interpretationEl = document.getElementById('results-interpretation');
    interpretationEl.textContent = '';
    var interpP = createElement('p', {}, getLocalizedText(maturityLevel.interpretation));
    interpretationEl.appendChild(interpP);

    // Update recommendations (safe DOM manipulation)
    var recommendationsEl = document.getElementById('results-recommendations');
    // Keep existing h3, update ul
    var existingUl = recommendationsEl.querySelector('ul');
    if (existingUl) {
      existingUl.remove();
    }
    var ul = createElement('ul', {});
    var recs = generateRecommendationsArray(maturityLevel.key);
    recs.forEach(function(rec) {
      var li = createElement('li', {}, rec);
      ul.appendChild(li);
    });
    recommendationsEl.appendChild(ul);

    // Show results
    hideAllSteps();
    elements.resultsStep.style.display = 'block';

    // Hide navigation
    elements.nav.style.display = 'none';

    // Update progress to complete
    elements.progressFill.style.width = '100%';
    elements.currentStepSpan.textContent = state.totalSteps + 1;
  }

  function generateRecommendationsArray(levelKey) {
    var recs = [];
    var recommendations = state.questionsData.results.recommendations;

    // Add specific recommendations based on responses
    if (state.responses.delivery === 'manual' && recommendations.manual) {
      recs.push(getLocalizedText(recommendations.manual));
    }

    if (state.responses.risk === 'regulated' && recommendations.regulated) {
      recs.push(getLocalizedText(recommendations.regulated));
    }

    if (state.responses.ops === 'reactive' && recommendations.reactive) {
      recs.push(getLocalizedText(recommendations.reactive));
    }

    if (state.responses.handover === 'throw-over' && recommendations['throw-over']) {
      recs.push(getLocalizedText(recommendations['throw-over']));
    }

    // Check blockers (multi-select)
    if (Array.isArray(state.responses.blockers) && state.responses.blockers.indexOf('flaky-tests') !== -1) {
      if (recommendations['flaky-tests']) {
        recs.push(getLocalizedText(recommendations['flaky-tests']));
      }
    }

    // Add level-specific recommendation
    if (recommendations[levelKey]) {
      recs.push(getLocalizedText(recommendations[levelKey]));
    }

    // Limit to 4 recommendations
    return recs.slice(0, 4);
  }

  // ==========================================================================
  // Form Submission
  // ==========================================================================

  function handleSubmit(event) {
    event.preventDefault();

    if (state.isSubmitting) return;
    if (!validateContactForm()) return;

    state.isSubmitting = true;
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = state.i18n.submitting || 'Submitting...';

    // Prepare hidden fields before submission
    var totalScore = calculateTotalScore();
    var maturityLevel = getMaturityLevel(totalScore);

    elements.variantInput.value = state.variant;
    elements.scoreInput.value = totalScore;
    elements.maturityInput.value = getLocalizedText(maturityLevel.label);
    elements.responsesInput.value = JSON.stringify(state.responses);
    elements.timestampInput.value = new Date().toISOString();

    var formData = new FormData(elements.form);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Form submission failed');

      clearSavedProgress();
      renderResults();
    })
    .catch(function(error) {
      console.error('Submission error:', error);
      showValidationError(state.i18n.submitError || 'An error occurred. Please try again.');
      state.isSubmitting = false;
      elements.submitBtn.disabled = false;
      elements.submitBtn.textContent = state.i18n.submit || 'Submit & View Results';
    });
  }

  // ==========================================================================
  // Progress Persistence (localStorage)
  // ==========================================================================

  function saveProgress() {
    var data = {
      currentStep: state.currentStep,
      responses: state.responses,
      scores: state.scores,
      questionPath: state.questionPath,
      variant: state.variant,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save progress to localStorage:', e);
    }
  }

  function loadSavedProgress() {
    try {
      var saved = localStorage.getItem(CONFIG.storageKey);
      if (!saved) return false;

      var data = JSON.parse(saved);

      // Check if saved data is recent (within 7 days)
      var savedAt = new Date(data.savedAt);
      var now = new Date();
      var daysDiff = (now - savedAt) / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        clearSavedProgress();
        return false;
      }

      // Check if variant matches
      if (data.variant !== state.variant) {
        clearSavedProgress();
        return false;
      }

      // Validate questionPath exists and has valid questions
      if (!data.questionPath || !Array.isArray(data.questionPath) || data.questionPath.length === 0) {
        clearSavedProgress();
        return false;
      }

      // Verify all questions in the path still exist
      var allQuestionsValid = data.questionPath.every(function(qId) {
        return getQuestionById(qId) !== undefined;
      });

      if (!allQuestionsValid) {
        clearSavedProgress();
        return false;
      }

      // Restore state
      state.responses = data.responses || {};
      state.scores = data.scores || {};
      state.questionPath = data.questionPath;
      state.totalSteps = state.questionPath.length + 1; // +1 for contact form

      // Validate currentStep is within bounds
      var maxStep = state.totalSteps; // Can go up to totalSteps (contact form)
      state.currentStep = Math.min(data.currentStep || 0, maxStep);

      return true;
    } catch (e) {
      console.warn('Could not load saved progress:', e);
      clearSavedProgress();
      return false;
    }
  }

  function clearSavedProgress() {
    try {
      localStorage.removeItem(CONFIG.storageKey);
    } catch (e) {
      console.warn('Could not clear saved progress:', e);
    }
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  function init() {
    var container = document.getElementById('assessment-container');
    if (!container) return;

    cacheElements();

    // Get configuration from DOM
    state.language = elements.container.dataset.lang || 'de';
    state.variant = elements.container.dataset.variant || 'default';

    // Load questions
    loadQuestions();

    if (!state.questions || state.questions.length === 0) {
      console.error('No questions loaded');
      return;
    }

    // Try to restore progress
    var hasProgress = loadSavedProgress();

    if (!hasProgress) {
      buildQuestionPath();
    }

    // Render current step
    renderCurrentStep();

    // Attach event listeners
    elements.backBtn.addEventListener('click', goToPreviousStep);
    elements.nextBtn.addEventListener('click', goToNextStep);
    elements.form.addEventListener('submit', handleSubmit);

    // Keyboard navigation
    document.addEventListener('keydown', handleGlobalKeydown);
  }

  function handleGlobalKeydown(event) {
    if (!elements.container) return;

    // Don't interfere with form inputs
    var target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (event.key === 'Enter' && target.tagName !== 'TEXTAREA') {
        // Allow Enter to submit from contact form inputs
        if (state.currentStep >= state.questionPath.length) {
          event.preventDefault();
          handleSubmit(event);
        }
      }
      return;
    }

    // For multi-select questions, Enter advances
    if (event.key === 'Enter') {
      var questionId = state.questionPath[state.currentStep];
      var question = getQuestionById(questionId);
      if (question && question.type === 'multi') {
        event.preventDefault();
        goToNextStep();
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
