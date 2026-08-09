# TaskTornado launch safety

This file records the code-level launch boundary. It is an engineering
checklist, not legal advice.

## Current public boundary

- United States only.
- Users must be at least 13.
- Users age 13–17 need parent or legal guardian approval before app APIs are
  available.
- A restrictive database policy also denies authenticated access until the
  U.S., age, and guardian-approval checks pass.
- Direct Google account sign-in is disabled. Registration uses TaskTornado
  email/password so the age and consent flow cannot be skipped through the UI.
- Aurora uses Groq only. AI endpoints require authentication and eligibility,
  require the current guardian approval for users age 13–17, enforce
  server-side daily quotas and short-burst limits, and fail closed unless
  `AI_FEATURES_ENABLED=true`.
- AI context is bounded, school-data access is read-only, and web search is
  not enabled.
- Gmail and Google Classroom fail closed independently unless their
  service-specific flags are enabled. The legacy
  `GOOGLE_INTEGRATIONS_ENABLED=true` flag enables both and should not be used
  when only one integration has completed review.
- Upload, discussion board, study group, invitation, and group-chat entry
  points are disabled.
- Paid plans are previews only. Checkout is not enabled.

## Aurora release requirements

The code now covers:

1. Groq-only model inference with an approved fallback list.
2. Input and output safety classification for a teen educational product.
3. Bounded prompts and read-only retrieval of only relevant classes, homework,
   and tests.
4. Atomic, server-side daily quotas plus short-burst request limiting.
5. Updated Privacy Policy, Terms, AI guidelines, in-product consent, and a new
   consent version for users age 13–17.
6. No web search and no AI write tools.

Before public release, enable Groq Zero Data Retention where available, run the
AI quota migration, rotate any key that has been exposed, verify production
monitoring, and obtain qualified legal review. Do not send Gmail or Google
Classroom data to Groq merely because both integrations are enabled. That is a
separate data-use decision requiring its own policy review and clear user
disclosure.

## Never enable Google integrations publicly from configuration alone

Before setting `GMAIL_INTEGRATION_ENABLED=true`,
`GOOGLE_CLASSROOM_INTEGRATION_ENABLED=true`, or the legacy combined flag in a
public environment:

1. Use a dedicated, random `GOOGLE_TOKEN_ENCRYPTION_KEY`.
2. Configure exact production redirect URIs.
3. Configure the OAuth consent screen with matching app identity, homepage,
   Privacy Policy, and Terms URLs.
4. Verify production domain ownership.
5. Request only the scopes present in the code.
6. Complete every Google brand, sensitive-scope, restricted-scope, and
   security-assessment requirement that applies.
7. Test authorization, refresh, disconnect, token revocation, and account
   deletion in a separate test project.
8. Keep development and production Google Cloud projects separate.

## External release work still required

- Have qualified counsel review the actual product, Privacy Policy, Terms, age
  design, parental approval method, state teen-privacy requirements, and
  company/contact details before a public launch.
- Confirm hosting, analytics, email, database, and any future AI contracts
  match the disclosures.
- Establish support, privacy-request, incident-response, retention, backup,
  and deletion procedures that a real operator can consistently perform.
- Run a security review and resolve the repository's existing dependency audit
  findings and unrelated TypeScript failures.
