# Test Strategy

**Purpose:** Test strategy, UAT/BDD scenarios, and acceptance criteria. Referenced by agents (build, release) and UX baseline skill.

## Test pyramid

- **Unit:** Component/service logic.
- **Integration:** API and DB.
- **E2E:** Critical user journeys.

## UAT / BDD (examples)

| Scenario                    | Given           | When        | Then              |
|----------------------------|-----------------|-------------|-------------------|
| User opens app             | App is running  | User visits / | Home page loads |
| (add your scenarios)       | …               | …           | …                 |

## Acceptance criteria (loading / empty / error)

- **Loading:** Show loading state while data is fetched.
- **Empty:** Show empty state when no data.
- **Error:** Show error state and retry where applicable.

## References

- FP tests: `docs/fps/FP*.md` → Tests section
- API: [API.yaml](./API.yaml)
