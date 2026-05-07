# Finishing Agent Guide: Patient Management Application

**Document Type:** Project Completion & Handoff Procedures  
**Date:** May 7, 2026  
**Status:** Final Gate Orchestration Guide  
**Related:** Doc_BRD.md, Doc_Verification_Strategy.md, Doc_Gap_Analysis_Framework.md

---

## Overview

The **Finishing Agent** orchestrates the final stage of feature development after all quality gates have passed:

✅ **Verification Agent**: All tests passing, coverage >80%  
✅ **Gap Analysis Agent**: BRD compliance ≥95%  
✅ **Code Review Agent**: All feedback addressed

When these gates pass, the Finishing Agent provides **three clear options**:

1. **Merge to Main** — Direct integration for trusted features
2. **Create Pull Request** — Standard review flow for team visibility
3. **Cleanup Worktree** — Remove feature branch and worktree

---

## When to Invoke the Finishing Agent

**Trigger Conditions:**
- ✅ Feature implementation 100% complete
- ✅ All tests passing (unit + integration + E2E)
- ✅ Verification Agent approved
- ✅ Gap Analysis score ≥95/100
- ✅ Code Review Agent approved (or all feedback addressed)
- ✅ No uncommitted changes in worktree
- ✅ Branch synced with latest main

**Input Required:**
- Worktree name and path
- Feature branch name
- Confirmation that all gates passed
- Developer's preferred merge strategy

---

## The Three Paths

### Path 1: Merge to Main

**When to Choose:**
- Small, low-risk changes (<100 lines)
- Hotfixes requiring immediate deployment
- Single-developer ownership with full confidence
- No controversy or architectural changes
- Team has agreed on direct merge policy

**Risk Level:** Medium  
**Speed:** Fastest (minutes)  
**Visibility:** Low (no PR review)

---

### Path 2: Create Pull Request

**When to Choose:**
- Standard feature development workflow
- Large changes (>100 lines)
- Complex features touching multiple areas
- New patterns or architectural changes
- Team prefers review before merge
- Need documentation of changes for audit

**Risk Level:** Low  
**Speed:** Moderate (hours to days)  
**Visibility:** High (team review + discussion)

**✅ Recommended for most features**

---

### Path 3: Cleanup Worktree

**When to Choose:**
- Feature abandoned or deprioritized
- Feature merged via different method
- Worktree no longer needed after merge
- Consolidating development after parallel work
- End of sprint cleanup

**Risk Level:** Low (can be undone if branch preserved)  
**Speed:** Fastest (seconds)  
**Visibility:** Internal only

---

## Pre-Flight Safety Checks

Before any finishing operation, verify these conditions:

### 1. Git Status Clean

```powershell
cd c:\Work\Copilot-AI\worktrees\[feature-name]

# Check for uncommitted changes
git status

# Expected output: "nothing to commit, working tree clean"
# If not clean, commit or stash changes first
```

### 2. All Tests Passing

```powershell
# Backend tests
cd backend
npm test
npm run test:integration

# Frontend tests
cd ..\frontend
npm test
npm run test:e2e

# All should show: "Tests: X passed"
```

### 3. Branch Synced with Main

```powershell
# Fetch latest main
git fetch origin main

# Check if behind main
git rev-list --count HEAD..origin/main

# Expected output: "0" (not behind)
# If behind, rebase first:
git rebase origin/main
```

### 4. No Merge Conflicts

```powershell
# Test merge without committing
git merge --no-commit --no-ff origin/main

# If conflicts, resolve them first
# Then abort test merge:
git merge --abort
```

### 5. Quality Gates Approved

**Verification Checklist:**
- [ ] Verification Agent report shows "✅ APPROVED"
- [ ] Gap Analysis score documented (≥95/100)
- [ ] Code Review Agent feedback addressed
- [ ] CI pipeline passing (if configured)
- [ ] Manual testing completed

---

## Path 1: Merge to Main (Detailed Workflow)

### Step 1: Summarize Changes

```powershell
cd c:\Work\Copilot-AI\worktrees\[feature-name]

# View files changed
git diff --stat origin/main

# View commit log
git log --oneline origin/main..HEAD

# Count changes
git diff origin/main --shortstat
```

**Example Output:**
```
15 files changed, 487 insertions(+), 23 deletions(-)
```

