## QA Report

| #   | Test Case | App | Persona | Result | Notes |
| --- | --------- | --- | ------- | ------ | ----- |

{{TEST_ROWS}}

Result values: :white_check_mark: PASS, :x: FAIL, :no_entry: BLOCKED, :warning: FLAKY, :grey_question: INCONCLUSIVE

{{#if ACTIONABLE_ITEMS}}

### Action Required

{{ACTIONABLE_ITEMS}}
{{/if}}

{{#if SUGGESTED_SKILL_UPDATES}}

### Suggested Skill Updates ({{SUGGESTED_SKILL_UPDATE_COUNT}} issues found)

| #   | Severity        | File     | Issue               | Fix Prompt                                                                           |
| --- | --------------- | -------- | ------------------- | ------------------------------------------------------------------------------------ |
{{SUGGESTED_SKILL_UPDATE_ROWS}}

{{/if}}

<details>
<summary>Screenshots & Evidence</summary>

{{EVIDENCE}}

</details>
