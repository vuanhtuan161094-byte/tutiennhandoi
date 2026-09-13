# Home Target Side Rail Note

Temporary implementation note for the UI/UX candidate.

- Side rail is presentation-only.
- Routes are limited to existing canonical navigation targets: overview, roots, path, build, automation.
- Rail clicks proxy into already-rendered `data-tab-jump` controls; it does not own `activeTab`, `navigateTo`, transport, save or gameplay state.
- This note is not a closure record. Runtime visual proof and explicit user approval are still required.
