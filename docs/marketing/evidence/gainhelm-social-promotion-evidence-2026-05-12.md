# Gainhelm social promotion evidence - 2026-05-12

## User approval

The user approved assistant-selected Reddit/Facebook destinations and copy by replying: `I approve` after being asked to confirm option A: approve assistant to choose specific Reddit/Facebook destinations and final copy, then publish.

## Docker/container authentication

Reddit used docker-chrome-3. Facebook used docker-chrome-4. Fresh preflight before posting showed both containers running and CDP/noVNC responsive:

```text
name=docker-chrome-4 status=Up 2 days ports=5900/tcp, 0.0.0.0:7902->7900/tcp, [::]:7902->7900/tcp, 0.0.0.0:3012->9222/tcp, [::]:3012->9222/tcp
name=docker-chrome-3 status=Up 2 days ports=5900/tcp, 0.0.0.0:7920->7900/tcp, [::]:7920->7900/tcp, 0.0.0.0:3020->9222/tcp, [::]:3020->9222/tcp
container=docker-chrome-3 cdp=3020 novnc=7920
cdp=OK Browser=Chrome/144.0.7559.132 ws=True
novnc=HTTP/1.1 200 OK
container=docker-chrome-4 cdp=3012 novnc=7902
cdp=OK Browser=Chrome/144.0.7559.132 ws=True
novnc=HTTP/1.1 200 OK
```

Reddit auth status before posting:

```json
{
  "status": "authenticated",
  "username": "QuestionOwn7886",
  "link_karma": 36,
  "comment_karma": 123,
  "created_utc": 1706485429,
  "has_mail": true,
  "inbox_count": 55,
  "is_gold": false
}
```

Facebook auth status before posting:

```text
status: authenticated
user_id: '61581161647437'
has_dtsg: true
current_url: https://www.facebook.com/groups/383135277911978/
```

Credential env vars were missing; auth was session-based in Docker. No secret values were printed.

## Destination/rules decisions

Selected Reddit target: `r/hvacpeople`. Rule output showed promotion is permitted but excessive promotion is not. Rejected `r/plumbing` and `r/smallbusiness` because their rules prohibit advertising/promotion/market research.

Selected Facebook target: `Plumbers / Plumbing Contractors Marketing, Hiring & Support` (`1466282990666377`), the most relevant accessible Facebook group from the authenticated account.

## Reddit live outcome

Reddit post was published and verified live:

```text
url: https://www.reddit.com/r/hvacpeople/comments/1tatp4o/how_are_small_hvac_teams_handling_dispatch_once/
id: 1tatp4o
name: t3_1tatp4o
author: QuestionOwn7886
subreddit: hvacpeople
score: 1
num_comments: 0
```

Verified selftext included the Gainhelm UTM link:

```text
https://gainhelm.com/?utm_source=reddit&utm_medium=community&utm_campaign=dispatch_research
```

Live permalink:

https://www.reddit.com/r/hvacpeople/comments/1tatp4o/how_are_small_hvac_teams_handling_dispatch_once/

## Facebook outcome

Facebook group post command returned:

```text
success: true
```

However, subsequent `group-feed 1466282990666377 --limit 5` did not surface the Gainhelm text or a Gainhelm permalink. Therefore Facebook is classified as submitted/attempted but not live-URL-verified. It may be pending, hidden, moderated, or not retrievable by the toolkit. No Facebook live URL is claimed.

## Traction/analytics boundary

No website analytics/referral data was checked or available in this task. The only visible engagement evidence is Reddit score `1` and comments `0` at verification time. No visitor-growth or traffic-traction claim is made.

## Compliance

- User approval was obtained before external posting.
- No DMs, comments, votes, broad posting, alternate Facebook groups, credential changes, destructive changes, or secret printing occurred.
- Facebook is not overclaimed as live because no permalink/feed-visible proof exists.
- Future social principles were recorded in `docs/marketing/social-promotion-principles.md` and committed as `79f5427`.
