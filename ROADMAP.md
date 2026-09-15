# AntigleForge — Future Tools Research, Planning & Development

You are working on **AntigleForge**, a Minecraft tools website.

Website:
`https://antigleforge.pages.dev`

Your job is to help plan, research, implement, test, optimize, and continuously expand the website with **high-quality, genuinely useful Minecraft tools**.

---

# 1. CURRENT STATE

The website UI/design is already built.

The following tools are already implemented:

1. Shape Generator
2. UUID Generator
3. Command Generator

Do **not** redesign or rebuild these existing tools as part of this task.

The owner will separately tell you what changes, fixes, or improvements are required for existing tools.

Your primary responsibility here is:

> **Research and plan the next generation of NEW AntigleForge tools, then implement them strictly one at a time.**

---

# 2. CORE PRODUCT DIRECTION

AntigleForge should become a useful collection of Minecraft tools rather than a random collection of generators.

The philosophy is:

> If a tool solves a real Minecraft problem, saves meaningful time, is reasonably reusable, and provides a better/easier experience than existing alternatives, it belongs in consideration.

Do not add tools merely because they are technically interesting.

Prioritize:

* Real usefulness
* Frequent/repeat usage
* Problem severity
* Time saved
* Mobile usability
* Bedrock compatibility
* Simplicity for non-developers
* Helpfulness for creators
* Helpfulness for addon/resource-pack creators when appropriate
* Developer productivity where a tool can simplify difficult work
* Uniqueness / competitive gap
* Reasonable implementation complexity

---

# 3. PLATFORM PRIORITY

## Primary platform

**Minecraft Bedrock Edition**

Especially:

* Android
* Mobile browsers
* Non-developer Minecraft players
* Creators
* Builders
* Addon/resource-pack creators
* Technical Minecraft players

## Java Edition

Java is **secondary**.

Only consider Java tools when they are:

* genuinely useful,
* reasonably easy to implement,
* or provide significant value without distracting from the Bedrock-first roadmap.

Do NOT force Java support just to claim that a tool supports both editions.

---

# 4. AUDIENCE

AntigleForge is for a **mixed Minecraft audience**.

Primary:

* Normal Minecraft players
* Bedrock/Android users
* Beginners
* Builders
* Players who need quick utilities

Secondary:

* Content creators
* Map makers
* Addon creators
* Resource-pack creators
* Technical Minecraft users
* Developers

Do not assume that every user knows:

* JSON
* JavaScript
* commands
* scripting
* resource-pack structure
* addon architecture
* Git
* programming concepts

When a technical tool is useful, its UX should simplify the technical complexity.

---

# 5. TOOL DISCOVERY MUST BE RESEARCH-DRIVEN

Before proposing a serious new tool, conduct broad public research.

Do NOT rely only on your own assumptions.

Research sources should include, where relevant:

* Reddit
* Minecraft community discussions
* Minecraft forums
* GitHub issues/discussions
* Public Discord discussions if indexed/searchable
* YouTube videos
* YouTube comments
* Existing Minecraft tools
* Existing tool reviews
* Search results
* Search trends / commonly searched problems
* Community tutorials
* Stack Overflow / technical discussions where relevant
* Bedrock documentation
* Minecraft Wiki / official documentation where appropriate
* Existing open-source projects

### IMPORTANT: Reddit

Treat Reddit as a particularly valuable source of real-world pain points.

Look for:

* Repeated questions
* People asking for tools
* People complaining about difficult workflows
* Manual processes people repeatedly perform
* Existing tools people dislike
* Missing functionality
* Workarounds
* "Is there a tool for this?" posts
* "How do I..." questions
* Frequently repeated beginner problems

Reddit is a **signal source**, not absolute truth.

Cross-check important claims with other sources.

---

# 6. RESEARCH OBJECTIVE

Research should answer:

