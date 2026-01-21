---
name: compliance
description: "Security and compliance skills: security assessment, privacy compliance, access control, threat modeling. Use when: evaluating security, ensuring compliance, assessing privacy risks."
---

# Compliance Skills

## Core Competencies

### 1. Security Assessment

**Best Practices:**
- Identify security threats early (during design)
- Assess threat severity (impact × probability)
- Define security controls (prevention, detection, response)
- Test security controls (penetration testing, etc.)
- Monitor security continuously

**Threat Modeling:**
1. **Identify Assets:** What are we protecting? (data, systems, users)
2. **Identify Threats:** What could go wrong? (OWASP Top 10, etc.)
3. **Assess Risks:** How likely and severe? (risk matrix)
4. **Define Controls:** How do we prevent/detect/respond?
5. **Test Controls:** Do they work? (testing, audits)

**Threat Categories:**
- **Authentication:** Weak passwords, session hijacking
- **Authorization:** Privilege escalation, unauthorized access
- **Data Protection:** Data breaches, data leaks
- **Injection:** SQL injection, XSS, command injection
- **Configuration:** Misconfigured services, exposed secrets

**Security Controls:**
- **Prevention:** Input validation, authentication, encryption
- **Detection:** Logging, monitoring, alerts
- **Response:** Incident response plan, backups

### 2. Privacy Compliance

**Best Practices:**
- Identify PII (Personally Identifiable Information)
- Classify data (public, internal, confidential, restricted)
- Define data retention policies
- Implement data subject rights (GDPR, CCPA)
- Conduct Privacy Impact Assessments (PIAs)

**Data Classification:**
- **Public:** Can be shared publicly
- **Internal:** Company internal only
- **Confidential:** Restricted access, need-to-know
- **Restricted:** Highly sensitive, strict controls

**Privacy Principles:**
- **Minimization:** Collect only what you need
- **Purpose Limitation:** Use data only for stated purpose
- **Storage Limitation:** Delete data when no longer needed
- **Accuracy:** Keep data accurate and up-to-date
- **Security:** Protect data from unauthorized access
- **Transparency:** Inform users about data collection/use

**Compliance Frameworks:**
- **GDPR (EU):** Data protection regulation
- **CCPA (California):** Privacy rights for California residents
- **HIPAA (US):** Healthcare data protection
- **ISO 27701:** Privacy Information Management System

### 3. Access Control

**Best Practices:**
- Principle of least privilege (users get minimum access needed)
- Role-based access control (RBAC)
- Regular access reviews (who has access to what?)
- Audit logging (who accessed what, when?)
- Multi-factor authentication (MFA) for sensitive operations

**Access Control Model:**
- **Roles:** Admin, User, Guest, etc.
- **Permissions:** What can each role do?
- **Resources:** What resources are protected?
- **Policies:** Rules that govern access

**Access Control Checklist:**
- [ ] Roles defined (who can do what)
- [ ] Permissions assigned to roles
- [ ] Resources protected (APIs, data, etc.)
- [ ] Authentication required (login, MFA)
- [ ] Authorization checked (permissions)
- [ ] Audit logging enabled (who, what, when)

### 4. Threat Assessment

**Best Practices:**
- Use threat modeling frameworks (STRIDE, etc.)
- Assess threats regularly (not just at design time)
- Prioritize threats (high impact × high probability)
- Define mitigation strategies
- Test mitigations

**STRIDE Framework:**
- **Spoofing:** Impersonating users or systems
- **Tampering:** Modifying data or code
- **Repudiation:** Denying actions (need logging)
- **Information Disclosure:** Leaking sensitive data
- **Denial of Service:** Making system unavailable
- **Elevation of Privilege:** Gaining unauthorized access

**Threat Assessment Matrix:**
| Threat | Severity | Probability | Mitigation | Status |
|--------|----------|-------------|------------|--------|
| ...    | High/Med/Low | High/Med/Low | ... | open/mitigated |

### 5. Compliance Review

**Best Practices:**
- Define compliance requirements early
- Create compliance checklist
- Review before release (security review gates)
- Document compliance decisions
- Monitor compliance continuously

**Compliance Checklist:**
- [ ] Data classification defined
- [ ] Privacy policy in place
- [ ] Data retention policy defined
- [ ] Access control implemented
- [ ] Security controls in place
- [ ] Audit logging enabled
- [ ] Incident response plan ready
- [ ] Compliance documentation complete

**Review Gates:**
- **Design Review:** Security and privacy considered?
- **Code Review:** Security best practices followed?
- **Pre-Release Review:** All compliance requirements met?
- **Post-Release Review:** Monitoring and incident response ready?

## Output Quality Checklist

When producing artifacts, ensure:
- ✅ Security threats identified and assessed
- ✅ Privacy requirements defined (data classification, retention)
- ✅ Access control model designed (roles, permissions)
- ✅ Compliance checklist completed
- ✅ Review gates defined
- ✅ Mitigation strategies documented

## Common Pitfalls

- **Security as afterthought:** Not considering security during design
- **Weak access control:** Too permissive permissions
- **No data classification:** Not knowing what data is sensitive
- **Missing compliance:** Not checking regulatory requirements
- **No monitoring:** Not detecting security incidents
