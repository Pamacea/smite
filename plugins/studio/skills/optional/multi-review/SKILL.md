---
name: multi-review
description: MANDATORY gate BEFORE merging PR or deploying. Orchestrates parallel review by 4 specialized agents (security, performance, testing, documentation) with consolidated report. Specific phrases: 'review this PR', 'security audit', 'performance check'.
version: 1.0.0
disable-model-invocation: true
user-invocable: true
lazy_load: true
category: workflow
tags: [review, multi-agent, security, performance, testing]
---

# Multi-Agent Review System

> **Lazy-loaded skill** - Only loaded before PR merge or production deploy

## Mission

Orchestrate parallel code review by specialized agents, then consolidate findings.

## When to Use

- **Before merging PR**: "Review this PR before merge"
- **Security-critical code**: Auth, payments, data handling
- **Performance concerns**: "Check performance"
- **Test coverage gaps**: "Review test coverage"

## Examples

```bash
# Comprehensive PR review
/studio review --team --all

# Security only
/studio review --team --scope=security

# Performance + testing
/studio review --team --scope=performance,testing
```

## Review Agents

| Agent | Focus |
|-------|-------|
| Security Reviewer | OWASP Top 10, vulnerabilities |
| Performance Profiler | Bottlenecks, optimization |
| Testing Guide | Coverage, test quality |
| Documentation | API docs, comments |

**Version:** 1.0.0 | **Lazy Load:** Enabled
