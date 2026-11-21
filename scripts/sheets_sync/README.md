# Google Sheet → Supabase sync

Keeps `public.questions` in Supabase in step with the **Master Database** tab of the
**A3T-Q&A-Database** Google Sheet. The sheet is the source of truth: write and edit
questions there, and Supabase follows.

- Syncs a few seconds after each edit, plus every 15 minutes as a backup.
- Also available from the sheet's **Supabase → Sync now** menu.
- Rows deleted from the sheet are deleted from Supabase.
- Each question has a permanent ID in the sheet's **ID** column (`Q-0001`, …), which
  the script fills in automatically. Don't edit or reuse IDs. If you copy a row, clear
  its ID so the copy gets a new one.
- For a list question, you can merge the **Question** cell down several rows and put
  one answer per row. Supabase stores it as one question with the answers joined by
  `, `. Those extra rows don't get their own ID.
- Columns are matched by header text, so you can reorder columns but **don't rename
  the headers** (see `COLUMN_MAP` in `Code.gs`).

## One-time setup

1. Open the sheet → **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with [`Code.gs`](Code.gs) from this folder. Save.
3. In the Supabase dashboard, go to **Project Settings → API Keys** and copy a
   **secret** key (`sb_secret_…`). The legacy `service_role` key also works.
   Keep it private: it bypasses row-level security.
4. In Apps Script, go to **Project Settings (gear) → Script properties** and add:
   - `SUPABASE_URL` = `https://jsqjqbwzmymrmzzytkpn.supabase.co`
   - `SUPABASE_SECRET_KEY` = the key from step 3
5. Back in the editor, pick **setupOnce** from the function dropdown and click
   **Run**. Approve the permissions prompt. This adds the ID column, installs the
   triggers and runs the first sync. It's safe to run again.

**Updating the script:** paste the new `Code.gs` over the old one, save, and click
**Supabase → Sync now** in the sheet (or run `syncNow`). Script properties and
triggers stay as they are.

To check that it worked, look under **Executions** in Apps Script, or run
`select count(*) from questions;` in the Supabase SQL editor.

## Table

Created by `alembic/versions/002_questions_table.py`. Row-level security is on with
no policies, so only the service role (the backend and this sync) can read or write
the table.
