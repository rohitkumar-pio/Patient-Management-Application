# Team of Agents for BRD-Driven Development

This document describes the complete team of specialized agents designed to take a BRD (Business Requirements Document) from initial exploration through production deployment.

## Overview

The eight-agent workflow transforms requirements into working, tested, reviewed, and deployed code with full traceability back to the original BRD.

```
┌─────────────────────────────────────────────────────────────────┐
│                     BRD Input                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  🧠 Brain-Storming Agent     │
        │  Explore & Clarify           │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  📋 Planning Agent           │
        │  Create Roadmap              │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  🌳 Worktree Agent           │
        │  Isolate Environment         │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  🚀 Implementation Agent     │
        │  Code & Tests                │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  🔍 Code Review Agent        │
        │  Quality Gate                │
        └──────────────┬───────────────┘
                       │
                ┌──────┴─────────┐
                │                │
              PASS            ISSUES?
                │                │
                │                └──────┐
                │                       │
                ▼                       ▼
        ┌──────────────┐       Fix & Re-review
        │  ✅ Verify   │
        │  Test Gate   │
        └──────┬───────┘
               │
         ┌─────┴─────┐
       PASS        FAIL
         │            │
         │            └──────┐
         │                   │
         ▼                   ▼
    ┌─────────────┐    Fix Issues
    │  📊 Gap     │
    │  Analysis   │
    └──────┬──────┘
           │
    ┌──────┴──────────┐
  < 95%            ≥ 95%
    │                │
    └────┐           │
         │           ▼
    ┌────────────┐   ┌──────────────┐
    │ Re-Plan/  │   │  🎯 Finishing │
    │ Implement │   │  Merge/PR     │
    └────────────┘   └──────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ Production Ready │
                    └──────────────────┘
```

---

## Agents Overview

### 1. 🧠 Brain-Storming Agent
**Primary Role:** Requirements exploration and team discussion

**What It Does:**
- Explores intent, requirements, and constraints before coding
- Facilitates discovery of scope and design options
- Identifies assumptions, risks, and unknowns
- Clarifies BRD ambiguities through structured questioning
- Documents decisions and scope boundaries

**When to Use:**
- Starting a new feature or project
- Requirements are unclear or ambiguous
- Need cross-functional alignment on scope
- Before planning or architecture begins

**Tool Preferences:**
- Conversational only (no file modifications)
- Asks clarifying questions
- Uncovers hidden requirements

**Typical Input:** Raw BRD or feature description

**Typical Output:** 
- Clarified requirements
- Design options explored
- Scope and constraints documented
- Ready for Planning Agent

**Example Prompts:**
- "Let's brainstorm the backend architecture for user authentication"
- "Explore the scope and constraints for this payment integration"
- "What design options exist for this data modeling problem?"

---

### 2. 📋 Planning Agent
**Primary Role:** Detailed implementation roadmap creation

**What It Does:**
- Breaks requirements into concrete, sequential steps
- Specifies exact files and modules to create/modify
- Designs comprehensive testing strategies
- Identifies dependencies and integration points
- Estimates effort and identifies risks
- Produces execution checklist for developers

**When to Use:**
- After requirements are clarified by Brain-Storming
- Before Implementation Agent begins coding
- To establish shared understanding of "how" to build

**Tool Preferences:**
- File search and reading for context
- Codebase exploration
- No file modifications

**Typical Input:**
- Clarified requirements from Brain-Storming
- Existing architecture/tech stack
- Design decisions

**Typical Output:**
- Phase-by-phase implementation steps
- File targets and module specifications
- Complete test strategy (unit/integration/e2e)
- Risk analysis and effort estimates

**Example Prompts:**
- "Create an implementation plan with file targets for this feature"
- "Given this design, break it into executable phases"
- "Plan the testing strategy—what tests do we need?"

---

### 3. 🌳 Worktree Agent
**Primary Role:** Git workflow and environment isolation

**What It Does:**
- Creates isolated git worktrees for feature development
- Validates git state before setup (no uncommitted changes)
- Enforces clean branch naming conventions
- Provides worktree switch/sync/cleanup commands
- Documents team coordination procedures
- Ensures work doesn't interfere with main branch

**When to Use:**
- Ready to start implementation after planning
- Multiple features in parallel development
- Need isolation from main branch

**Tool Preferences:**
- Git commands (create, list, remove worktrees)
- Terminal access for validation and cleanup

**Typical Input:**
- Feature name or BRD identifier
- Branch naming preferences

**Typical Output:**
- Worktree path
- Branch name
- Ready-to-run commands (switch, sync, cleanup)

**Example Prompts:**
- "Create a worktree for the user authentication feature"
- "Set up an isolated environment for this bugfix"
- "I need a worktree for the payment integration"

