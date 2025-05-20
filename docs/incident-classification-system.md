# Incident Classification System

This document defines the severity levels, classification criteria, and response time expectations for incidents in our Next.js application deployed on Vercel.

## Table of Contents

1. [Severity Levels](#severity-levels)
2. [Classification Criteria](#classification-criteria)
3. [Response Time Expectations](#response-time-expectations)
4. [Escalation Requirements](#escalation-requirements)
5. [Severity Level Examples](#severity-level-examples)

## Severity Levels

Our incident classification system uses four severity levels:

| Severity Level | Name | Description |
|----------------|------|-------------|
| SEV1 | Critical | Complete system outage or severe security breach affecting all users |
| SEV2 | High | Major functionality unavailable or security issue affecting a significant subset of users |
| SEV3 | Medium | Non-critical functionality unavailable or degraded performance affecting some users |
| SEV4 | Low | Minor issues with minimal impact on users |

## Classification Criteria

### SEV1 (Critical)

An incident is classified as SEV1 if one or more of the following criteria are met:

- Complete application unavailability (all users unable to access the application)
- Database is completely unavailable or experiencing severe data corruption
- Critical security breach with active exploitation
- Data loss or corruption affecting a significant portion of users
- Payment processing completely unavailable (if applicable)
- Error rates exceeding 50% of all requests
- SLA breach imminent

### SEV2 (High)

An incident is classified as SEV2 if one or more of the following criteria are met:

- Major functionality unavailable (e.g., authentication, core features)
- Database performance severely degraded
- Security vulnerability with limited exploitation
- Data integrity issues affecting a subset of users
- Payment processing degraded or intermittently failing (if applicable)
- Error rates between 10% and 50% of requests
- Performance degradation causing timeouts for a significant portion of users
- Third-party critical service integration failure

### SEV3 (Medium)

An incident is classified as SEV3 if one or more of the following criteria are met:

- Non-critical functionality unavailable
- Minor database performance issues
- Security vulnerability with no known exploitation
- Isolated data integrity issues
- Error rates between 1% and 10% of requests
- Performance degradation noticeable to some users
- Third-party non-critical service integration failure
- Monitoring or alerting system partial failure

### SEV4 (Low)

An incident is classified as SEV4 if one or more of the following criteria are met:

- Cosmetic issues
- Minor bugs affecting a small number of users
- Error rates below 1% of requests
- Slight performance degradation
- Non-user-facing system issues
- Documentation issues
- Monitoring anomalies without service impact

## Response Time Expectations

Each severity level has specific response time expectations:

| Severity Level | Initial Response | Status Updates | Resolution Target | Post-Incident Review |
|----------------|------------------|----------------|-------------------|---------------------|
| SEV1 (Critical) | Immediate (< 15 min) | Every 30 minutes | < 4 hours | Required within 1 business day |
| SEV2 (High) | < 30 minutes | Every 2 hours | < 8 hours | Required within 3 business days |
| SEV3 (Medium) | < 2 hours | Daily | < 24 hours | Required for recurring issues |
| SEV4 (Low) | < 8 hours | As needed | < 5 business days | Optional |

## Escalation Requirements

### SEV1 (Critical)

- Immediate notification to:
  - Incident Commander
  - Technical Lead
  - Operations Lead
  - CTO/VP of Engineering
  - CEO (if customer impact is significant)
- War room established immediately
- All hands on deck until mitigated
- External communication required within 30 minutes of detection

### SEV2 (High)

- Immediate notification to:
  - Incident Commander
  - Technical Lead
  - Operations Lead
  - Engineering Manager
- War room established if not resolved within 1 hour
- External communication required if customer impact lasts more than 1 hour

### SEV3 (Medium)

- Notification to:
  - Incident Commander
  - Technical Lead
  - Relevant team members
- External communication at discretion of Incident Commander

### SEV4 (Low)

- Notification to relevant team members
- Handled during normal business hours
- No external communication typically required

## Severity Level Examples

### SEV1 (Critical) Examples

- Production website returns 5xx errors for all users
- Database is down or unreachable
- Authentication system completely fails
- Deployment causes complete system failure
- Active security breach with data exfiltration
- Payment processing completely unavailable (if applicable)

### SEV2 (High) Examples

- Checkout process fails for 30% of users
- Search functionality unavailable
- API endpoints timing out intermittently
- Database performance causing significant latency
- File uploads/downloads failing
- Payment processing intermittently failing (if applicable)
- Critical third-party integration unavailable

### SEV3 (Medium) Examples

- Non-critical features unavailable (e.g., user profile updates)
- Slow page load times for some users
- Intermittent errors for a small percentage of users
- Minor UI/UX issues affecting usability
- Non-critical third-party integration unavailable
- Elevated error rates in non-critical paths

### SEV4 (Low) Examples

- Typos or minor UI issues
- Documentation errors
- Minor performance degradation
- Non-user-facing logging errors
- Development or staging environment issues
- Minor reporting discrepancies