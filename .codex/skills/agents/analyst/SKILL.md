---
name: analyst
description: "Product analytics skills: metrics design, data analysis, experimentation, funnel analysis. Use when: defining success metrics, analyzing user behavior, designing experiments."
---

# Analyst Skills

## Core Competencies

### 1. Metrics Design

**Best Practices:**
- Define North Star Metric (single metric that captures product value)
- Use leading indicators (predict future) not just lagging (describe past)
- Avoid vanity metrics (metrics that look good but don't drive value)
- Normalize metrics (per user, per session, etc.)
- Make metrics actionable (tied to specific actions)

**Metric Types:**
- **North Star Metric:** Single metric that best captures product value
- **Supporting Metrics:** Leading indicators that drive North Star
- **Guardrail Metrics:** Ensure we don't break things (latency, error rate, churn)
- **Input Metrics:** Metrics we can directly influence (features shipped, experiments run)

**Metric Tree Example:**
```
North Star: Weekly Active Users
├── Driver 1: User Acquisition
│   ├── Sign-ups per week
│   └── Activation rate
└── Driver 2: User Engagement
    ├── Sessions per user
    └── Feature adoption rate
```

**Anti-patterns:**
- Vanity metrics (total users, total page views)
- Too many metrics (focus on what matters)
- Metrics without context (always compare to baseline)

### 2. Funnel Analysis

**Best Practices:**
- Define clear funnel steps
- Measure conversion at each step
- Identify drop-off points
- Segment funnels (by user type, feature, etc.)
- Test improvements at drop-off points

**Funnel Structure:**
| Step | Event | Conversion Rate | Drop-off |
|------|-------|-----------------|----------|
| 1. Sign up | user_signed_up | 100% | - |
| 2. Onboard | onboarding_completed | 60% | 40% |
| 3. First action | first_action_completed | 40% | 20% |
| 4. Return | user_returned | 30% | 10% |

**Analysis Questions:**
- Where do users drop off?
- Why do they drop off? (qualitative research)
- What can we test to improve conversion?
- How does conversion vary by segment?

### 3. Event Taxonomy

**Best Practices:**
- Use consistent naming (verb_noun format)
- Include all relevant properties
- Document when events fire
- Make events actionable (tied to product decisions)

**Event Structure:**
- Event name: `action_object` (e.g., `game_played`, `comment_created`)
- Properties:
  - User properties (user_id, user_type)
  - Context properties (page, feature, device)
  - Action properties (duration, result, etc.)

**Event Examples:**
- `game_viewed` (game_id, user_id, source)
- `game_played` (game_id, user_id, duration)
- `comment_created` (game_id, user_id, comment_length)

### 4. Experimentation (A/B Testing)

**Best Practices:**
- Start with hypothesis (not just "let's test this")
- Define success metrics before running test
- Ensure statistical significance (power analysis)
- Run tests long enough (account for weekly patterns)
- Document learnings (even failed tests)

**Experiment Design:**
- **Hypothesis:** If we [change], then [metric] will [change] because [reason]
- **Success Criteria:** [Metric] increases by [X]% with [Y]% confidence
- **Guardrail Metrics:** Ensure we don't break [metric1, metric2]
- **Duration:** [X] days (account for weekly patterns)
- **Sample Size:** [X] users per variant (power analysis)

**Common Mistakes:**
- Testing without hypothesis
- Stopping too early (not accounting for weekly patterns)
- Ignoring guardrail metrics
- Not documenting learnings

### 5. Data Analysis & Interpretation

**Best Practices:**
- Always compare to baseline (not just absolute numbers)
- Segment data (by user type, feature, time period)
- Look for trends (not just snapshots)
- Combine quantitative with qualitative (why, not just what)
- Question the data (validate assumptions)

**Analysis Framework:**
1. **What:** What happened? (descriptive)
2. **Why:** Why did it happen? (diagnostic)
3. **What if:** What if we change X? (predictive)
4. **What should:** What should we do? (prescriptive)

**Segmentation:**
- By user type (new vs returning, power vs casual)
- By feature (which features drive engagement)
- By time (daily patterns, weekly patterns, trends)
- By cohort (users who signed up in same period)

## Output Quality Checklist

When producing artifacts, ensure:
- ✅ North Star Metric defined
- ✅ Supporting metrics identified
- ✅ Guardrail metrics specified
- ✅ Funnel defined with conversion rates
- ✅ Events listed with properties
- ✅ Experiment design includes hypothesis and success criteria
- ✅ Analysis includes segmentation and trends

## Common Pitfalls

- **Vanity metrics:** Focusing on metrics that look good but don't drive value
- **Too many metrics:** Losing focus by tracking everything
- **No baseline:** Not comparing to previous periods
- **Ignoring qualitative:** Only looking at numbers, not understanding why
- **Premature optimization:** Optimizing metrics that don't matter
