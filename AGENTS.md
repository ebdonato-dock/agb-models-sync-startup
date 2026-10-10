# Repository guidance

- This is a Pi extension, not an OpenCode plugin. `agb-models-sync-startup.js` is the entire runtime: a default-exported async factory receiving Pi's `pi` API, using only Node built-ins. There is no package manifest, dependency installation, build step, or configured test/lint/typecheck suite.

## Runtime constraints

- Keep synchronization awaited inside the async factory, before it returns. Moving it to `session_start` makes it too late for initial model selection in the documented Pi 1.1.0 flow; see `README.md` for lifecycle details.
- Execute through `pi.exec` so the command uses the Pi loader's working directory. Windows uses `cmd.exe` with `/d /s /c`; other platforms use `bash -c`. Windows `bash` may launch WSL and fail with a logon error.
- Validate `models.json` only after command success. Its directory is `PI_CODING_AGENT_DIR` when set (leading `~` expanded, relative paths resolved), otherwise `~/.pi/agent`. The `agentic-bus` output location must match it.
- Validation accepts a leading UTF-8 BOM and checks readability and JSON syntax; model configuration and credentials remain Pi's responsibility.
- Startup must keep execution and validation awaited inside the factory, but report exceptions, nonzero exits, killed processes, or invalid/unreadable JSON through `pi.ui.notify` without throwing, so Pi can continue loading. Successful loading stays silent. Existing diagnostics and documentation are in Portuguese.

## Verification

- Direct-load smoke check from the repo root: `pi --extension ./agb-models-sync-startup.js`. Requires Pi with async extension loading and `agentic-bus` on Pi's `PATH` (accessible through `cmd.exe` on Windows; `bash` also required elsewhere).
- Loading the extension runs the real `agentic-bus models sync`, including on `/reload` and `pi --list-models`; account for this side effect when verifying. Installed copies live at `~/.pi/agent/extensions/agb-models-sync-startup.js`; use direct loading to exercise the working-tree file.