1. What problem does this tool solve?
2. Who experiences this problem?
3. How often does it happen?
4. How painful/time-consuming is the current process?
5. What do users currently do instead?
6. Are existing tools available?
7. What do users dislike about existing solutions?
8. Can AntigleForge make the workflow significantly easier?
9. Is the problem particularly relevant to Bedrock/mobile users?
10. Can the tool run entirely in the browser?
11. Can it work without a backend?
12. Can it work without storing user data?
13. Is the implementation realistic?
14. What edge cases exist?
15. What security/abuse risks exist?
16. What performance risks exist on low-end Android devices?
17. Is this tool worth building now?

---

# 7. TOOL RANKING

Do not choose tools randomly.

Rank candidates using a combination of:

* Demand
* Problem severity
* Repeat usage
* Mobile usefulness
* Bedrock relevance
* Implementation effort
* Performance cost
* Uniqueness
* Competitive gap
* Potential to expand into related tools

A simple conceptual scoring model can be used:

```js
score =
  demand +
  problemSeverity +
  repeatUsage +
  bedrockRelevance +
  uniqueness +
  mobileValue -
  implementationComplexity -
  performanceRisk;
```

The exact scoring methodology can be improved if research suggests a better approach.

The purpose is not mathematical perfection.

The purpose is to prevent:

> "This tool sounds cool, therefore let's build it."

---

# 8. FIRST TARGET: ABOUT 10 STRONG NEW TOOLS

Research and identify approximately **10 strong new tools** for the initial expansion.

Do not artificially stop at exactly 10 if research strongly suggests a better candidate.

Likewise, do not fill the list with weak ideas just to reach 10.

After the first group is built, use:

* real usage,
* feedback,
* analytics if eventually added in a privacy-safe way,
* search demand,
* community requests,
* bug reports,

to determine future expansion.

---

# 9. CREATIVE TOOL DISCOVERY

Do not restrict research to obvious tools.

Explore creative/unique ideas aggressively.

However, every creative idea must still pass the usefulness test.

Good:

> A new workflow that removes a genuinely annoying Minecraft task.

Bad:

> A technically impressive generator that almost nobody needs.

Search for opportunities where:

* Existing tools are confusing
* Existing tools are desktop-oriented
* Existing tools do not work well on mobile
* Existing tools require unnecessary manual steps
* Bedrock users lack good tooling
* A common Minecraft workflow can be reduced from 10 steps to 2–3
* Several existing tools could be combined into a better workflow
* A tool can provide useful validation/preview/explanation
* Beginners struggle with something that could be automated

---

# 10. FULL SPECIFICATION REQUIRED FOR EVERY SELECTED TOOL

For every tool selected for implementation, create a complete specification containing:

## Problem

What exact problem does the tool solve?

## Evidence

What research supports the need?

Include relevant sources/findings rather than unsupported claims.

## Target Users

Who benefits most?

## Use Cases

Show realistic scenarios.

## Core Features

What must the first version contain?

## Optional Features

What can wait for later?

## UX Flow

Explain:

```text
User opens tool
        ↓
Inputs information
        ↓
Tool validates input
        ↓
Processing
        ↓
Preview/result
        ↓
Copy / Download / Export
```

Adapt this flow to the actual tool.

## Technical Approach

Explain the implementation approach.

## Dependencies

Only use dependencies when they provide meaningful value.

## Compatibility

Target modern major browsers:

* Chrome / Chromium
* Edge
* Firefox
* Safari

Use capability detection and graceful fallbacks where browser APIs differ.

Example:

```js
if ("someBrowserFeature" in window) {
  useEnhancedImplementation();
} else {
  useFallbackImplementation();
}
```

Do not make unsupported browser APIs a hard requirement unless absolutely necessary.

## Minecraft Compatibility

Default to the latest stable Minecraft version.

When version differences matter:

* show a version selector,
* compatibility information,
* or appropriate warnings.

Do not pretend that one format/behavior works identically across every Minecraft version.

## Edge Cases

List and test unusual inputs.

## Performance Risks

Identify:

* CPU-heavy operations
* memory-heavy operations
* large files
* large generated structures
* expensive rendering
* animations
* repeated processing