### Step 2: Present Summary to Developer

**Decision Template:**

```
=== MERGE SUMMARY ===

Feature: [Patient Management CRUD]
Branch: feature/patient-management
Worktree: worktrees/patient-management

CHANGES:
- Files modified: 15
- Lines added: 487
- Lines removed: 23
- Commits: 8

VERIFICATION STATUS:
✅ All tests passing (52/52)
✅ Coverage: 87% (>80% target)
✅ Gap Analysis: 98/100 (>95% target)
✅ Code Review: Approved

IMPACT ANALYSIS:
- Low risk: Self-contained feature
- No breaking changes
- Database migration included
- Backward compatible

MERGE OPTIONS:
1. Direct merge to main (Recommended for this feature)
2. Create PR for team visibility
3. Hold and cleanup later

Your choice: ___
```

### Step 3: Execute Merge

If developer chooses **Option 1 (Direct Merge)**:

```powershell
# Switch to main repository
cd c:\Work\Copilot-AI
git checkout main

# Ensure main is up-to-date
git pull origin main

# Merge feature branch
git merge --no-ff feature/[feature-name] -m "feat: [Feature Description]

- Implemented [key changes]
- Tests: 100% passing
- Coverage: X%
- BRD Compliance: X/100

Verification: ✅
Gap Analysis: ✅
Code Review: ✅"

# Push to remote
git push origin main

# Capture merge commit hash
git log -1 --format="%H"
```

### Step 4: Verify Merge Success

```powershell
# Confirm merge commit exists
git log -1 --oneline

# Verify files are in main
git diff HEAD~1 --stat

# Check for any issues
git status
```

### Step 5: Update Dependent Worktrees (if any)

```powershell
# For each dependent worktree
cd c:\Work\Copilot-AI\worktrees\[dependent-feature]

# Pull latest main
git fetch origin main
git rebase origin/main

# Verify no conflicts
git status
```

### Step 6: Confirmation Report

**Provide to Developer:**

```
✅ MERGE SUCCESSFUL

Feature: [Patient Management CRUD]
Merged to: main
Commit Hash: abc123def456
Timestamp: 2026-05-07 14:32:18 UTC

FILES CHANGED:
- backend/src/routes/patients.ts (new)
- backend/src/controllers/patientController.ts (new)
- frontend/src/pages/Patients/PatientList.tsx (new)
[... additional files ...]

NEXT STEPS:
1. Feature is now live on main branch
2. CI/CD pipeline triggered (if configured)
3. Worktree can be cleaned up
4. Tag release if needed: git tag v1.1.0-patient-mgmt

CLEANUP COMMAND:
git worktree remove worktrees/patient-management
git branch -d feature/patient-management
```

---

## Path 2: Create Pull Request (Detailed Workflow)

### Step 1: Prepare Branch for PR

```powershell
cd c:\Work\Copilot-AI\worktrees\[feature-name]

# Ensure branch is up-to-date
git fetch origin main
git rebase origin/main

# Push to remote (force if rebased)
git push --force-with-lease origin feature/[feature-name]
```

### Step 2: Generate PR Description

**Automated PR Template:**

