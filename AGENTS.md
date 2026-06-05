# AGENTS.md

## Project Mission

This project exists to help people access information and services easily.

For this project:

* Accessibility is a core requirement.
* Clarity is more important than visual complexity.
* Usability is more important than technical sophistication.
* Mobile experience is a first-class requirement.

Every decision should reduce friction for end users.

---

## This Is NOT The Framework You Know

Before writing code:

1. Read package.json.
2. Check installed framework versions.
3. Check existing project structure.
4. Follow project conventions.
5. Respect deprecations.

Never assume APIs based on training data.

---

## Think Before Coding

Before implementation:

### Explain

* What problem is being solved.
* What files are affected.
* What risks exist.

### Plan

* Proposed solution.
* Alternative approaches.
* Why the chosen solution is preferred.

Only then begin implementation.

---

## Search Before Building

Before creating:

* Components
* Hooks
* Utilities
* Helpers
* Types

Search the codebase first.

Prefer reuse over creation.

Do not duplicate functionality.

---

## Respect Existing Architecture

Do not introduce:

* New libraries
* New patterns
* New architectural approaches

Unless there is a clear justification.

Always work with the existing architecture first.

---

## Accessibility First

Every UI change must be reviewed for:

### Keyboard Navigation

* Tab navigation works.
* Focus states are visible.
* No keyboard traps.

### Screen Readers

* Proper labels.
* Semantic HTML.
* Accessible names.

### Visual Accessibility

* Adequate contrast.
* Responsive design.
* Readable font sizes.

Accessibility is not optional.

---

## UX Before Aesthetics

When designing interfaces:

Prioritize:

1. Clarity
2. Simplicity
3. Accessibility
4. Consistency
5. Visual appeal

Avoid:

* Fancy animations without purpose.
* Hidden actions.
* Confusing navigation.
* Overloaded screens.

---

## Security First

Treat all user input as untrusted.

Review:

* Authentication
* Authorization
* Validation
* Database access
* Environment variables

Never expose secrets.

Never trust client-side validation alone.

---

## Supabase Rules

Before database changes:

* Check existing schema.
* Check RLS policies.
* Check relationships.
* Avoid breaking migrations.

Every database modification must explain:

* Impact
* Risks
* Rollback strategy

---

## React & Next.js Rules

Prefer:

* Server Components when appropriate.
* Small reusable components.
* Composition over complexity.

Avoid:

* Giant components.
* Unnecessary state.
* Deep prop drilling.

Keep components focused on a single responsibility.

---

## Code Quality Standards

Code must be:

* Readable
* Predictable
* Maintainable

Prioritize clarity over cleverness.

Avoid premature optimization.

---

## Educational Mode

The developer is learning.

When proposing solutions:

* Explain advanced concepts.
* Explain why patterns are used.
* Mention simpler alternatives.
* Teach while implementing.

Do not assume expert-level knowledge.

---

## Debugging Process

When fixing bugs:

1. Identify root cause.
2. Explain root cause.
3. Propose fix.
4. Explain why fix works.
5. Suggest verification steps.

Never patch symptoms without understanding the cause.

---

## Project Context

Current project priorities:

1. Accessibility
2. User experience
3. Reliability
4. Maintainability
5. Performance

When tradeoffs exist:

Accessibility wins.
Usability wins.
Maintainability wins.

---

## Response Format

For medium or large changes:

### Analysis

What is happening?

### Plan

What will be done?

### Implementation

What changed?

### Verification

How can it be tested?

Do not skip reasoning.