## Security / Abuse Risks

Identify malicious or pathological input cases.

## Testing Plan

Define how the completed tool will be tested.

## Priority

Explain why the tool should be built now rather than later.

## Future Improvements

List possible v2/v3 improvements separately from the MVP.

---

# 11. DEVELOPMENT ORDER — STRICT ONE TOOL AT A TIME

This is extremely important.

Do NOT implement multiple new tools simultaneously.

The workflow is:

```text
Research
   ↓
Tool Selection
   ↓
Complete Tool Specification
   ↓
UI/UX Plan
   ↓
Implementation
   ↓
AI Functional Testing
   ↓
Fix ALL discovered functional issues
   ↓
Functional Verification Pass
   ↓
Performance Testing
   ↓
Security / Abuse / Crash Testing
   ↓
Mobile Testing
   ↓
Final Verification
   ↓
Only THEN start the next tool
```

Never move to the next tool simply because the current tool "mostly works."

---

# 12. UI/UX REQUIREMENTS

The existing AntigleForge visual language should be respected.

Do not randomly redesign the whole website while adding tools.

New tools should:

* feel native to AntigleForge,
* work well on phones,
* prioritize simplicity,
* minimize unnecessary UI,
* provide clear feedback,
* avoid confusing technical terminology where possible,
* provide helpful validation,
* make important actions obvious.

Mobile is especially important.

Priority:

> Ease of use first, then UX + performance together.

Design for touch interaction.

Avoid tiny controls.

Avoid unnecessary modal dialogs.

Avoid excessive animations.

---

# 13. SEARCH AND TOOL DISCOVERY

Eventually AntigleForge may contain many tools.

Tool discovery should use:

* Categories
* Search
* Tags
* Smart filters

Useful filters can include:

* Bedrock
* Java
* Beginner
* Advanced
* Builder
* Creator
* Developer
* Utility
* Generator
* Converter
* Analyzer
* File Tool

Search should be entirely client-side.

Use:

* keyword matching,
* tags,
* descriptions,
* synonyms,
* typo tolerance,
* related-tool suggestions.

Example:

```js
const synonyms = {
  circle: ["round", "circular", "oval"],
  uuid: ["identifier", "unique id"],
  command: ["mc command", "minecraft command"]
};
```

A search for:

```text
circel
```

should ideally still find:

```text
Shape Generator
```

Natural-language AI search is NOT required.

Do not introduce paid AI APIs merely to make search smarter.

---

# 14. ARCHITECTURE PRINCIPLE

Use **pragmatic reuse**.

Reuse common functionality when it actually provides value.

Examples:

* Clipboard utilities
* Input validation
* File reading
* File download
* Error handling
* Formatting
* Version metadata
* Search/indexing
* Performance monitoring

Example:

```js
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
```

Do not create huge abstraction layers merely for theoretical cleanliness.

Do not unnecessarily change existing filenames or architecture.

Preserve working functionality.

---

# 15. DATA AND MINECRAFT KNOWLEDGE

Prefer **static local data** when a tool needs Minecraft knowledge.

Data should be:

* bundled with the website,
* maintained during development,
* sourced from reliable references,
* version-aware where required.

Do not make runtime requests to a backend just to obtain basic static Minecraft data unless there is a strong technical reason.

---

# 16. ZERO PERSISTENT USER DATA

This is a strict privacy requirement.

AntigleForge should have **no persistent storage of user-generated tool data**.

Do NOT use:

* localStorage
* sessionStorage
* IndexedDB
* cookies for tool data
* databases
* backend user storage
* cloud file uploads
* persistent generated-data caches

User data should exist only temporarily in browser memory while the page is active.

Example:

```js
let currentToolData = null;
```

When the page is refreshed:

> Everything resets.

Inputs, generated results, uploaded files, etc. should not return automatically.

Files uploaded by the user must be processed client-side whenever technically possible.

If the user downloads a generated file, that file naturally remains on their own device. AntigleForge must not retain a copy.

---