```markdown
## Feature: [Patient Management CRUD]

### Summary
Implements patient registration, profile management, and search functionality as specified in BRD Section 3.1 (Patient Management).

### Implementation Details

**Backend:**
- ✅ Patient CRUD API endpoints
- ✅ Search with name/phone indexing
- ✅ Duplicate phone number prevention
- ✅ Input validation with Zod

**Frontend:**
- ✅ Patient list with pagination
- ✅ Add/Edit patient forms
- ✅ Search component with debouncing
- ✅ Patient profile view

**Database:**
- ✅ Patient table migration
- ✅ Indexes on name and phone fields

### Testing

**Coverage:** 87% (38 tests)
- Unit tests: 22 passing
- Integration tests: 11 passing
- E2E tests: 5 passing

**Manual Testing:**
- [x] Add patient with valid data
- [x] Search returns results <2s
- [x] Edit patient updates correctly
- [x] Duplicate phone rejected

### Quality Gates

✅ **Verification Agent:** APPROVED  
✅ **Gap Analysis:** 98/100 (>95% threshold)  
✅ **Code Review:** APPROVED  

### BRD Requirements Met

- [x] Add, edit, and view patient details
- [x] Capture: Name, Age/DOB, Gender, Contact
- [x] Search patients by name or phone number
- [x] Patient search <2-5 seconds (actual: <2s)

### Files Changed

**Added (12 files):**
- `backend/src/routes/patients.ts`
- `backend/src/controllers/patientController.ts`
- `backend/src/services/patientService.ts`
- `backend/src/validators/patientValidator.ts`
- `backend/tests/unit/patientService.test.ts`
- `backend/tests/integration/patients.test.ts`
- `frontend/src/pages/Patients/PatientList.tsx`
- `frontend/src/pages/Patients/PatientForm.tsx`
- `frontend/src/pages/Patients/PatientProfile.tsx`
- `frontend/src/components/PatientSearch/index.tsx`
- `frontend/src/tests/e2e/patient-management.spec.ts`
- `prisma/migrations/[timestamp]_create_patients.sql`

**Modified (3 files):**
- `backend/src/server.ts` (added patient routes)
- `frontend/src/App.tsx` (added patient pages)
- `prisma/schema.prisma` (added Patient model)

### Breaking Changes

None — feature is additive only.

### Deployment Notes

**Database Migration Required:**
```bash
npm run prisma:migrate:deploy
```

**Environment Variables:**
No new variables required.

### Related Documents

- BRD: Doc_BRD.md (Section 3.1)
- Verification Report: [Link to report]
- Gap Analysis: [Link to analysis]
- Code Review: [Link to review]

### Screenshots

[Attach screenshots of UI components]

---

**Merge Strategy:** Squash and merge recommended  
**Target Branch:** main  
**Reviewer:** [@team-lead] [@senior-dev]
```

### Step 3: Create PR via GitHub CLI

```powershell
# Install GitHub CLI if needed
# winget install GitHub.cli

# Authenticate
gh auth login

# Create PR with template
cd c:\Work\Copilot-AI\worktrees\[feature-name]

gh pr create `
  --title "feat(patients): implement patient management CRUD" `
  --body-file .github/PR_TEMPLATE.md `
  --base main `
  --head feature/[feature-name] `
  --label "feature" `
  --label "ready-for-review" `
  --reviewer @team-lead

# Output: PR URL created
```

**Alternative: Create via GitHub Web UI**

1. Navigate to: `https://github.com/[org]/[repo]/compare/main...feature/[feature-name]`
2. Click "Create Pull Request"
3. Paste generated PR description
4. Set reviewers and labels
5. Click "Create Pull Request"

### Step 4: PR Confirmation Report

```
✅ PULL REQUEST CREATED

Feature: Patient Management CRUD
PR Number: #42
PR URL: https://github.com/[org]/[repo]/pull/42
Status: Open, awaiting review

REVIEWERS:
- @team-lead (requested)
- @senior-dev (requested)

CHECKS:
⏳ CI Pipeline: Running...
⏳ Code Coverage: Running...

NEXT STEPS:
1. Monitor PR for review feedback
2. Address any requested changes
3. Wait for approval from reviewers
4. Merge after approval

TO ADDRESS FEEDBACK:
cd worktrees/[feature-name]
# Make changes
git add .
git commit -m "fix: address PR feedback"
git push origin feature/[feature-name]
```

---

## Path 3: Cleanup Worktree (Detailed Workflow)

### Step 1: Verify Safe to Remove

```powershell
cd c:\Work\Copilot-AI\worktrees\[feature-name]

# Check if branch is merged
git branch --merged main | grep feature/[feature-name]

# Expected output: feature/[feature-name] (if merged)
# If not listed, confirm abandonment with developer
```

### Step 2: Present Cleanup Summary

**Decision Template:**

```
=== CLEANUP SUMMARY ===

Feature: [Feature Name]
Branch: feature/[feature-name]
Worktree Path: worktrees/[feature-name]
Status: [Merged | Abandoned | No longer needed]

WHAT WILL BE REMOVED:
- Local worktree directory: worktrees/[feature-name]
- Local branch: feature/[feature-name]
- Remote branch: origin/feature/[feature-name] (optional)

WHAT WILL BE PRESERVED:
- All commits are in main branch (if merged)
- Git reflog preserves history for 90 days
- Remote repository still has branch (unless deleted)

⚠️  WARNING: Uncommitted changes will be lost

Current worktree status:
[Show git status output]

CLEANUP OPTIONS:
1. Full cleanup (remove worktree + local branch + remote branch)
2. Remove worktree only (keep branches)
3. Cancel cleanup

Your choice: ___
```