---

### 4. 🚀 Implementation Agent
**Primary Role:** Step-by-step code execution with test coverage

**What It Does:**
- Executes the implementation plan phase by phase
- Writes production code with proper structure
- Creates unit, integration, and e2e tests alongside code
- Tracks progress transparently with todo lists
- Runs tests and validates execution
- Diagnoses blockers; escalates ambiguities

**When to Use:**
- Development phase begins with clear plan
- Need production-ready code with full test coverage
- Want transparent, tracked progress

**Tool Preferences:**
- File creation and editing
- Running tests and commands
- Todo list tracking
- Semantic/grep search for codebase context

**Typical Input:**
- Implementation plan from Planning Agent
- Worktree setup from Worktree Agent
- Tests from plan

**Typical Output:**
- Working code with full test coverage
- Test execution results
- Progress tracked in todo lists

**Example Prompts:**
- "Execute phase 1 from the plan—the data model setup"
- "Create all API endpoints with tests step by step"
- "Implement this feature with full test coverage"

---

### 5. 🔍 Code Review Agent
**Primary Role:** Quality, correctness, and consistency validation

**What It Does:**
- Reviews code for quality, correctness, and consistency
- Classifies issues by severity (Critical/High/Medium/Low)
- Provides file-specific, actionable feedback
- Issues APPROVE/REQUEST CHANGES verdicts
- Blocks approval until critical issues resolved
- Suggests specific improvements with examples

**When to Use:**
- After Implementation Agent completes coding
- Before Verification and Verification Agents
- Before merging to main

**Tool Preferences:**
- File reading and analysis
- No file modifications (review only)
- Git diff inspection

**Typical Input:**
- Changed files from feature branch
- Original implementation plan (for consistency check)

**Typical Output:**
- Severity-classified issues
- File/line-specific feedback
- APPROVE/REQUEST CHANGES verdict

**Example Prompts:**
- "Review this implementation for quality, correctness, and consistency"
- "Code review before we merge—any issues?"
- "Is this production-ready? What should be fixed?"

---

### 6. ✅ Verification Agent
**Primary Role:** Rigorous test execution and quality gate

**What It Does:**
- Runs comprehensive test suites (unit, integration, e2e)
- Validates code outputs and logs
- Checks code quality metrics
- Analyzes test coverage
- Detects regressions and performance issues
- Blocks progress until all gates pass

**When to Use:**
- After Code Review clears critical issues
- Before Gap Analysis
- Final check before deployment

**Tool Preferences:**
- Running test commands
- Analyzing test output
- Terminal commands for validation

**Typical Input:**
- Feature branch with completed implementation
- Test suite definitions from plan

**Typical Output:**
- Complete test results (pass/fail/skip)
- Coverage analysis
- Performance metrics
- Pass/fail verdict

**Example Prompts:**
- "Run the complete test suite—block if anything fails"
- "Verify all tests pass for this feature"
- "Check coverage and performance before merge"

---

### 7. 📊 Gap Analysis Agent
**Primary Role:** Requirements compliance validation

**What It Does:**
- Maps implementation to original BRD requirements
- Scores coverage with detailed line-by-line analysis
- Identifies gaps preventing 95%+ compliance
- Routes back to Planning/Implementation as needed
- Provides clear remediation paths
- Acts as 95% compliance gate

**When to Use:**
- After Verification Agent passes all tests
- Before Finishing Agent for final handoff
- To ensure no requirements were missed

**Tool Preferences:**
- File reading and analysis
- Semantic search for requirement mapping
- No file modifications

**Typical Input:**
- Original BRD
- Completed implementation
- Plan and design decisions

**Typical Output:**
- Requirements coverage score
- Met requirements (with evidence)
- Unmet/partial requirements (gaps)
- Recommended fixes to reach 95%+
- PASS (≥95%) or LOOP BACK (<95%) verdict

**Example Prompts:**
- "Score this implementation against the BRD"
- "We have 87% coverage—what's missing to reach 95%?"
- "Map the feature to the original requirements"

---

### 8. 🎯 Finishing Agent
**Primary Role:** Final orchestration: merge, PR, or cleanup

**What It Does:**
- Guides merge vs. pull request decision
- Executes direct merges for small, trusted changes
- Creates pull requests with clear descriptions
- Orchestrates safe worktree cleanup
- Performs safety checks (no uncommitted changes, main up-to-date)
- Provides merge confirmation and PR links

**When to Use:**
- After all gates pass (Review, Verify, Gap Analysis)
- Ready for deployment or team review
- Final step before production