# 17. REFRESH BEHAVIOR

Every refresh must produce a clean state.

Example:

```text
Before refresh:
Input → uploaded file → generated result

Refresh

After refresh:
Empty tool
No previous input
No previous generated data
No uploaded file
```

Do not implement persistence simply for convenience.

Privacy-by-design is more important.

---

# 18. PERFORMANCE SYSTEM

AntigleForge needs an **adaptive resilience system**, not merely an FPS threshold.

The system should consider multiple reliable browser/runtime signals such as:

* frame rate/frame time,
* responsiveness,
* current workload,
* rendering complexity,
* active tool workload,
* heavy operations,
* browser-exposed resource-pressure signals where reliable.

Do NOT pretend the browser can universally read exact operating-system RAM usage.

For example, do not build fake logic such as:

```js
const systemRamUsage = getExactWindowsRamUsage();
```

when such information is not reliably available to normal web pages.

Instead, use reliable browser capabilities and observable runtime behavior.

---

# 19. /mode ROUTE

Provide a dedicated:

```text
/mode
```

route/page.

The user should be able to open `/mode` and choose their mode.

Do not create routes such as:

```text
/mode performance
```

or similar invalid route concepts.

---

# 20. VISUAL MODE / PERFORMANCE MODE

There are two modes.

## Visual Mode (VM)

Default mode for a first-time visit.

Provides the intended full visual experience.

## Performance Mode (PM)

Reduces unnecessary visual workload.

Possible reductions include:

* animations,
* transitions,
* decorative effects,
* shadows,
* particles,
* expensive visual effects,
* unnecessary background rendering.

Important:

> Performance Mode must NOT break important tool functionality.

---

# 21. INITIAL AUTO-DETECTION

On first visit:

```text
Start in Visual Mode
        ↓
Observe actual performance briefly
        ↓
If performance is consistently poor
        ↓
Switch to Performance Mode
```

Do not switch because of one temporary frame drop.

Use sustained degradation.

Conceptually:

```js
if (
  performanceDegraded &&
  degradationDuration >= REQUIRED_DURATION
) {
  switchToPerformanceMode();
}
```

The actual thresholds should be determined through testing rather than arbitrary assumptions.

---

# 22. MODE SWITCHING RULES

## Visual Mode → Performance Mode

Allowed automatically when sustained performance degradation is detected.

## Performance Mode → Visual Mode

**Never automatic in the initial system.**

The user must manually return to Visual Mode through:

```text
/mode
```

If Performance Mode becomes stable:

> Do NOT suggest switching back.

Do NOT show annoying popups such as:

> "Your FPS is stable! Switch back to Visual Mode?"

Do not do this.

---

# 23. MANUAL PERFORMANCE MODE

If the user manually selects Performance Mode:

> Lock Performance Mode.

The adaptive system must not automatically switch them back to Visual Mode.

Only the user can change back to Visual Mode.

The same initial rule applies to automatically triggered Performance Mode:

> Once PM is entered, remain in PM until the user manually selects VM.

---

# 24. ANTI-OSCILLATION

Avoid:

```text
VM → PM → VM → PM → VM
```

because of temporary performance fluctuations.

Use:

* sustained degradation,
* hysteresis where appropriate,
* cooldown periods,
* stable state transitions.

Performance Mode should behave like a safety fallback, not a constantly changing animation.

---

# 25. ACTIVE TOOL DATA MUST SURVIVE MODE CHANGES

Changing:

```text
VM → PM
```

must NOT clear:

* inputs,
* generated results,
* uploaded files,
* selections,
* current tool state.

Example:

```text
User generates result
        ↓
Performance degrades
        ↓
VM → PM
        ↓
Result still exists
```

Never sacrifice active tool data merely to reduce visual workload.

---

# 26. SMART TOOL LIFECYCLE

The website may intelligently reduce resource usage from **inactive/heavy tools** when safe.

For example:

```text
Tool A = currently active
Tool B = inactive
Tool C = inactive
        ↓
Reduce unnecessary work from B/C
        ↓
Keep A fully functional
```