### Step 3: Execute Cleanup

**Option 1: Full Cleanup**

```powershell
# Navigate to main repo
cd c:\Work\Copilot-AI

# Remove worktree
git worktree remove worktrees/[feature-name]

# Remove local branch
git branch -d feature/[feature-name]

# Remove remote branch (if confirmed)
git push origin --delete feature/[feature-name]

# Prune stale worktree metadata
git worktree prune
```

**Option 2: Worktree Only**

```powershell
cd c:\Work\Copilot-AI

# Remove worktree but keep branches
git worktree remove worktrees/[feature-name]

# Branch still available for checkout if needed
git branch -a | grep feature/[feature-name]
```

### Step 4: Verify Cleanup

```powershell
# Verify worktree removed
git worktree list
# Should not show removed worktree

# Verify directory removed
Test-Path c:\Work\Copilot-AI\worktrees\[feature-name]
# Should return: False

# Check branch status (if full cleanup)
git branch -a | grep feature/[feature-name]
# Should return nothing if fully cleaned
```

### Step 5: Cleanup Confirmation

```
✅ CLEANUP SUCCESSFUL

Feature: [Feature Name]
Worktree: worktrees/[feature-name] — REMOVED
Local Branch: feature/[feature-name] — REMOVED
Remote Branch: origin/feature/[feature-name] — REMOVED

DISK SPACE RECOVERED: ~[X] MB

REMAINING WORKTREES:
[List active worktrees]

RECOVERY OPTIONS (if needed):
- Branch can be recovered from reflog for 90 days:
  git reflog show feature/[feature-name]
  git checkout -b feature/[feature-name] [commit-hash]

- Remote branch (if not deleted) can be checked out:
  git checkout -b feature/[feature-name] origin/feature/[feature-name]
```

---

## Decision Matrix

Use this matrix to choose the right path:

| Scenario | Feature Size | Risk Level | Team Size | Recommendation |
|----------|--------------|------------|-----------|----------------|
| Hotfix | Small (<50 lines) | High urgency | Any | **Path 1: Direct Merge** |
| Bug fix | Small (<100 lines) | Low | 1-2 | Path 1 or 2 |
| New feature | Medium (100-500 lines) | Medium | 2+ | **Path 2: Create PR** |
| Major feature | Large (>500 lines) | High | 2+ | **Path 2: Create PR** |
| Architectural change | Any size | High | 2+ | **Path 2: Create PR** |
| Abandoned work | Any | N/A | Any | **Path 3: Cleanup** |
| Post-merge | N/A | N/A | Any | **Path 3: Cleanup** |

---

## Rollback Procedures

### If Merge to Main Causes Issues

```powershell
cd c:\Work\Copilot-AI
git checkout main

# Option 1: Revert the merge commit
git revert -m 1 HEAD
git push origin main

# Option 2: Reset to previous commit (DANGEROUS — coordinate with team)
git reset --hard HEAD~1
git push --force origin main

# Option 3: Create hotfix branch to address issue
git checkout -b hotfix/fix-merge-issue
# Make fixes
git commit -m "hotfix: resolve merge issues"
git push origin hotfix/fix-merge-issue
# Create PR or merge
```

### If PR Needs Major Changes

```powershell
# Return to worktree
cd c:\Work\Copilot-AI\worktrees\[feature-name]

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "fix: address PR feedback - [description]"

# Push to update PR
git push origin feature/[feature-name]

# PR automatically updates
```

### If Cleanup Was Accidental

```powershell
cd c:\Work\Copilot-AI

# Find commit hash from reflog
git reflog | grep feature/[feature-name]

# Recreate branch
git checkout -b feature/[feature-name] [commit-hash]

# Recreate worktree
git worktree add worktrees/[feature-name] feature/[feature-name]

# Verify recovery
cd worktrees/[feature-name]
git log --oneline -5
```

---

## Post-Completion Tasks

### After Successful Merge

