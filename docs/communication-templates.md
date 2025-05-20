# Incident Communication Templates

This document provides standardized templates for internal and external communication during incidents. These templates ensure consistent, clear, and appropriate communication throughout the incident lifecycle.

## Table of Contents

1. [Internal Communication Templates](#internal-communication-templates)
   - [Incident Declaration](#incident-declaration)
   - [Status Updates](#status-updates)
   - [Resolution Notification](#resolution-notification)
   - [Escalation Request](#escalation-request)
   - [Handoff Communication](#handoff-communication)

2. [External Communication Templates](#external-communication-templates)
   - [Status Page Updates](#status-page-updates)
   - [Customer Email Notifications](#customer-email-notifications)
   - [Social Media Updates](#social-media-updates)
   - [Press Statements](#press-statements)

3. [Communication Guidelines](#communication-guidelines)
   - [Frequency Guidelines](#frequency-guidelines)
   - [Tone and Language](#tone-and-language)
   - [Information Disclosure](#information-disclosure)

## Internal Communication Templates

### Incident Declaration

Use this template when declaring a new incident to the team.

```
@channel INCIDENT DECLARED: [Incident Type]

Severity: [SEV1/SEV2/SEV3/SEV4]
Time Detected: [YYYY-MM-DD HH:MM UTC]
Detected By: [Name/System]

Description:
[Brief description of the incident - 1-2 sentences]

Impact:
- [% of users affected]
- [Functionality affected]
- [Business impact]

Current Status:
- Investigation in progress
- Response team being assembled
- [Other relevant status information]

Response Team:
- Incident Commander: [Name]
- Technical Lead: [Name]
- Communications Lead: [Name]
- [Other roles as assigned]

Next Update:
[Time of next update - typically 30 minutes for SEV1/SEV2]

Incident Channel: #incident-[date]-[short-description]
War Room Link: [Video conference link if applicable]
```

### Status Updates

Use this template for regular updates during an incident.

```
@channel INCIDENT UPDATE: [Incident Type]

Time: [YYYY-MM-DD HH:MM UTC]
Elapsed Time: [HH:MM since incident started]
Severity: [SEV1/SEV2/SEV3/SEV4]

Current Status:
- [Current state of the system]
- [Progress made]
- [Ongoing issues]

Impact:
- [Current % of users affected]
- [Functionality affected]
- [Business impact]

Metrics:
- [Error rate: X%]
- [Latency: X ms]
- [Other relevant metrics]

Actions Taken:
- [List of actions taken since last update]

Next Steps:
- [Planned actions]
- [Areas under investigation]

Blockers:
- [Any blockers or needs]

Estimated Resolution Time:
[ETA if known, or "Under investigation"]

Next Update:
[Time of next update]
```

### Resolution Notification

Use this template when an incident has been resolved.

```
@channel INCIDENT RESOLVED: [Incident Type]

Time Resolved: [YYYY-MM-DD HH:MM UTC]
Total Duration: [HH:MM]
Severity: [SEV1/SEV2/SEV3/SEV4]

Resolution:
[Description of how the issue was resolved]

Root Cause:
[Brief description of the root cause, if known, or "Under investigation"]

Impact Summary:
- [% of users affected]
- [Duration of impact]
- [Business impact]
- [Data impact, if any]

Timeline:
- [HH:MM] - Incident detected
- [HH:MM] - Response team assembled
- [HH:MM] - [Key event]
- [HH:MM] - [Key event]
- [HH:MM] - Resolution implemented
- [HH:MM] - Incident resolved

Follow-up:
- Post-incident review scheduled for [time/date]
- [Any immediate follow-up actions]

Thank you to everyone who helped resolve this incident.
```

### Escalation Request

Use this template when escalating an incident to additional team members or leadership.

```
@[person/group] ESCALATION REQUEST: [Incident Type]

Severity: [SEV1/SEV2/SEV3/SEV4]
Time Declared: [YYYY-MM-DD HH:MM UTC]
Current Duration: [HH:MM]

Reason for Escalation:
[Brief explanation of why escalation is needed]

Current Status:
- [Current state of the system]
- [Progress made]
- [Ongoing issues]

Actions Taken:
- [List of actions taken so far]

Assistance Needed:
- [Specific expertise or resources needed]
- [Decisions that require approval]
- [Other specific requests]

Incident Channel: #incident-[date]-[short-description]
War Room Link: [Video conference link]
```

### Handoff Communication

Use this template when handing off incident response to another team member.

```
@[person] INCIDENT HANDOFF: [Incident Type]

Severity: [SEV1/SEV2/SEV3/SEV4]
Current Duration: [HH:MM]
Role Being Handed Off: [Incident Commander/Technical Lead/etc.]

Current Status:
- [Current state of the system]
- [Progress made]
- [Ongoing issues]

Key Context:
- [Important information the person needs to know]
- [Decisions made]
- [Attempted solutions]

Current Actions:
- [Actions in progress]
- [Next steps planned]

Pending Decisions:
- [Decisions that need to be made]

Resources:
- [Links to relevant dashboards]
- [Links to relevant documentation]
- [Other helpful resources]

I'll remain available for questions at [contact method].
```

## External Communication Templates

### Status Page Updates

#### Initial Notification

Use this template for the first public notification of an incident.

```
[Title: System/Service Name - Incident]

Status: Investigating

We are currently experiencing an issue with [specific functionality or "our service"]. Our team is investigating the issue and working to restore service as quickly as possible.

We will provide updates as more information becomes available.

Posted: [YYYY-MM-DD HH:MM UTC]
```

#### Progress Update

Use this template for updates during an incident.

```
[Title: System/Service Name - Incident]

Status: Identified

We have identified the cause of the current issue affecting [specific functionality or "our service"] and are implementing a fix. We expect to restore service within [estimated time].

We apologize for the inconvenience and appreciate your patience.

Posted: [YYYY-MM-DD HH:MM UTC]
Updated: [YYYY-MM-DD HH:MM UTC]
```

#### Resolution Notification

Use this template when an incident has been resolved.

```
[Title: System/Service Name - Incident]

Status: Resolved

The issue affecting [specific functionality or "our service"] has been resolved. All systems are now operating normally.

[Include if applicable: "No data was lost during this incident."]

We apologize for any inconvenience this may have caused.

Posted: [YYYY-MM-DD HH:MM UTC]
Resolved: [YYYY-MM-DD HH:MM UTC]
```

### Customer Email Notifications

#### Initial Notification

Use this template for the first email notification to affected customers.

```
Subject: [System/Service Name] - Service Disruption Notification

Dear [Customer],

We are currently experiencing an issue with [specific functionality or "our service"] that may affect your ability to [describe impact].

Our team is actively investigating the issue and working to restore service as quickly as possible.

Current Status: Investigating
Estimated Resolution: [If known, otherwise "We are working to provide an estimate"]

You can follow our progress on our status page at [status page URL].

We apologize for any inconvenience this may cause and appreciate your patience as we work to resolve this issue.

If you need immediate assistance, please contact our support team at [support email/phone].

Sincerely,
[Company Name] Team
```

#### Resolution Notification

Use this template for email notification when an incident has been resolved.

```
Subject: [System/Service Name] - Service Disruption Resolved

Dear [Customer],

The service disruption affecting [specific functionality or "our service"] has been resolved. All systems are now operating normally.

Incident Duration: [Start time] to [End time] UTC
Impact: [Brief description of the impact]

[Include if applicable: "No data was lost during this incident."]

We understand the importance of our service to your operations and apologize for any inconvenience this disruption may have caused.

If you continue to experience any issues, please contact our support team at [support email/phone].

Sincerely,
[Company Name] Team
```

### Social Media Updates

#### Initial Notification

Use this template for the first social media notification of an incident.

```
We're currently experiencing an issue with [specific functionality or "our service"]. Our team is investigating and working to restore service as quickly as possible. We'll provide updates here and on our status page: [status page URL] #ServiceUpdate
```

#### Progress Update

Use this template for social media updates during an incident.

```
Update on our current service disruption: We've identified the issue affecting [specific functionality or "our service"] and are implementing a fix. We expect to restore service within [estimated time]. Status page: [status page URL] #ServiceUpdate
```

#### Resolution Notification

Use this template for social media notification when an incident has been resolved.

```
The issue affecting [specific functionality or "our service"] has been resolved. All systems are now operating normally. We apologize for any inconvenience this may have caused. #ServiceUpdate
```

### Press Statements

#### Initial Statement

Use this template for the first press statement about a major incident.

```
[Company Name] is currently experiencing a service disruption affecting [specific functionality or "our service"]. Our technical teams are actively investigating the issue and working to restore service as quickly as possible.

The incident began at approximately [time] UTC on [date]. [If known: "The issue is affecting approximately X% of our users."]

We understand the critical nature of our services to our customers and are dedicating all necessary resources to resolve this issue. We will provide regular updates on our status page at [status page URL].

For the most current information, please refer to our status page or follow our social media channels.

Media Contact:
[Name]
[Email]
[Phone]
```

#### Resolution Statement

Use this template for a press statement when a major incident has been resolved.

```
[Company Name] has resolved the service disruption that affected [specific functionality or "our service"] from [start time] to [end time] UTC on [date].

[Brief description of the impact and scope]

[If appropriate: "A preliminary investigation indicates that the disruption was caused by [brief cause explanation]. A full post-incident review is underway."]

[If applicable: "No customer data was compromised during this incident."]

We sincerely apologize for any inconvenience this service disruption may have caused our customers. We take service reliability very seriously and will be conducting a thorough review of this incident to prevent similar issues in the future.

Media Contact:
[Name]
[Email]
[Phone]
```

## Communication Guidelines

### Frequency Guidelines

Communication frequency should be based on the severity level of the incident:

| Severity Level | Internal Updates | External Updates | Stakeholder Updates |
|----------------|------------------|------------------|---------------------|
| SEV1 (Critical) | Every 30 minutes | Every 60 minutes | Every 60 minutes |
| SEV2 (High) | Every 2 hours | Every 4 hours | Every 4 hours |
| SEV3 (Medium) | Every 4 hours | Daily | As needed |
| SEV4 (Low) | Daily | Not typically required | Not typically required |

### Tone and Language

1. **Be Clear and Concise**
   - Use simple, direct language
   - Avoid technical jargon in external communications
   - Focus on facts, not speculation

2. **Be Honest and Transparent**
   - Acknowledge the issue clearly
   - Don't minimize the impact
   - Don't overpromise on resolution times

3. **Be Empathetic**
   - Acknowledge the impact on users
   - Express appropriate concern
   - Apologize when appropriate

4. **Be Consistent**
   - Use consistent terminology across all channels
   - Ensure all team members are sharing the same information
   - Maintain a single source of truth for incident status

### Information Disclosure

1. **Internal Communication**
   - Can include technical details
   - Can discuss potential causes
   - Can include detailed metrics
   - Should include all relevant context

2. **External Communication**
   - Focus on user impact and status
   - Avoid detailed technical explanations during the incident
   - Do not speculate on causes until confirmed
   - Do not assign blame
   - Do not share sensitive information

3. **Security Incidents**
   - Consult with legal and security teams before any external communication
   - Follow regulatory disclosure requirements
   - Be especially careful about information shared
   - Focus on steps users should take to protect themselves