But:

> Never terminate, disable, or destroy an important active tool.

Never lose user state.

If a tool uses expensive resources, prefer safe techniques such as:

* pausing unnecessary rendering,
* stopping unnecessary timers,
* cancelling obsolete work,
* releasing temporary resources,
* lazy-loading heavy modules,
* waking resources only when needed.

Example conceptual lifecycle:

```js
if (!tool.isActive && tool.canSafelyPause) {
  tool.pause();
}

if (toolBecomesActive) {
  tool.resume();
}
```

The actual architecture should be selected based on the tool.

Do not blindly force every tool into the same lifecycle system.

---

# 27. PERFORMANCE REQUIREMENTS FOR EVERY NEW TOOL

Performance testing is mandatory immediately after functional verification.

Test:

* low-end Android
* mobile browsers
* heavy input
* large files
* large generated outputs
* repeated use
* rapid interactions
* rendering load
* memory pressure where observable
* VM → PM transition
* active-state preservation
* sleep/wake behavior
* error recovery

A tool that technically works but makes the website unusably slow is not considered complete.

---

# 28. SECURITY REQUIREMENTS

Use maximum practical browser-side security without unnecessarily restricting legitimate users.

Every tool must be checked for:

* malicious input
* malformed files
* oversized input
* resource exhaustion
* infinite loops
* excessive memory allocation
* unsafe DOM manipulation
* XSS risks
* HTML injection
* dangerous URL handling
* unsafe file processing
* dependency risks
* third-party script risks
* crash resilience

Use safe DOM APIs.

Prefer:

```js
element.textContent = userInput;
```

over unsafe HTML insertion:

```js
element.innerHTML = userInput;
```

unless HTML rendering is genuinely required and properly sanitized.

---

# 29. DEPENDENCY / SUPPLY-CHAIN SECURITY

Do not add dependencies casually.

Before introducing a package:

* verify that it is actually necessary,
* check maintenance status,
* check licensing,
* check known security concerns,
* avoid abandoned libraries when practical,
* prefer lightweight dependencies for mobile performance.

Do not load large libraries for functionality that can reasonably be implemented with native browser APIs.

---

# 30. FILE SECURITY

Tools accepting files must assume files can be:

* malformed,
* unexpectedly large,
* structurally invalid,
* intentionally pathological.

Implement:

* size limits where appropriate,
* type validation,
* parsing validation,
* graceful failure,
* resource limits,
* clear errors.

Never crash the entire website because one uploaded file is invalid.

---

# 31. FUNCTIONAL TESTING

Functional testing is performed by the AI.

Every tool must be tested beyond the happy path.

Test:

### Happy paths

* normal input
* expected output
* copy
* download
* reset

### Edge cases

* empty input
* minimum values
* maximum values
* unusual characters
* invalid formats
* very large input
* repeated actions
* rapid clicking
* unexpected combinations

### Adversarial cases

Try to intentionally break the tool.

Examples:

```text
Huge input
Malformed input
Unexpected Unicode
Extremely long strings
Invalid files
Rapid repeated operations
Boundary values
Unexpected browser states
```

When issues are found:

> Fix them before moving forward.

Do not simply report them and continue.

---

# 32. REAL NON-TECHNICAL USER TESTING

Test workflows as if the user is a normal Minecraft player who does not understand programming.

Ask internally:

* Is the purpose obvious?
* Does the UI explain what to enter?
* Are errors understandable?
* Is the result understandable?
* Can a phone user complete the task without confusion?
* Are technical details hidden unless necessary?
* Can someone complete the task without reading a giant tutorial?

A technically correct tool with confusing UX is not finished.

---

# 33. MOBILE TESTING

AntigleForge must prioritize mobile browsers.

Especially test:

* Android Chrome
* low-end Android hardware
* touch input
* narrow screens
* virtual keyboard
* file picker
* clipboard permissions
* scrolling
* large outputs
* orientation changes where relevant

Controls must remain usable with touch.

---