**1. Update Documentation:**
```powershell
# Update changelog
Add-Content -Path CHANGELOG.md -Value @"

## [Version] - $(Get-Date -Format "yyyy-MM-dd")

### Added
- Patient Management CRUD functionality
- Search with name/phone indexing

"@

git add CHANGELOG.md
git commit -m "docs: update changelog for patient management"
git push origin main
```

**2. Tag Release (if applicable):**
```powershell
git tag -a v1.1.0-patient-mgmt -m "Release: Patient Management feature"
git push origin v1.1.0-patient-mgmt
```

**3. Notify Team:**
```
Subject: ✅ Feature Merged: Patient Management

Team,

The Patient Management feature has been successfully merged to main.

- Feature: Patient CRUD + Search
- Merge Commit: abc123def
- Files Changed: 15
- Tests: 52 passing
- Coverage: 87%

Next Steps:
- Merge available for other features via rebase
- CI/CD pipeline deploying to staging
- QA testing can begin

Thanks!
```

**4. Update Project Board:**
- Move ticket from "In Review" → "Done"
- Add merge commit reference
- Close related GitHub issues

### After PR Created

**1. Monitor CI Pipeline:**
```powershell
# Check PR status via GitHub CLI
gh pr status

# View CI checks
gh pr checks
```

**2. Respond to Feedback Promptly:**
- Review comments within 24 hours
- Address blocking feedback immediately
- Update PR with fixes

**3. Merge After Approval:**
```powershell
# Via GitHub CLI
gh pr merge [PR-number] --squash --delete-branch

# Or via web UI
# Click "Squash and merge" button
# Delete branch after merge
```

### After Cleanup

**1. Document Cleanup:**
Update project notes:
```
Worktree Cleanup Log:
- 2026-05-07: Removed worktrees/patient-management (merged to main)
- Branch: feature/patient-management (deleted)
```

**2. Verify No Dangling References:**
```powershell
# Check for orphaned worktrees
git worktree list

# Prune if needed
git worktree prune
```

---

## Common Issues & Solutions

### Issue 1: Uncommitted Changes Block Merge

**Error:**
```
error: Your local changes to the following files would be overwritten by merge:
	[file-list]
Please commit your changes or stash them before you merge.
```

**Solution:**
```powershell
# Option A: Commit changes
git add .
git commit -m "chore: save work in progress"

# Option B: Stash changes
git stash save "WIP before merge"
# After merge:
git stash pop
```

---

### Issue 2: Merge Conflicts

**Error:**
```
CONFLICT (content): Merge conflict in [file]
Automatic merge failed; fix conflicts and then commit the result.
```

**Solution:**
```powershell
# View conflicted files
git status

# Edit files to resolve conflicts
# Look for markers: <<<<<<<, =======, >>>>>>>

# Mark as resolved
git add [resolved-files]

# Complete merge
git commit -m "merge: resolve conflicts in [files]"
```

---

### Issue 3: Branch Behind Main

**Error:**
```
Your branch is behind 'origin/main' by 5 commits
```

**Solution:**
```powershell
# Rebase on main
git fetch origin main
git rebase origin/main

# If conflicts, resolve and continue
git rebase --continue

# Force push (if already pushed)
git push --force-with-lease origin feature/[feature-name]
```

---

### Issue 4: Cannot Remove Worktree

**Error:**
```
fatal: 'worktrees/[name]' contains modified or untracked files
```

**Solution:**
```powershell
# Option A: Force remove (lose changes)
git worktree remove --force worktrees/[feature-name]

# Option B: Save changes first
cd worktrees/[feature-name]
git stash save "Cleanup stash"
cd c:\Work\Copilot-AI
git worktree remove worktrees/[feature-name]
# Changes preserved in stash
```

---

### Issue 5: PR Merge Blocked by CI

**Error:**
```
Required status checks must pass before merging
```

**Solution:**
```powershell
# Check CI logs
gh pr checks [PR-number]

# View detailed logs
gh pr view [PR-number] --web
# Navigate to "Checks" tab

# Fix failing tests
cd worktrees/[feature-name]
# Fix issues
git commit -am "fix: resolve CI failures"
git push origin feature/[feature-name]

# CI re-runs automatically
```

---

## Finishing Agent Checklist

Use this checklist for every finishing operation:

### Pre-Finishing Verification

