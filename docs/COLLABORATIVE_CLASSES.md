# Collaborative classes

Hover a class header and select **Share** to create and copy an invitation. A signed-in recipient confirms **Join class**. Both accounts use the original class ID; no task copies are created. The Share dialog lists members, lets the creator revoke invite links or remove a member, and lets other members leave.

## Data and access

- `classroom_collaborations` marks an existing class as collaborative. `classroom_members` is the authoritative membership list.
- Existing homework rows are shared by class membership. Homework/subtasks, descriptions, due dates, priority, links, pinning, and completion are common to the team.
- Class name/icon/color changes are made by the creator and appear for members. Only the creator can delete the class or invite/remove classmates.
- Class metadata is read through a curated RPC, preserving the existing private class-table policies. Class grades are not exposed to members.
- Test schedules/notes/status are shared through RPCs. Scores, grades, weights and max scores remain account-specific; shared-test personal results are overlaid from `classroom_test_results`.
- Revoked members lose access to all work in the class, including rows they originally authored. Leaving does not delete shared work.
- Invitations use a random 64-character secret. Only its SHA-256 hash is stored. Links expire after seven days. Removing another member also revokes outstanding invites so their old link cannot restore access.
- Existing account age/country/guardian-approval database checks remain in force. Legacy public social/group features remain disabled.

## Sync and concurrency

Database triggers broadcast content-free invalidations to private `classroom:<class UUID>` topics. Realtime topic authorization checks class membership; snapshots are fetched with the current user's permissions. A 15-second visible-tab reconciliation and reconnect/visibility refresh cover disconnects and membership revocation. Context providers reuse the app layout's canonical snapshots rather than creating isolated per-page task lists.

Checklist mutations lock the homework row and merge changes per step and field. Edits to different steps are preserved; conflicting changes to the same field prompt a refresh. New or removed steps cannot silently erase another member's changes.

## Setup and verification

Apply `supabase/migrations/20261103010000_collaborative_classes.sql` after the subtasks migration. This feature needs no new environment variables. Supabase's database broadcast functions and private Realtime channels are required.

`supabase/tests/collaborative_classes.sql` runs through an administrator database connection. It creates synthetic users inside a transaction and rolls them back. It covers join identity/idempotency, outsider access, raw-table privacy, personal results, shared schedule edits, subtask merging, creator permissions, revocation/removal, expiry, metadata sync, broadcast authorization, account eligibility and class deletion.

Additional verification used independent authenticated accounts and a real WebSocket subscription: joined-account edits arrived live; outsiders could not subscribe; stale subtask snapshots merged; removal denied subsequent reads and invalidated the old link. Temporary test accounts/classes were removed.

Web source changes are local until deployed. The generated invitation uses the current website origin, so teammates need the deployed app URL rather than a localhost link.
