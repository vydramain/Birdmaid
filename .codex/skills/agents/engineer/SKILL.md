---
name: engineer
description: "Technical skills: feasibility assessment, architecture design, NFR evaluation, code quality. Use when: evaluating technical feasibility, designing architecture, assessing non-functional requirements."
---

# Engineer Skills

## MUST READ (before code changes)

- **docs/dev/GUARDRAILS.md** — canonical rules (output contract, style/units when applicable)
- **docs/style/STYLE_GUIDE.md** — style guide
- **docs/fps/FP<N>.md** — product contract for the current FP (see docs/fps/FP_EXAMPLE.md)
- **docs/dev/ARCHITECTURE.md** — слои front/back, Clean Architecture
- **docs/dev/COMMITS.md** — Conventional Commits (commitlint в pre-commit)

## MUST NOT (code quality)

- No `!important`, no `px` in CSS/SCSS (use `rem`), no constant inline styles
- No lazy allow-tags; no patching docs to justify violations

## Gates (pre-commit, CI)

- **lint-staged:** check-inline-styles.cjs, ESLint, stylelint, Prettier
- **commitlint:** Conventional Commits (type(scope): description)
- **CI:** pnpm lint, pnpm format:check, pnpm test, pnpm audit

---

## Core Competencies

### 1. Technical Feasibility Assessment

**Best Practices:**
- Evaluate against constraints (time, budget, skills, infrastructure)
- Identify technical risks early
- Consider scalability, maintainability, security
- Build PoCs (Proof of Concepts) for unknowns
- Document assumptions and risks

**Feasibility Framework:**
1. **Requirements Analysis:**
   - Functional requirements
   - Non-functional requirements (NFR)
   - Constraints (time, budget, skills)

2. **Technology Assessment:**
   - Available technologies and tools
   - Team skills and expertise
   - Infrastructure readiness
   - Integration capabilities

3. **Risk Identification:**
   - Technical risks (complexity, unknowns)
   - Schedule risks (time estimates)
   - Resource risks (skills, availability)
   - Security risks

4. **Gap Analysis:**
   - Required vs available skills
   - Required vs available infrastructure
   - Required vs available tools

5. **Recommendation:**
   - Proceed (feasible)
   - Proceed with conditions (feasible with mitigations)
   - Pivot (change approach)
   - Abandon (not feasible)

**Risk Scoring:**
| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| ...  | High/Med/Low | High/Med/Low | ... | ... |

### 2. Architecture Design

**Best Practices:**
- Start with requirements (not technology)
- Consider trade-offs (performance vs complexity, etc.)
- Design for change (maintainability)
- Document decisions (ADRs)
- Keep it simple (avoid over-engineering)

**Architecture Styles:**
- **Monolith:** Simple, but harder to scale
- **Microservices:** Scalable, but more complex
- **Event-driven:** Decoupled, but harder to debug
- **Serverless:** Cost-effective, but vendor lock-in

**Design Principles:**
- **Separation of Concerns:** Each component has single responsibility
- **DRY (Don't Repeat Yourself):** Avoid duplication
- **KISS (Keep It Simple, Stupid):** Prefer simple solutions
- **YAGNI (You Aren't Gonna Need It):** Don't build for future needs

**Architecture Documentation:**
- System boundaries (what's in/out)
- Main components and their responsibilities
- Data flow (how data moves through system)
- Integration points (external systems)
- Diagrams (sequence, component, deployment)

### 3. Non-Functional Requirements (NFR)

**Best Practices:**
- Define NFRs explicitly (not just "fast" or "secure")
- Make NFRs measurable (specific targets)
- Consider trade-offs (performance vs cost, etc.)
- Test NFRs (don't assume they'll be met)

**NFR Categories:**

**Performance:**
- Response time: < 200ms for 95% of requests
- Throughput: 1000 requests/second
- Latency: < 50ms p99

**Scalability:**
- Handle 10x traffic increase
- Horizontal scaling capability
- Database scaling strategy

**Security:**
- Authentication and authorization
- Data encryption (at rest, in transit)
- Vulnerability management
- Compliance (GDPR, etc.)

**Reliability:**
- Uptime: 99.9% availability
- Error rate: < 0.1%
- Recovery time: < 5 minutes

**Maintainability:**
- Code coverage: > 80%
- Documentation: ADRs, API docs
- Testing: unit, integration, e2e

**Usability:**
- Accessibility: WCAG 2.1 AA
- Mobile responsive
- Browser compatibility

### 4. Code Quality

**Best Practices:**
- Follow coding standards (consistent style)
- Write self-documenting code (clear names, structure)
- Keep functions small and focused
- Write tests (unit, integration, e2e)
- Review code (peer review)

**Code Quality Checklist:**
- [ ] Functions are small and focused (single responsibility)
- [ ] Code is self-documenting (clear names, structure)
- [ ] No code duplication (DRY)
- [ ] Error handling is explicit (not silent failures)
- [ ] Tests cover main flows and edge cases
- [ ] Code follows project standards

**Anti-patterns:**
- God objects (too many responsibilities)
- Code duplication
- Magic numbers/strings (use constants)
- Silent failures (errors should be visible)
- Commented-out code (remove it)

### 5. Implementation Planning

**Best Practices:**
- Break work into small, testable pieces
- Define MVP scope (minimum viable product)
- Plan iterations (MVP → v1 → v2)
- Identify dependencies
- Estimate effort (with uncertainty)

**Slicing Strategy:**
- **MVP:** Core functionality only
- **Iteration 1:** Add features
- **Iteration 2:** Polish and optimization

**Dependencies:**
- Technical dependencies (need API before UI)
- Team dependencies (need design before implementation)
- External dependencies (third-party services)

## Output Quality Checklist

When producing artifacts, ensure:
- ✅ Feasibility assessed (can we build it?)
- ✅ Architecture designed (how will we build it?)
- ✅ NFRs defined (performance, security, etc.)
- ✅ Risks identified and mitigated
- ✅ Dependencies mapped
- ✅ Implementation plan includes MVP and iterations
- ✅ Code quality standards defined

## Common Pitfalls

- **Over-engineering:** Building for future needs that may never come
- **Under-engineering:** Not considering scalability, security, etc.
- **Technology-first:** Choosing technology before understanding requirements
- **Ignoring NFRs:** Assuming they'll be met without planning
- **No documentation:** Not documenting architecture decisions