**Tool Preferences:**
- Git commands (merge, fetch, branch management)
- Worktree cleanup operations
- Pull request creation

**Typical Input:**
- Feature branch ready for integration
- Merge preferences (direct vs. PR)
- PR description

**Typical Output:**
- Merge confirmation with hash
- PR link and reviewers assigned
- Worktree cleanup confirmation
- Deployment ready status

**Example Prompts:**
- "Merge this feature to main"
- "Create a pull request for team review"
- "Clean up the worktree after merge"

---

## Complete Workflow Guide

### Typical Feature Flow

#### Phase 1: Discovery (Brain-Storming + Planning)
```
BRD Available
    ↓
Run: / → Brain-Storming Agent
- Explore requirements
- Clarify scope and constraints
- Identify design options
- Document decisions
    ↓
Run: / → Planning Agent
- Create implementation roadmap
- Define file targets
- Design test strategy
- Estimate effort
```

#### Phase 2: Development (Worktree + Implementation)
```
Plan Ready
    ↓
Run: / → Worktree Agent
- Create isolated git worktree
- Get branch name and path
    ↓
Run: / → Implementation Agent
- Execute plan step by step
- Write code and tests
- Track progress
- Run tests after each phase
```

#### Phase 3: Quality Gates (Code Review → Verify → Gap Analysis)
```
Implementation Complete
    ↓
Run: / → Code Review Agent
  → Issues found? Fix and re-review
    ↓
Run: / → Verification Agent
  → Tests fail? Fix and re-verify
    ↓
Run: / → Gap Analysis Agent
  → < 95% coverage? Re-plan and implement
  → ≥ 95% coverage? Continue
```

#### Phase 4: Handoff (Finishing)
```
All Gates Passed
    ↓
Run: / → Finishing Agent
- Choose: Merge or Pull Request
- Execute merge or create PR
- Clean up worktree
- Deployment ready
```

---

## Best Practices

### 1. Sequential Workflow
Follow the order strictly:
1. Brain-Storming (clarify)
2. Planning (roadmap)
3. Worktree (isolate)
4. Implementation (build)
5. Code Review (quality)
6. Verification (tests)
7. Gap Analysis (compliance)
8. Finishing (deploy)

### 2. Feedback Loops
- **Code Review Issues** → Fix and re-review
- **Test Failures** → Fix and re-verify
- **Gap Analysis < 95%** → Return to Planning/Implementation

### 3. Agent Communication
- Each agent's output becomes the next agent's input
- Preserve context across agents (paste outputs as needed)
- Use agent-specific prompts for clarity

### 4. Documentation
- Save planning outputs for reference
- Keep test results and coverage reports
- Archive gap analysis scores
- Document merge confirmations

---

## Troubleshooting

### Agent Not Found
- Verify agents are in `.github/agents/` directory
- Reload VS Code or restart copilot chat
- Check file names match exactly (e.g., `brainstormer.agent.md`)

### Lost Progress Between Agents
- Copy/paste agent outputs when moving to the next agent
- Use `/` to switch agents mid-conversation
- Maintain a session note with key decisions

### Merge Conflicts
- Worktree Agent handles isolation; verify main is clean
- Code Review and Verification may need re-run after fixes
- Finishing Agent provides conflict detection

---

## Examples

### Example 1: New Feature
```
1. Paste BRD → Brain-Storming Agent
2. Copy clarified requirements → Planning Agent
3. Copy plan → Worktree Agent (create worktree)
4. Copy worktree path → Implementation Agent
5. After implementation → Code Review Agent
6. After review fixes → Verification Agent
7. After tests pass → Gap Analysis Agent
8. If ≥ 95% → Finishing Agent
```

### Example 2: Bug Fix
```
1. Short description → Brain-Storming Agent
2. Quick decisions → Planning Agent
3. Create worktree → Worktree Agent
4. Implement fix → Implementation Agent
5. Code review → Code Review Agent
6. Verify tests → Verification Agent (may skip Gap Analysis for small fixes)
7. Merge → Finishing Agent
```

### Example 3: Gap Found
```
Gap Analysis shows 87% coverage
    ↓
Copy gap report → Planning Agent
"What steps do we need to add to fix these gaps?"
    ↓
Copy updated plan → Implementation Agent
"Execute the remediation steps"
    ↓
Re-run: Code Review → Verify → Gap Analysis
    ↓
≥ 95%? → Proceed to Finishing Agent
```

---

## Customization

Each agent can be customized for your team's specific needs:
- Modify severity classifications in Code Review Agent
- Adjust test strategy in Planning Agent
- Add custom validation rules in Verification Agent
- Update compliance threshold in Gap Analysis Agent

See individual `.agent.md` files in `.github/agents/` for customization details.