- [ ] **All Quality Gates Passed**
  - [ ] Verification Agent: ✅ APPROVED
  - [ ] Gap Analysis: Score ≥95/100
  - [ ] Code Review: ✅ APPROVED or feedback addressed
  
- [ ] **Git Status Clean**
  - [ ] No uncommitted changes
  - [ ] No untracked files (or intentionally ignored)
  
- [ ] **Branch Synced**
  - [ ] Rebased on latest main
  - [ ] No merge conflicts
  - [ ] Pushed to remote
  
- [ ] **Tests Passing**
  - [ ] Unit tests: ✅
  - [ ] Integration tests: ✅
  - [ ] E2E tests: ✅
  - [ ] Coverage ≥80%

### Decision Documentation

- [ ] **Changes Summarized**
  - [ ] Files changed count
  - [ ] Lines added/removed
  - [ ] Commit count
  - [ ] Impact assessment
  
- [ ] **Path Selected**
  - [ ] Merge to Main
  - [ ] Create PR
  - [ ] Cleanup Worktree
  - [ ] Rationale documented

### Execution

- [ ] **Pre-flight Checks**
  - [ ] Main branch up-to-date
  - [ ] No local conflicts
  - [ ] Backup plan identified
  
- [ ] **Operation Completed**
  - [ ] Commands executed successfully
  - [ ] No errors reported
  - [ ] Confirmation received
  
- [ ] **Verification**
  - [ ] Changes visible in main (if merged)
  - [ ] PR created with correct details (if PR)
  - [ ] Worktree removed (if cleanup)

### Post-Completion

- [ ] **Documentation Updated**
  - [ ] Changelog updated (if merged)
  - [ ] Release tagged (if applicable)
  - [ ] Team notified
  
- [ ] **Dependent Work Updated**
  - [ ] Other worktrees rebased on new main
  - [ ] No broken dependencies
  
- [ ] **Confirmation Report Sent**
  - [ ] Merge commit hash (if merged)
  - [ ] PR URL (if PR created)
  - [ ] Cleanup confirmation (if removed)
  - [ ] Next steps documented

---

## Success Metrics

The Finishing Agent succeeds when:

✅ **Clear Communication:** Developer understands all three options and consequences  
✅ **Safe Execution:** No data loss, no broken builds, reversible operations  
✅ **Complete Documentation:** Evidence of what was done and why  
✅ **Team Visibility:** Appropriate stakeholders notified of completion  
✅ **Clean State:** Repository and worktrees in healthy, organized state  

---

## Appendix A: Command Reference

### Quick Merge to Main

```powershell
cd c:\Work\Copilot-AI
git checkout main
git pull origin main
git merge --no-ff feature/[name] -m "feat: [description]"
git push origin main
```

### Quick PR Creation

```powershell
cd worktrees/[feature-name]
gh pr create --title "feat: [description]" --body "[details]" --base main
```

### Quick Cleanup

```powershell
cd c:\Work\Copilot-AI
git worktree remove worktrees/[name]
git branch -d feature/[name]
git push origin --delete feature/[name]
```

### Check All Worktrees

```powershell
git worktree list
```

### View Merge Preview

```powershell
cd worktrees/[feature-name]
git diff --stat origin/main
git log --oneline origin/main..HEAD
```

---

## Appendix B: PR Template

Save to `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Feature: [Name]

### Summary
[Brief description of what this PR does]

### Implementation
**Backend:**
- [ ] [Key component 1]
- [ ] [Key component 2]

**Frontend:**
- [ ] [Key component 1]
- [ ] [Key component 2]

### Testing
- Coverage: X%
- Unit tests: X passing
- Integration tests: X passing
- E2E tests: X passing

### Quality Gates
- [ ] Verification: Approved
- [ ] Gap Analysis: X/100
- [ ] Code Review: Approved

### BRD Requirements Met
- [ ] [Requirement 1]
- [ ] [Requirement 2]

### Files Changed
[Summary of files added/modified/deleted]

### Breaking Changes
[None or describe]

### Deployment Notes
[Migration commands, env vars, etc.]

### Screenshots
[If applicable]
```

---

## Document Control

**Version:** 1.0  
**Author:** Finishing Agent  
**Review Status:** Ready for Team Use  
**Next Review Date:** After first production deployment

---

**END OF FINISHING AGENT GUIDE**