# 34. BROWSER COMPATIBILITY

Support modern major browsers:

* Chrome / Chromium
* Edge
* Firefox
* Safari

Use feature detection and graceful fallback.

Do not assume every browser supports identical APIs.

Example:

```js
if (navigator.clipboard?.writeText) {
  await navigator.clipboard.writeText(text);
} else {
  fallbackCopy(text);
}
```

Do not let optional browser capabilities become catastrophic failures.

---

# 35. CODE QUALITY

You are expected to produce code at approximately an **intermediate developer level**.

The owner can work on complex AI-assisted projects but should not be assumed to know every programming fundamental.

Therefore:

* provide complete working implementations,
* clearly identify files to create/edit,
* avoid unexplained architecture changes,
* explain important non-obvious implementation decisions briefly,
* do not randomly rename files,
* do not randomly replace frameworks,
* do not introduce unnecessary dependencies,
* preserve working features,
* identify the actual root cause when fixing bugs.

---

# 36. PROVIDE CONCRETE CODING DIRECTION

When a concept is technically difficult or easy to misunderstand, include practical examples.

For example, instead of only saying:

> "Add sustained performance detection."

provide an implementation direction such as:

```js
const performanceState = {
  mode: "visual",
  degradedSince: null,
  cooldownUntil: 0
};

function updatePerformanceState(metrics) {
  const degraded = metrics.frameTime > TARGET_FRAME_TIME;

  if (degraded) {
    performanceState.degradedSince ??= performance.now();
  } else {
    performanceState.degradedSince = null;
  }
}
```

Then explain the required behavior around it.

Do not blindly copy examples if a better implementation is appropriate.

Examples are meant to provide **direction**, not restrict engineering judgment.

---

# 37. DON'T OVERENGINEER

Do not create:

* unnecessary frameworks,
* unnecessary state-management systems,
* unnecessary abstractions,
* unnecessary backend services,
* unnecessary APIs,
* unnecessary build complexity.

The website is intended to remain:

> fast + static + client-side + privacy-first.

Prefer the simplest architecture that reliably solves the problem.

---

# 38. NO BACKEND

AntigleForge should remain a static/browser-first website.

Do not introduce:

* Node backend
* database
* server API
* user accounts
* cloud processing

unless the owner explicitly changes this requirement later.

Tool processing should happen in the browser whenever technically feasible.

---

# 39. NO AI API FOR NORMAL TOOLS

Do not add external AI APIs just because an AI-powered implementation would be interesting.

The website may have almost no revenue, so recurring API costs should not be assumed.

Prefer deterministic client-side algorithms.

For example:

```text
User input
   ↓
Local algorithm
   ↓
Result
```

rather than:

```text
User input
   ↓
Paid AI API
   ↓
Result
```

Only consider external services if the owner explicitly approves the cost and architecture.

---

# 40. FINAL AGGRESSIVE TESTING

After all selected tools have been implemented and deployed, perform a separate **final aggressive testing phase**.

Test the complete website as one system.

Look for:

* tool conflicts
* broken navigation
* performance regressions
* memory leaks
* mode-switching problems
* mobile layout failures
* browser compatibility problems
* security vulnerabilities
* malformed input crashes
* huge-input crashes
* file-processing failures
* broken downloads
* broken clipboard operations
* stale state
* accidental persistence
* visual regressions
* accessibility issues
* dependency problems

Test the site as if you are trying to break it.

Do not consider the project complete until major discovered problems are fixed.

---

# 41. VERSION / COMPATIBILITY HONESTY

Never claim:

> "Works on all Minecraft versions"

unless this has actually been verified.

If behavior differs between versions, clearly communicate it.

Prefer:

```text
Minecraft Bedrock
Supported: 1.21.x
```

or an appropriate version selector when required.

---

# 42. ERROR HANDLING

Errors should be useful to normal users.

Bad:

```text
Error: undefined is not a function
```

Better:

```text
We couldn't process this file.
Please make sure it is a valid Minecraft file and try again.
```

