# Execution Plan: Project Reality Check (FP1-FP7)

**Goal:** Build traceable map "Feature → Code → Tests → Evidence" and reconcile with current platform.

**Status:** FP6/FP7 RTM complete, FP1-FP5 pending

---

## PR Batches

### Batch 1: Dead Code Removal (PR: `chore/remove-dead-code`)

**Scope:** Remove unused code identified in RTM

**Files to Remove:**
- `front/src/contexts/WindowContext.tsx` (replaced by WindowRegistry)
- `front/src/components/WindowManager.tsx` (replaced by `os/wm/WindowManager.tsx`)
- `front/src/components/Window.tsx` (uses old WindowContext)

**Files to Verify:**
- `front/src/App.tsx` - Check if routes are still used (if not, remove or document as legacy)

**Gates:**
- ✅ `npm test` green (no broken imports)
- ✅ Manual verification: Desktop still works
- ✅ No references to removed files (grep check)

**Risk:** Low (code is confirmed unused)

---

### Batch 2: FP6 Test Implementation (PR: `test/fp6-implement-tests`)

**Scope:** Implement placeholder tests in `front/__tests__/fp6/`

**Tests to Implement:**
1. `desktop.workspace.test.tsx` - Desktop rendering, landing window auto-open
2. `desktop.icons.test.tsx` - Icon display, click handlers, VFS sync
3. `window.manager.test.tsx` - Window open/close/focus using WindowRegistry
4. `window.drag.test.tsx` - Window drag using WindowStore (verify rAF, no React commits)
5. `explorer.tree.test.tsx` - Explorer VFS navigation (not jams/years/games)
6. `help.txt.test.tsx` - Help window loads from `/help` endpoint
7. `mobile.mode.test.tsx` - Platform detection (currently placeholder)

**Gates:**
- ✅ All tests pass
- ✅ Tests use FP7 architecture (WindowRegistry, WindowStore, VFS)
- ✅ Network isolation: use `mockApi`/fixtures
- ✅ Zero skipped/only tests

**Risk:** Medium (tests need to match FP7 architecture, not FP6 docs)

---

### Batch 3: FP7 Test Creation (PR: `test/fp7-core-tests`)

**Scope:** Create tests for FP7-specific features

**Tests to Create:**
1. `front/__tests__/fp7/shell-root.test.tsx` - ShellRoot routing, platform detection
2. `front/__tests__/fp7/window-store.test.ts` - WindowStore rAF drag, geometry updates
3. `front/__tests__/fp7/app-registry.test.ts` - AppRegistry registration, lookup
4. `front/__tests__/fp7/app-host.test.tsx` - AppHost sandbox security, loading overlay
5. `front/__tests__/fp7/vfs.test.ts` - VFS read/write/subscribe operations
6. `front/__tests__/fp7/vfs-desktop-sync.test.tsx` - Desktop icons sync with VFS
7. `front/__tests__/fp7/explorer-vfs.test.tsx` - Explorer VFS integration

**Gates:**
- ✅ All tests pass
- ✅ Performance tests verify <16ms input latency for drag
- ✅ Security tests verify iframe sandbox attributes
- ✅ Network isolation: use `mockApi`/fixtures

**Risk:** Medium (performance tests may be flaky on CI)

---

### Batch 4: FP1-FP5 Reality Check (PR: `docs/fp1-fp5-reality-check`)

**Scope:** Map FP1-FP5 features to current codebase

**Tasks:**
1. Inventory FP1-FP5 features from docs
2. Check if features accessible via ShellRoot/Desktop
3. Map to current routes/pages/components
4. Identify deprecated features
5. Update RTM.md with FP1-FP5 rows

**Gates:**
- ✅ RTM.md updated with FP1-FP5
- ✅ Reality Check sections added to FP1-FP5.md files
- ✅ Deprecated features documented

**Risk:** Low (documentation only)

---

### Batch 5: Test Reconciliation (PR: `test/reconcile-fp1-fp5`)

**Scope:** Update/remove FP1-FP5 tests based on reality check

**Tasks:**
1. Review FP1-FP5 test files
2. Mark tests as KEEP/REWRITE/REMOVE based on RTM
3. Update tests to match current architecture
4. Remove tests for deprecated features
5. Add contract tests for removed features (if needed)

**Gates:**
- ✅ `npm test` green
- ✅ Zero skipped/only tests
- ✅ All tests reflect current behavior
- ✅ Network isolation preserved

**Risk:** Medium (may need to rewrite many tests)

---

### Batch 6: Evidence Collection (PR: `docs/evidence-collection`)

**Scope:** Collect evidence for all features

**Tasks:**
1. Run test suite, collect coverage
2. Document manual verification steps
3. Create demo notes for each feature
4. Link evidence in FP docs

**Gates:**
- ✅ Coverage reports generated
- ✅ Manual verification checklist completed
- ✅ Evidence linked in FP docs

**Risk:** Low (documentation)

---

## Execution Order

1. **Batch 1** (Dead Code Removal) - Low risk, clears technical debt
2. **Batch 2** (FP6 Tests) - Medium risk, establishes baseline
3. **Batch 3** (FP7 Tests) - Medium risk, fills gaps
4. **Batch 4** (FP1-FP5 Reality Check) - Low risk, documentation
5. **Batch 5** (Test Reconciliation) - Medium risk, depends on Batch 4
6. **Batch 6** (Evidence Collection) - Low risk, final step

---

## Gates (All Batches)

### Code Quality
- ✅ `npm test` green
- ✅ Zero skipped/only tests
- ✅ Linter passes
- ✅ TypeScript strict mode clean

### Test Quality
- ✅ Tests reflect current behavior (not outdated docs)
- ✅ Network isolation: use `mockApi`/fixtures
- ✅ No flaky tests (performance tests may need CI tuning)

### Documentation
- ✅ RTM.md updated
- ✅ FP docs have Reality Check sections
- ✅ Evidence linked

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FP6 tests don't match FP7 architecture | High | Medium | Update tests to use WindowRegistry/WindowStore/VFS |
| Performance tests flaky on CI | Medium | Low | Use performance budgets, allow retries |
| Dead code removal breaks something | Low | High | Verify with grep, manual testing |
| FP1-FP5 features deprecated | Medium | Medium | Document deprecation, add migration path |

---

## Success Criteria

1. ✅ RTM.md complete for FP1-FP7
2. ✅ All FP docs have Reality Check sections
3. ✅ All tests pass and reflect current behavior
4. ✅ Dead code removed
5. ✅ Evidence collected and linked
6. ✅ Execution plan documented

---

## Timeline Estimate

- **Batch 1:** 1-2 hours (dead code removal)
- **Batch 2:** 4-6 hours (FP6 test implementation)
- **Batch 3:** 6-8 hours (FP7 test creation)
- **Batch 4:** 2-3 hours (FP1-FP5 reality check)
- **Batch 5:** 4-6 hours (test reconciliation)
- **Batch 6:** 1-2 hours (evidence collection)

**Total:** 18-27 hours (2-3 days for one engineer)

---

## Notes

- Start with Batch 1 to reduce confusion from dead code
- Batch 2-3 can be parallelized (different test files)
- Batch 4-5 are sequential (need reality check before reconciliation)
- Batch 6 is final step (collects evidence from all batches)
