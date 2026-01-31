# Delivery Check: Scoring & Recommendation System

Technical documentation for the Delivery Check quiz on temme.cloud.

## Architecture

```
data/delivery-check/delivery-questions.json   # Questions, options, scores, levels, recommendations
src/delivery-check/stores/quiz.js             # SolidJS store: state, routing, scoring, recommendation logic
src/delivery-check/components/Results.jsx     # Results rendering (maturity badge, recommendations)
```

The quiz is a SolidJS app bundled by Vite into `static/js/delivery-check.js`, served by Hugo.

## Question Flow

The quiz uses conditional routing. Each question has a `next` field (question-level or option-level). The path is computed reactively in `quiz.js:questionPath()`.

```
objective ──> team ──> delivery ──┬── manual/none-delivery ──> blockers ──> risk ──┬── regulated ──> security ──> ops ──> handover ──> contact
                                  │                                                │
                                  └── pipeline/continuous ─────> risk ──────────────┼── balanced ────────────────> ops ──> handover ──> contact
                                                                                   │
                                                                                   └── low ─────────────────────> ops ──> handover ──> contact
```

**Key routing rules:**
- `delivery = manual` or `delivery = none-delivery` routes through `blockers` (extra question)
- `delivery = pipeline` or `delivery = continuous` skips `blockers`
- `risk = regulated` routes through `security` (extra question)
- `risk = balanced` or `risk = low` skips `security`

This means the shortest path has **6 questions** and the longest has **8 questions** (plus the contact form).

## Questions & Options

### objective (Strategic Focus)
| Value   | EN Label                               | Score |
|---------|----------------------------------------|-------|
| launch  | Launch new product or feature          | 18    |
| scale   | Scaling and operational stability      | 22    |
| rehab   | Modernize legacy system                | 16    |
| cost    | Reduce costs and complexity            | 14    |

### team (Team Structure)
| Value     | EN Label                                     | Score |
|-----------|----------------------------------------------|-------|
| solo      | Small core team (< 5 people)                 | 12    |
| squad     | Feature teams with clear ownership           | 20    |
| matrix    | Cross-functional with shared responsibilities| 16    |
| none-team | No dedicated development team yet            | 6     |

### delivery (Deployment Process)
| Value         | EN Label                             | Score | Routes to  |
|---------------|--------------------------------------|-------|------------|
| manual        | Manual with little automation        | 8     | blockers   |
| pipeline      | CI/CD pipeline with manual approval  | 16    | risk       |
| continuous    | Fully automated with auto-rollback   | 24    | risk       |
| none-delivery | We don't have a defined process yet  | 4     | blockers   |

### blockers (Deployment Blockers) — multi-select
| Value           | EN Label                                    | Score |
|-----------------|---------------------------------------------|-------|
| slow-reviews    | Slow code reviews or approvals              | 8     |
| flaky-tests     | Flaky tests or lacking test coverage        | 10    |
| infra           | Infrastructure issues or lacking monitoring | 12    |
| process         | Unclear processes or responsibilities       | 6     |
| unsure-blockers | We're not sure what's holding us back       | 4     |

Scores are additive (all selected options sum).

### risk (Regulatory Environment)
| Value     | EN Label                                          | Score | Routes to |
|-----------|---------------------------------------------------|-------|-----------|
| regulated | Heavily regulated (Finance, Health, Government)   | 14    | security  |
| balanced  | Partially regulated with specific requirements    | 18    | ops       |
| low       | Minimal regulation / Startup environment           | 20    | ops       |

### security (Security Integration) — only shown for regulated industries
| Value         | EN Label                                        | Score |
|---------------|-------------------------------------------------|-------|
| basic         | Basic measures, little automation               | 12    |
| managed       | Policy as Code, secrets management, regular audits | 22  |
| advanced      | Threat modeling, Zero Trust, continuous scanning| 26    |
| none-security | No dedicated security measures yet              | 6     |

