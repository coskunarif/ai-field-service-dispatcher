# Gainhelm final review raw evidence - 2026-05-12

## User approval

```text
approve both True
USER: I approve True
approve assistant to choose specific Reddit/Facebook destinations and final copy, then publish True
```

## Docker auth/readiness evidence

```text
--- fresh docker auth evidence ---
name=docker-chrome-4 status=Up 2 days ports=5900/tcp, 0.0.0.0:7902->7900/tcp, [::]:7902->7900/tcp, 0.0.0.0:3012->9222/tcp, [::]:3012->9222/tcp
name=docker-chrome-3 status=Up 2 days ports=5900/tcp, 0.0.0.0:7920->7900/tcp, [::]:7920->7900/tcp, 0.0.0.0:3020->9222/tcp, [::]:3020->9222/tcp
platform=reddit container=docker-chrome-3 cdp=3020 novnc=7920
cdp_version=OK browser=Chrome/144.0.7559.132 ws_present=True
novnc_http=HTTP/1.1 200 OK
platform=facebook container=docker-chrome-4 cdp=3012 novnc=7902
cdp_version=OK browser=Chrome/144.0.7559.132 ws_present=True
novnc_http=HTTP/1.1 200 OK
```

## Reddit authenticated session and live post evidence

```text
--- fresh reddit live post evidence ---
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
post:
  id: 1tatp4o
  fullname: t3_1tatp4o
  title: How are small HVAC teams handling dispatch once spreadsheets get messy?
  author: QuestionOwn7886
  subreddit: hvacpeople
  score: 1
  upvote_ratio: 1
  num_comments: 0
  url: https://www.reddit.com/r/hvacpeople/comments/1tatp4o/how_are_small_hvac_teams_handling_dispatch_once/
  permalink: https://www.reddit.com/r/hvacpeople/comments/1tatp4o/how_are_small_hvac_teams_handling_dispatch_once/
  selftext: 'I’m researching dispatch workflows for small HVAC teams and keep seeing
    the same pattern: calls, texts, spreadsheets, and one person’s memory become the
    dispatch system.


    For teams with 1-20 techs, what usually breaks first?


    - assigning the right tech?

    - keeping the schedule current?

    - customer callbacks?

    - emergency jobs interrupting the day?

    - technician context getting lost?


    I’m building a small early-access tool around this problem, but mainly looking
    for operator feedback before overbuilding. If anyone is open to sharing how they
    handle dispatch today, I’d appreciate it.


    Here’s the early page for context: https://gainhelm.com/?utm_source=reddit&amp;utm_medium=community&amp;utm_campaign=dispatch_research'
  created_utc: 1778568952
  is_self: true
  link_flair_text: null
  over_18: false
comment_count: 0
comments: []
```

## Facebook authenticated session and non-visibility evidence

```text
--- fresh facebook attempt/non-visibility evidence ---
status: authenticated
user_id: '61581161647437'
has_dtsg: true
current_url: https://www.facebook.com/groups/1466282990666377/

FACEBOOK_GAINHELM_VISIBLE no
count: 3
posts:
- author: ''
  text: "Kati ya mm na chapati kuku utakula gani \n #watsapp_number_0117762820"
  permalink: ''
  time: ''
  reactions: '0'
  comments: '0'
- author: ''
  text: "Kati ya mm na chapati kuku utakula gani \n #watsapp_number_0117762820"
  permalink: https://www.facebook.com/groups/1466282990666377/posts/2048728389088498/
  time: ''
  reactions: '3'
  comments: '0'
- author: ''
  text: Hizi vitu ni nyinyi tumebebea usiogope kuomba
  permalink: ''
  time: ''
  reactions: '0'
  comments: '0'
```

Earlier Facebook submission attempt returned:

```text
success: true
```

Because the follow-up feed check returned `FACEBOOK_GAINHELM_VISIBLE no` and no Gainhelm permalink, Facebook must be reported as submitted/attempted but not feed-visible/retrievable.

## Analytics/traffic boundary

No analytics/referral proof of visits or visitor growth is available. Final reporting must not claim visitor growth or traffic traction. The only visible engagement captured is Reddit score `1` and comments `0`.
