# Teledeck

Teledeck is a multimedia viewer that pulls data from Telegram channels. It hosts the media with a Go/Typescript app.


## Project Structure & Module Organization
- `server/` hosts the Go backend (`cmd/teledeck`, domain logic in `internal/`, Tailwind assets in `assets/`).
- `web/` contains the Vite + React client; edit `web/src/`, bundle output lands in `web/dist/` for embedding in the Go service.
- `AI/` holds Python tooling for tagging and scoring; place downloaded weights under `AI/models/`.
- `admin/` exposes Telegram database and media collection commands. Telegram API is all async.
- persistent SQLite data lives in `data/` with exports in `export/`.
- Shared settings live under `config/default.yaml`; override secrets in `config/local.yaml` (ignored by git) so both Go and Python read the same YAML tree. Database change files are tracked in `alembic/`.

Remote files are typically stashed in an external storage folder.

## Build, Test, and Development Commands
- `make server` starts the Go dev server with Air live reload.
- `make web` installs dependencies and builds the frontend bundle.
- `make build` runs Tailwind + templ generation and produces a production binary.
- `python tagger/server.py` launches the tagging microservice once models exist.
- `python admin/admin.py --client-update` refreshes cached Telegram data prior to ingest jobs.

## Configuration & Environment
- Keep `config/default.yaml` committed as the base template and copy `config/local.example.yaml` to `config/local.yaml` for per-machine overrides; environment variables like `APP__HTTP_PORT` or the legacy `PORT` still work for quick tweaks.
- Apply migrations with `make alembic-upgrade`; refresh `alembic/schema.sql` via `make dump-schema` after schema edits.
- Back up the SQLite store with `make backup-db`; snapshots are written to `data/db_backup/` before risky operations.