### ops (Observability & Operations)
| Value     | EN Label                                            | Score |
|-----------|-----------------------------------------------------|-------|
| reactive  | Reactive - errors are fixed ad-hoc                  | 10    |
| proactive | Monitoring and alerting, postmortems after incidents| 18    |
| resilient | SLI/SLO defined, chaos engineering, load tests      | 24    |

### handover (Knowledge Transfer)
| Value         | EN Label                                                    | Score |
|---------------|-------------------------------------------------------------|-------|
| throw-over    | Development hands over to separate ops team                 | 8     |
| shared        | Shared responsibility, runbooks available                   | 16    |
| full-team     | Teams run their services end-to-end (You build it, you run it) | 22 |
| none-handover | No formal knowledge transfer process                        | 4     |

## Maturity Levels

| Level      | Score Range | Color   |
|------------|-------------|---------|
| Beginner   | 0 -- 65     | #e74c3c |
| Developing | 66 -- 90    | #f39c12 |
| Established| 91 -- 120   | #3498db |
| Advanced   | 121 -- 200  | #007163 |

Total score = sum of all answered questions' scores.

## Score Ranges by Path

| Path                              | Min Score | Max Score |
|-----------------------------------|-----------|-----------|
| Short (no blockers, no security)  | 56        | 132       |
| Medium (with blockers, no sec.)   | 42        | 168       |
| Medium (no blockers, with sec.)   | 68        | 158       |
| Long (with blockers + security)   | 48        | 176       |

See `docs/scripts/score-analysis.py` for exact calculations.

## Recommendations

Recommendations are triggered by specific option selections in `quiz.js:generateRecommendations()`. Max 4 recommendations are shown.

### Trigger conditions (in evaluation order)

| Trigger Key      | Condition                              | EN Recommendation |
|------------------|----------------------------------------|-------------------|
| manual           | `delivery === 'manual'`                | Automate deployments with CI/CD pipelines |
| none-delivery    | `delivery === 'none-delivery'`         | Define a basic deployment process |
| regulated        | `risk === 'regulated'`                 | Implement compliance framework |
| reactive         | `ops === 'reactive'`                   | Invest in observability |
| throw-over       | `handover === 'throw-over'`            | Break down silos with shared ownership |
| none-handover    | `handover === 'none-handover'`         | Document critical knowledge |
| none-team        | `team === 'none-team'`                 | Build a dedicated core team |
| none-security    | `security === 'none-security'`         | Start with secrets management basics |
| flaky-tests      | `blockers includes 'flaky-tests'`      | Stabilize test suite |
| unsure-blockers  | `blockers includes 'unsure-blockers'`  | Discovery workshop to uncover bottlenecks |
| (level key)      | Always (based on maturity level)       | Level-specific advice |

The level-specific recommendation is always added last.

## "None of the Above" Options

Added 2025-01 to capture leads with pre-production or greenfield setups.

| Question  | Value           | Score | Rationale |
|-----------|-----------------|-------|-----------|
| team      | none-team       | 6     | Below solo (12). No team yet = high-value consulting lead. |
| delivery  | none-delivery   | 4     | Below manual (8). Routes to blockers like manual does. |
| blockers  | unsure-blockers | 4     | Multi-select catch-all. Signals need for discovery session. |
| security  | none-security   | 6     | Below basic (12). Urgent consulting need. |
| handover  | none-handover   | 4     | Below throw-over (8). Zero process = foundational work needed. |

**Not added to** (by design):
- `objective` — all 4 strategic goals cover the space well; "not sure" as an opener hurts engagement
- `risk` — "Minimal regulation / Startup" already covers the low end
- `ops` — "Reactive" already captures "we have nothing" well enough

## Development

```bash
# Build JS bundle
npm run build

# Build Hugo site
hugo

# Dev server with hot reload
hugo server --disableFastRender

# Validate JSON
python3 -c "import json; json.load(open('data/delivery-check/delivery-questions.json')); print('OK')"

# Run score analysis
python3 docs/scripts/score-analysis.py

# Run recommendation coverage test
python3 docs/scripts/test-recommendations.py
```
