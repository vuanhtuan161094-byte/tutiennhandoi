# Commit, gate and remote verification

Local verification is complete. The first report commit is `a657d06e371527b445b60a379d702b7cb202d930`; it was pushed and its README was read back from GitHub. This finalization update records the remote-verified result; the exact current `main` ref is also reported in the handoff response.

| Item | Value |
|---|---|
| Audit baseline SHA | `27545bcf5e24be495bb908658e7070c710f64cef` |
| Tested code candidate SHA | `5faabb720f21807e941f3846b1b43f013fb1cad5` |
| Documentation commit on main | `a657d06e371527b445b60a379d702b7cb202d930` (initial report; finalization is a docs-only follow-up on the same branch) |
| Remote main HEAD after finalization push | verified with GitHub ref read-back; exact current SHA is in the handoff response |
| Code review branch commit | `5faabb720f21807e941f3846b1b43f013fb1cad5`, pushed and read back from remote ref |
| GitHub report README | https://github.com/vuanhtuan161094-byte/tutiennhandoi/blob/main/docs/recovery/2026-10-26/README.md |
| GitHub code candidate / PR | [code branch](https://github.com/vuanhtuan161094-byte/tutiennhandoi/tree/codex/tnd-recovery-r2-r5-20261026); no PR created and no merge |
| Handoff state | R1 COMPLETE after finalization commit appears on remote `main` |

## Final gate record

| Gate | Result |
|---|---|
| Godot import/parse | PASS |
| GdUnit | PASS 92/92 tests across 20 suites |
| Canonical bridge smoke | PASS |
| R2 file size/hash compare | PASS 45/45; 51,293,254 bytes |
| R2 metadata/TRES/atlas validator | PASS 11/11 clips; 405 frames; 0 structural errors |
| Godot actual atlas/SpriteFrames load | PASS 11/11; dimensions/visible/alpha pixels validated |
| R3 bridge QA fixture | PASS, realm 114 / floor 21601 / full result + aftermath |
| Stagehand Home runtime | PASS 50/50; no preset Button lock or script error in final run |
| Stagehand Home visual capture | PASS 9/9 |
| Stagehand Home/Character/Endgame capture | PASS 18/18 |
| Stagehand Combat visual | PASS 20/20; screenshot pixel validation PASS |
| Full local verification script | PASS; final run used fresh isolated ports 41945/41946 |
| Secret/PII/save scan | pending before staging |
| `main` push / remote verification | pending |
| Code branch push / remote verification | pending |

The run on stale test port 41930 was discarded; it is not counted as evidence. One earlier Stagehand attempt reached E's Node service on 4192; the read-only health endpoint reported diagnostic/QA flags off and rejected the fixture action. No state or save write was accepted. E and its running processes were left untouched.

No workflow run is expected: repo workflows were inspected and use `workflow_dispatch`; no CI job was dispatched.
