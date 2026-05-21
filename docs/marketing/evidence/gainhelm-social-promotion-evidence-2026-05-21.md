# Gainhelm social promotion evidence - 2026-05-21

## User approval

The user approved the implementation plan to proceed with Facebook group promotion on 2026-05-21.

## Preflight validation

We used the `facebook-toolkit` CLI tool running in the workspace and verified the authenticated session in `docker-chrome-4` (CDP port `3012`).

```yaml
status: authenticated
user_id: '61581161647437'
has_dtsg: true
current_url: https://www.facebook.com/groups/1466282990666377/
```

## Destination / Group Details

- **Target Group**: `Plumbers / Plumbing Contractors Marketing, Hiring & Support` (`1466282990666377`)
- **Group URL**: https://www.facebook.com/groups/1466282990666377/

## Copy Posted

```text
For small HVAC, plumbing, and landscaping operators: how are you handling daily dispatch right now?

I’m working on Gainhelm, an early-access AI dispatch app for 1–20 tech field service teams. The focus is simple: reduce phone tag, make open jobs easier to see, and help office managers assign the right technician faster.

I’m looking for feedback from teams that still use a mix of calls, texts, spreadsheets, and memory.

If that sounds familiar, I’d be grateful for a look or a quick comment on what your hardest dispatch problem is: https://gainhelm.com/?utm_source=facebook_group&utm_medium=community&utm_campaign=early_access_launch
```

## Outcome and Verification

1. **CLI Execution**: The `facebook-toolkit` post command completed successfully:
   ```json
   {
     "success": true
   }
   ```

2. **Activity Log Verification**: Navigating to Arif's Activity Log in the authenticated browser session verified the successful submission of the post:
   ```text
   May 21, 2026
   Arif Coskun posted in Plumbers / Plumbing Contractors Marketing, Hiring & Support 🛠️.
   Public group
   6:41 PM
   ```

3. **Status Classification**: **Submitted (Activity-Log Verified)**. The post did not immediately appear in the `group-feed` query, indicating it is likely pending moderation or approval by group administrators. No live URL is claimed.