Technical details may be available for debugging, but should not be the primary user-facing message.

---

# 43. TOOL RESET

Every tool should have a reliable reset/clear mechanism where appropriate.

Example:

```js
function resetTool() {
  input.value = "";
  result = null;
  uploadedFile = null;
  renderEmptyState();
}
```

Do not accidentally retain stale data after reset.

---

# 44. RESEARCH OUTPUT FORMAT

Before implementing a new tool, provide:

```text
TOOL:
[Name]

EDITION:
Bedrock / Java

PROBLEM:
[...]

RESEARCH EVIDENCE:
[...]

TARGET USERS:
[...]

CURRENT ALTERNATIVES:
[...]

GAPS IN EXISTING TOOLS:
[...]

WHY ANTIGLEFORGE SHOULD BUILD IT:
[...]

CORE FEATURES:
[...]

MVP:
[...]

FUTURE:
[...]

UX FLOW:
[...]

TECHNICAL APPROACH:
[...]

DEPENDENCIES:
[...]

COMPATIBILITY:
[...]

PERFORMANCE RISKS:
[...]

SECURITY RISKS:
[...]

EDGE CASES:
[...]

TESTING PLAN:
[...]

PRIORITY:
[...]

FINAL RECOMMENDATION:
Build / Don't Build / Research Further
```

---

# 45. IMPLEMENTATION OUTPUT

When implementation begins, clearly state:

```text
Files to create:
- ...

Files to modify:
- ...

Files not to touch:
- ...

Dependencies:
- ...

Implementation:
- ...

Testing:
- ...
```

If an existing file must be replaced, explicitly say so.

Do not make silent destructive changes.

---

# 46. FIXING BUGS

When testing discovers a bug:

1. Reproduce it.
2. Identify the actual root cause.
3. Explain the cause briefly.
4. Fix it.
5. Re-test the affected behavior.
6. Check for regressions.
7. Continue only after verification.

Do not hide bugs by disabling the affected feature.

---

# 47. DECISION-MAKING RULE

When uncertain between multiple implementation approaches:

Choose the option that best balances:

```text
Reliability
+
Simplicity
+
Performance
+
Mobile compatibility
+
Privacy
+
Maintainability
```

Do not choose an architecture simply because it is more sophisticated.

---

# 48. IMPORTANT: DON'T ASK UNNECESSARY QUESTIONS

Do not repeatedly ask the owner for decisions that can reasonably be made from these requirements.

If a decision is minor:

> make the best engineering decision yourself.

If a decision materially changes the product:

> explain the decision and ask only when genuinely necessary.

Do not ask obvious questions whose answers are already specified in this document.

---

# 49. CORE PRINCIPLE

AntigleForge should feel like:

> **A fast, privacy-first, browser-based Minecraft toolbox that actually saves players time.**

Not:

> A website filled with random generators.

Every new tool must earn its place.

---

# 50. FINAL DEVELOPMENT LOOP

For every new tool, repeat:

```text
PUBLIC RESEARCH
      ↓
PAIN-POINT DISCOVERY
      ↓
DEMAND + VALUE ANALYSIS
      ↓
TOOL SPECIFICATION
      ↓
UI/UX DESIGN
      ↓
IMPLEMENTATION
      ↓
FUNCTIONAL TESTING
      ↓
FIX EVERYTHING FOUND
      ↓
FUNCTIONAL PASS
      ↓
PERFORMANCE TESTING
      ↓
SECURITY / ABUSE TESTING
      ↓
MOBILE TESTING
      ↓
FINAL VERIFICATION
      ↓
MARK TOOL COMPLETE
      ↓
START NEXT TOOL
```

After the initial tool set:

```text
DEPLOY
   ↓
AGGRESSIVE WHOLE-SITE TEST
   ↓
FIX REGRESSIONS
   ↓
RESEARCH NEXT TOOL SET
   ↓
REPEAT
```

**Never sacrifice reliability for speed of adding tools.**

**One properly finished tool is more valuable than five half-working tools.**
