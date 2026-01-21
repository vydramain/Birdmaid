---
name: designer
description: "UX design and business analysis skills: user journey mapping, requirements gathering, UX principles, business rules. Use when: designing user experiences, gathering requirements, defining business logic."
---

# Designer Skills

## Core Competencies

### 1. User Journey Mapping

**Best Practices:**
- Focus on one persona and one journey at a time
- Use real data (interviews, analytics, support logs) not assumptions
- Map 4-6 key stages (Awareness → Consideration → Decision → Use → Retention → Advocacy)
- Include actions, thoughts, emotions, and pain points at each stage
- Identify "moments of truth" (critical touchpoints)

**Journey Map Structure:**
| Stage | User Goal | Actions | Touchpoints | Emotions | Pain Points | Opportunities |
|-------|-----------|---------|-------------|----------|-------------|---------------|
| ...   | ...       | ...     | ...         | ...      | ...         | ...           |

**Common Mistakes:**
- Mapping based on assumptions (not real data)
- Focusing only on happy paths (ignore error flows)
- Too much detail (keep it readable)
- Keeping maps static (update as product changes)

### 2. Requirements Gathering

**Best Practices:**
- Start with user needs, not features
- Use "Jobs to be Done" framework
- Document use cases (main flow + alternate flows + error flows)
- Define acceptance criteria for each requirement
- Identify edge cases early

**Use Case Structure:**
- **Main Flow:**
  1. User action 1
  2. System response 1
  3. User action 2
  4. System response 2
  ...

- **Alternate Flows:**
  - What if user cancels?
  - What if data is invalid?
  - What if system is unavailable?

- **Error Flows:**
  - What happens on failure?
  - How do we recover?
  - What error messages do we show?

### 3. Business Rules & Validations

**Best Practices:**
- Document all business rules explicitly
- Separate business rules from technical implementation
- Define validation rules clearly
- Consider permissions and access control
- Document exceptions and edge cases

**Business Rules Template:**
- Rule ID: [unique identifier]
- Description: [what the rule does]
- When: [when it applies]
- Who: [who it applies to]
- Exceptions: [any exceptions]
- Examples: [concrete examples]

**Validation Rules:**
- Required fields
- Format constraints (email, phone, etc.)
- Range constraints (min/max values)
- Business constraints (e.g., "can't publish without cover image")

### 4. UX Design Principles

**Best Practices:**
- Design for the user, not for yourself
- Keep it simple (reduce cognitive load)
- Provide clear feedback (loading, success, error states)
- Make errors recoverable
- Follow platform conventions

**UI States to Consider:**
- **Loading:** Show progress, don't leave users guessing
- **Empty:** Helpful message, suggest actions
- **Error:** Clear error message, recovery path
- **Success:** Confirmation, next steps

**Accessibility:**
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus indicators

### 5. Prototyping & Wireframing

**Best Practices:**
- Start with low-fidelity (sketches, wireframes)
- Test early and often
- Use real content (not lorem ipsum)
- Consider all states (loading, empty, error, success)
- Test with real users

**Prototype Checklist:**
- [ ] All screens/states exist
- [ ] Navigation flows work
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Empty states have helpful messages
- [ ] Success states confirm actions

## Output Quality Checklist

When producing artifacts, ensure:
- ✅ Journey map based on real data (not assumptions)
- ✅ Use cases include main + alternate + error flows
- ✅ Business rules explicitly documented
- ✅ Validation rules defined
- ✅ UI states considered (loading, empty, error, success)
- ✅ Edge cases identified
- ✅ Acceptance criteria clear

## Common Pitfalls

- **Assumption-based design:** Not validating with real users
- **Happy path only:** Ignoring error and edge cases
- **Feature-first:** Starting with features instead of user needs
- **Missing states:** Forgetting loading/empty/error states
- **Over-complication:** Adding unnecessary features
