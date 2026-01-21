---
name: delivery
description: "Project delivery skills: planning, risk management, dependency tracking, communication. Use when: planning releases, managing risks, coordinating teams."
---

# Delivery Skills

## Core Competencies

### 1. Release Planning

**Best Practices:**
- Break work into milestones (weekly/bi-weekly)
- Define clear acceptance criteria for each milestone
- Assign owners to tasks
- Track progress regularly (daily standups, weekly reviews)
- Adjust plan based on learnings

**Milestone Structure:**
| Milestone | Date | Tasks | Owner | Status | Dependencies |
|-----------|------|-------|-------|--------|--------------|
| M1: API   | ...  | ...   | ...   | todo   | ...          |
| M2: UI    | ...  | ...   | ...   | todo   | M1            |

**Planning Principles:**
- **Timeboxing:** Set fixed time, adjust scope
- **Buffer:** Add 20-30% buffer for unknowns
- **Prioritization:** Must-have vs nice-to-have
- **Flexibility:** Plan to change plan

### 2. Risk Management

**Best Practices:**
- Identify risks early (during planning)
- Assess probability and impact
- Define mitigation strategies
- Assign risk owners
- Monitor risks regularly

**Risk Register:**
| Risk | Probability | Impact | Mitigation | Owner | Status |
|------|-------------|--------|------------|-------|--------|
| ...  | High/Med/Low | High/Med/Low | ... | ... | open/mitigated |

**Risk Categories:**
- **Technical:** Complexity, unknowns, dependencies
- **Schedule:** Time estimates, resource availability
- **Resource:** Skills, availability, capacity
- **External:** Third-party services, regulations

**Mitigation Strategies:**
- **Avoid:** Change plan to avoid risk
- **Mitigate:** Reduce probability or impact
- **Transfer:** Move risk to someone else (vendor, insurance)
- **Accept:** Acknowledge and monitor

### 3. Dependency Tracking

**Best Practices:**
- Map all dependencies early (during planning)
- Identify dependency types (finish-to-start, etc.)
- Assign owners to dependencies
- Track dependency status regularly
- Escalate blocked dependencies quickly

**Dependency Types:**
- **Finish-to-Start:** Task B can't start until Task A finishes
- **Start-to-Start:** Task B can start when Task A starts
- **Finish-to-Finish:** Task B can finish when Task A finishes
- **Start-to-Finish:** Task B can finish when Task A starts (rare)

**Dependency Map:**
```
Task A (API)
  └─> Task B (UI) [finish-to-start]
      └─> Task C (Tests) [finish-to-start]
```

**Critical Path:**
- Identify tasks that, if delayed, delay entire project
- Focus monitoring on critical path tasks
- Have backup plans for critical path risks

### 4. Communication Planning

**Best Practices:**
- Define communication cadence (daily, weekly, etc.)
- Identify audiences (team, stakeholders, users)
- Choose right format (email, meeting, dashboard)
- Provide context (not just updates)
- Create feedback loops

**Communication Plan:**
| Audience | Cadence | Format | Content | Owner |
|----------|---------|--------|---------|-------|
| Team     | Daily   | Standup | Progress, blockers | ... |
| Stakeholders | Weekly | Email | Status, risks, decisions | ... |
| Users    | Monthly | Blog   | Features, updates | ... |

**Communication Principles:**
- **Transparency:** Share good and bad news
- **Timeliness:** Communicate early and often
- **Clarity:** Use simple language, avoid jargon
- **Actionability:** Include next steps
- **Consistency:** Regular cadence builds trust

### 5. Progress Tracking

**Best Practices:**
- Track progress regularly (daily/weekly)
- Use visual indicators (dashboards, charts)
- Focus on outcomes (not just activities)
- Identify blockers early
- Adjust plan based on progress

**Tracking Metrics:**
- **Velocity:** Work completed per iteration
- **Burndown:** Work remaining over time
- **Blockers:** Issues preventing progress
- **Quality:** Bugs, test coverage, etc.

**Status Updates:**
- **On Track:** Green, proceeding as planned
- **At Risk:** Yellow, may miss deadline
- **Blocked:** Red, cannot proceed

## Output Quality Checklist

When producing artifacts, ensure:
- ✅ Milestones defined with dates and owners
- ✅ Risks identified with mitigation strategies
- ✅ Dependencies mapped and tracked
- ✅ Communication plan includes all audiences
- ✅ Progress tracking mechanism defined
- ✅ Escalation paths clear

## Common Pitfalls

- **Optimistic planning:** Not accounting for unknowns
- **No buffer:** Not adding time for unexpected issues
- **Ignoring dependencies:** Not tracking dependencies
- **Poor communication:** Not keeping stakeholders informed
- **No adjustment:** Not changing plan when needed
