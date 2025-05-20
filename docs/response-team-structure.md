# Response Team Structure

This document defines the roles, responsibilities, escalation paths, and communication protocols for the incident response team.

## Table of Contents

1. [Roles and Responsibilities](#roles-and-responsibilities)
2. [Escalation Paths](#escalation-paths)
3. [Communication Protocols](#communication-protocols)
4. [Team Assembly](#team-assembly)
5. [Handoff Procedures](#handoff-procedures)

## Roles and Responsibilities

### Incident Commander (IC)

**Primary Responsibilities:**
- Overall coordination of the incident response
- Declaring incident severity level
- Assigning roles to team members
- Making critical decisions
- Approving external communications
- Determining when the incident is resolved
- Ensuring post-incident review is conducted

**Skills Required:**
- Leadership and decision-making under pressure
- Clear communication
- Understanding of the system architecture
- Ability to delegate effectively

**Backup:** Operations Lead or Technical Lead

### Technical Lead (TL)

**Primary Responsibilities:**
- Leading technical investigation
- Coordinating technical resources
- Proposing and implementing technical solutions
- Providing technical context to the team
- Evaluating rollback options
- Managing feature flag changes for mitigation

**Skills Required:**
- Deep technical knowledge of the system
- Problem-solving skills
- Experience with the codebase
- Understanding of the deployment process

**Backup:** Senior Engineer or Engineering Manager

### Communications Lead (CL)

**Primary Responsibilities:**
- Managing internal communications
- Drafting external communications
- Updating status page
- Coordinating with customer support
- Documenting the incident timeline
- Facilitating team communication

**Skills Required:**
- Clear written and verbal communication
- Ability to translate technical issues for non-technical audiences
- Calm demeanor under pressure
- Organization skills

**Backup:** Product Manager or Customer Support Lead

### Operations Lead (OL)

**Primary Responsibilities:**
- Managing infrastructure aspects
- Monitoring system health
- Implementing infrastructure changes
- Coordinating with cloud providers
- Managing database operations
- Executing rollback procedures

**Skills Required:**
- Infrastructure and DevOps experience
- Database management skills
- Understanding of cloud services (Vercel, AWS, etc.)
- Experience with monitoring tools

**Backup:** DevOps Engineer or Database Administrator

### Security Lead (SL)

**Primary Responsibilities:**
- Assessing security implications
- Implementing security measures
- Coordinating with security vendors
- Ensuring compliance with security policies
- Conducting forensic analysis (if needed)

**Skills Required:**
- Security expertise
- Understanding of compliance requirements
- Forensic analysis skills
- Knowledge of security tools and practices

**Backup:** Security Engineer or CISO

### Business Stakeholder (BS)

**Primary Responsibilities:**
- Representing business interests
- Making business decisions
- Approving customer communications
- Assessing business impact
- Coordinating with executive leadership

**Skills Required:**
- Understanding of business priorities
- Decision-making authority
- Customer empathy
- Strategic thinking

**Backup:** Product Director or COO

## Escalation Paths

### Technical Escalation Path

1. **First Responder**
   - Engineer on call or first person to detect the incident
   - Initial assessment and triage
   - Escalates to Incident Commander if severity warrants

2. **Incident Commander**
   - Assembles response team based on incident type
   - Escalates to Engineering Manager/Director if needed

3. **Engineering Leadership**
   - Engineering Manager/Director
   - CTO/VP of Engineering
   - Involved for SEV1 and SEV2 incidents

4. **Executive Leadership**
   - CEO, COO
   - Involved for SEV1 incidents with significant business impact

### External Escalation Path

1. **Third-Party Vendors**
   - Cloud provider (Vercel)
   - Database provider
   - Authentication provider
   - Payment processor
   - Other critical service providers

2. **Legal/Compliance**
   - Legal counsel
   - Compliance officer
   - Required for security incidents, data breaches, or regulatory concerns

3. **Public Relations**
   - PR team or agency
   - Required for high-visibility incidents with potential brand impact

## Communication Protocols

### Internal Communication

#### Primary Channels

1. **Incident Channel**
   - Dedicated Slack channel created for each incident
   - All team members must join
   - All incident-related communication must happen here
   - Channel naming convention: `#incident-{date}-{short-description}`

2. **Video Conference**
   - For SEV1 and SEV2 incidents
   - Used for war room discussions
   - Recording optional (for post-incident review)

3. **Incident Management System**
   - For tracking incident status
   - Documenting actions taken
   - Assigning tasks
   - Recording timeline

#### Communication Guidelines

1. **Status Updates**
   - Provided by Incident Commander
   - Frequency based on severity level
   - Must include:
     - Current status
     - Actions in progress
     - Blockers or needs
     - Next update time

2. **Technical Discussions**
   - Led by Technical Lead
   - Focus on investigation and resolution
   - Document decisions and actions

3. **Handoffs**
   - Explicit handoff procedure when roles change
   - Documented in incident channel
   - Include status summary and pending actions

### External Communication

#### Primary Channels

1. **Status Page**
   - Public-facing incident status
   - Updated by Communications Lead
   - Approved by Incident Commander

2. **Email Notifications**
   - For direct customer communication
   - Segmented by impact if possible
   - Approved by Business Stakeholder

3. **Social Media**
   - For widespread incidents
   - Managed by Communications Lead
   - Approved by Business Stakeholder and Incident Commander

#### Communication Guidelines

1. **Initial Notification**
   - Sent within timeframe specified by severity level
   - Acknowledge the issue
   - Provide basic information
   - Set expectations for updates

2. **Update Notifications**
   - Frequency based on severity level
   - Include progress made
   - Current status
   - Expected resolution time (if known)

3. **Resolution Notification**
   - Sent when incident is resolved
   - Summary of the issue
   - Impact
   - Actions taken
   - Preventive measures (if appropriate)

## Team Assembly

### Automatic Assembly

For SEV1 and SEV2 incidents, the team is automatically assembled based on on-call rotation:

1. **SEV1 Incidents**
   - All primary roles assembled
   - Engineering leadership notified
   - Executive leadership notified for significant business impact

2. **SEV2 Incidents**
   - Incident Commander
   - Technical Lead
   - Operations Lead
   - Communications Lead
   - Other roles as needed

### Manual Assembly

For SEV3 and SEV4 incidents, the team is assembled as needed:

1. **SEV3 Incidents**
   - Incident Commander
   - Technical Lead
   - Other roles as needed

2. **SEV4 Incidents**
   - Handled by individual engineers
   - Escalated if needed

## Handoff Procedures

For incidents that span multiple shifts or days, a formal handoff procedure is required:

1. **Handoff Briefing**
   - Conducted via video conference
   - All team members present
   - Documented in incident channel

2. **Handoff Documentation**
   - Current status
   - Actions taken
   - Pending actions
   - Known issues
   - Attempted solutions
   - Resources and context

3. **Role-Specific Handoffs**
   - Each role provides specific handoff to their replacement
   - Technical Lead provides detailed technical context
   - Incident Commander ensures continuity of response