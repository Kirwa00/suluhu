  
**SULUHU THERAPY CENTER**

Online Mental Health Platform — Eldoret, Kenya

**SOFTWARE DEVELOPMENT LIFE CYCLE (SDLC) DOCUMENTATION**

System Architecture  |  Technical Specification  |  Deployment Plan  |  Compliance Framework

| Document Version 1.0 — Initial Release | Prepared For Emmanuel Kirwa (Manu) — Founder |
| :---- | :---- |
| **Location** Eldoret, Uasin Gishu County, Kenya | **Date** June 2026 |

| SECTION 1 — EXECUTIVE SUMMARY & PROJECT OVERVIEW |
| :---- |

# **1\. Executive Summary**

Suluhu Therapy Center is a licensed mental health clinic based in Eldoret, Uasin Gishu County, Kenya. This document defines the complete Software Development Life Cycle (SDLC) for building and deploying an online therapy platform that enables patients across the Rift Valley and beyond to access professional mental health services via web and mobile interfaces.

The platform addresses a critical gap in Kenya's mental health ecosystem. With a national prevalence of common mental disorders at approximately 10.3%, and 42% of primary care patients presenting with severe depression, access to qualified therapists remains severely limited — especially in peri-urban and rural areas surrounding Eldoret. Suluhu's digital platform bridges this gap by combining secure video therapy, AI-assisted intake, digital session notes, and MPesa-integrated billing into a single, compliant ecosystem.

## **1.1 Platform Vision**

To become the leading online mental health platform serving the Rift Valley region, connecting Kenyans to qualified, CPB-licensed therapists through an accessible, affordable, and clinically rigorous digital experience.

## **1.2 Key Objectives**

* Deliver HIPAA-equivalent, Kenya Data Protection Act (2019) compliant telehealth sessions

* Onboard CPB-licensed counsellors and psychologists for multi-specialty coverage

* Integrate M-Pesa, Airtel Money, and card payments for seamless Kenyan billing

* Enable AI-powered triage, session scheduling, and outcome tracking

* Support Swahili and English language interfaces for maximum accessibility

* Scale to serve Eldoret, Nakuru, Kisumu, and Nairobi within 18 months

## **1.3 Regulatory Compliance Anchors**

| Regulation / Authority | Application to Platform |
| :---- | :---- |
| Counsellors & Psychologists Act, 2014 | All therapists must hold valid CPB registration and annual license |
| Kenya Mental Health Act, 2022 | Governs care standards, patient rights, voluntary treatment protocols |
| Kenya Data Protection Act, 2019 | Governs storage, processing, sharing of all patient personal health data |
| KMPDC Mental Health Rules, 2022 | Licensing of the institution as a registered mental health facility |
| Consumer Protection Act, 2012 | Transparent billing, cancellation rights, informed consent online |
| ICT Authority (Kenya) | Compliance for digital health platforms and cloud data residency |

| SECTION 2 — REQUIREMENTS ANALYSIS |
| :---- |

# **2\. Requirements Analysis**

## **2.1 Stakeholder Identification**

| Stakeholder | Role | Primary Need | Priority |
| :---- | :---- | :---- | :---- |
| Patients / Clients | Service Consumer | Book sessions, attend therapy, access resources | Critical |
| Therapists / Counsellors | Service Provider | Manage caseload, conduct sessions, write notes | Critical |
| Clinic Admin | Operations | Scheduling, billing oversight, compliance reports | High |
| Super Admin (Founder) | Owner / Governance | Platform analytics, therapist management, revenue | High |
| Kenya CPB Board | Regulatory | Verify therapist licensing, audit readiness | High |
| Insurance Providers | Payer | Claims submission, pre-auth, billing codes | Medium |
| Referral Doctors | Medical Ecosystem | Refer patients, receive outcome summaries | Medium |

## **2.2 Functional Requirements**

### **2.2.1 Patient Module**

* Self-registration with NIN/national ID verification option

* AI-powered onboarding intake (PHQ-9, GAD-7, CAGE questionnaires)

* Therapist discovery: filter by specialty, language, gender, availability

* Session booking: real-time calendar availability, timezone-aware (EAT)

* Video therapy sessions (1:1, group) with waiting room

* In-session chat, file sharing, and digital whiteboard

* Secure messaging between sessions

* Session recordings (opt-in, encrypted)

* Psychoeducation library: articles, videos, exercises

* Mood tracking journal with visual dashboards

* Crisis support escalation with emergency contacts \+ Befrienders Kenya hotline

* Billing: M-Pesa STK Push, Airtel Money, Visa/Mastercard, insurance claims

* Session history, invoices, and digital prescription access

### **2.2.2 Therapist Module**

* Profile creation with CPB license number verification

* Availability calendar management with buffer time configuration

* Patient intake review and case assignment acceptance

* Session dashboard: upcoming, active, past sessions

* Clinical notes (SOAP format): structured, encrypted, patient-linked

* Treatment plan creation, goal tracking, outcome measurement tools

* Secure messaging with patients

* Supervision request workflow for complex cases

* Earnings dashboard with payout via M-Pesa / bank transfer

* Continuing Professional Development (CPD) hour tracker

### **2.2.3 Admin Module**

* Therapist onboarding and CPB license validation workflow

* Appointment scheduling oversight and conflict resolution

* Platform revenue dashboard: gross, net, per-therapist splits

* Patient waitlist management

* Compliance audit log viewer (immutable)

* Insurance panel management and claims processing

* Content management: psychoeducation library, crisis resources

* System health monitoring dashboard

## **2.3 Non-Functional Requirements**

| Requirement | Specification |
| :---- | :---- |
| Availability | 99.5% uptime SLA; auto-failover across availability zones |
| Performance | Page load \< 2s on 3G (Eldoret/rural connectivity); video latency \< 150ms |
| Security | AES-256 encryption at rest; TLS 1.3 in transit; Zero Trust architecture |
| Scalability | Support 10,000 concurrent users; horizontal auto-scaling on AWS/GCP |
| Data Residency | Primary data stored in Africa (AWS af-south-1 Cape Town or equivalent) |
| Accessibility | WCAG 2.1 AA; Swahili \+ English language support |
| Backup | Daily encrypted backups; 30-day retention; RTO \< 4 hours, RPO \< 1 hour |
| Audit Trail | All PHI access logged with immutable audit trail (7-year retention) |
| Mobile Support | Progressive Web App (PWA) \+ native iOS/Android via React Native |
| Session Quality | Adaptive bitrate video; bandwidth detection; fallback to audio-only |

| SECTION 3 — SYSTEM ARCHITECTURE |
| :---- |

# **3\. System Architecture**

## **3.1 Architecture Overview**

The Suluhu platform adopts a Cloud-Native Microservices Architecture deployed on AWS with a multi-region strategy. The frontend is a React.js Single Page Application (SPA) with a React Native mobile wrapper. The backend consists of independently deployable microservices communicating via REST APIs and an event-driven message bus (AWS SQS/SNS). Each service owns its data store, enabling independent scaling and fault isolation.

## **3.2 Architecture Layers**

### **Layer 1 — Client / Presentation Tier**

* Web App: React.js 18+ with TypeScript, Tailwind CSS, PWA-enabled

* Mobile App: React Native (iOS 14+ / Android 8+) with Expo managed workflow

* Admin Dashboard: React.js with Role-Based Access Control (RBAC) UI

* CDN: AWS CloudFront for static asset delivery; Edge caching in Nairobi POP

### **Layer 2 — API Gateway & Security**

* API Gateway: AWS API Gateway (REST \+ WebSocket APIs)

* Authentication: AWS Cognito (OAuth 2.0 / OIDC) with MFA enforcement

* JWT tokens with short expiry (15 min access / 7-day refresh)

* Rate limiting: 100 req/min per user; 1000 req/min per therapist

* WAF (Web Application Firewall): AWS WAF with OWASP Top 10 rule sets

* DDoS Protection: AWS Shield Standard \+ Advanced

### **Layer 3 — Microservices Backend**

| Service | Responsibility & Tech Stack |
| :---- | :---- |
| User Service | Registration, authentication, profile management — Node.js \+ PostgreSQL |
| Appointment Service | Booking engine, calendar sync, reminders — Node.js \+ PostgreSQL \+ Redis |
| Video Session Service | WebRTC orchestration, room management, recording — Node.js \+ Daily.co API |
| Messaging Service | Real-time secure chat, file attachments — Node.js \+ Socket.io \+ MongoDB |
| Clinical Notes Service | SOAP notes, treatment plans, outcome measures — Node.js \+ PostgreSQL (encrypted) |
| Billing & Payments Service | M-Pesa STK, Airtel, Stripe, insurance claims — Node.js \+ PostgreSQL |
| Notification Service | SMS (Africa's Talking), Email (SES), Push (FCM/APNs) — Node.js \+ SQS |
| AI Triage Service | PHQ-9/GAD-7 scoring, risk stratification, therapist matching — Python \+ FastAPI |
| Content Service | Psychoeducation library, articles, videos — Node.js \+ S3 \+ CloudFront |
| Analytics Service | Platform metrics, clinical outcomes, revenue reporting — Python \+ Redshift |
| Audit Service | Immutable audit log for all PHI access — Node.js \+ DynamoDB (write-once) |
| Admin Service | Therapist onboarding, compliance checks, system config — Node.js \+ PostgreSQL |

### **Layer 4 — Data Tier**

* Primary DB: AWS RDS PostgreSQL 15 (Multi-AZ, encrypted at rest) — structured clinical data

* Cache: AWS ElastiCache (Redis 7\) — sessions, availability slots, rate limiting

* Document Store: AWS DocumentDB (MongoDB-compatible) — chat messages, unstructured content

* Object Storage: AWS S3 (server-side encryption SSE-KMS) — session recordings, documents, media

* Data Warehouse: Amazon Redshift — analytics, clinical outcome reporting

* Search: Amazon OpenSearch — therapist discovery, content library search

* Key Management: AWS KMS — encryption key lifecycle management

### **Layer 5 — Infrastructure & DevOps**

* Container Orchestration: AWS EKS (Kubernetes) with auto-scaling node groups

* Container Registry: AWS ECR — Docker images for all microservices

* IaC (Infrastructure as Code): Terraform \+ AWS CDK

* CI/CD: GitHub Actions → Docker Build → ECR Push → EKS Rolling Deploy

* Monitoring: AWS CloudWatch \+ Prometheus \+ Grafana dashboards

* Logging: AWS CloudWatch Logs \+ ELK Stack (Elasticsearch, Logstash, Kibana)

* Secret Management: AWS Secrets Manager \+ Parameter Store

* Backup: AWS Backup — automated daily snapshots, cross-region replication

## **3.3 Video Conferencing Architecture**

The video layer uses WebRTC via the Daily.co HIPAA-compliant video API (with BAA available). This avoids the complexity of building WebRTC signaling servers while ensuring sub-150ms latency across East Africa. The Suluhu backend generates short-lived room tokens per session, validates therapist-patient pairing, and logs session metadata.

Fallback stack: If Daily.co experiences issues, the system falls back to Twilio Video (HIPAA-eligible). Audio-only fallback is triggered automatically when bandwidth drops below 100kbps — critical for low-connectivity areas outside Eldoret.

## **3.4 Data Flow — Patient Session Journey**

| Step | System Action |
| :---- | :---- |
| 1\. Patient registers | User Service creates account → Cognito identity → PHQ-9 intake via AI Triage Service |
| 2\. Therapist match | AI Triage Service scores intake → ranks therapist matches → patient selects |
| 3\. Book session | Appointment Service creates booking → Notification Service sends confirmation SMS \+ email |
| 4\. Payment | Billing Service initiates M-Pesa STK Push → webhook confirms → appointment activates |
| 5\. Session day | Reminder sent (24h, 1h, 15min) → patient/therapist join video room → Audit Service logs entry |
| 6\. In-session | Video/audio via WebRTC → encrypted chat → therapist can share psychoeducation content |
| 7\. Post-session | Therapist writes SOAP note (Clinical Notes Service) → mood journal prompt sent to patient |
| 8\. Billing & payout | Platform fee deducted → therapist earnings queued → weekly M-Pesa/bank payout |

| SECTION 4 — TECHNOLOGY STACK |
| :---- |

# **4\. Technology Stack**

## **4.1 Frontend Stack**

| Technology | Purpose & Justification |
| :---- | :---- |
| React.js 18 \+ TypeScript | Component-based SPA; TypeScript ensures type safety in clinical data handling |
| React Native \+ Expo | Single codebase for iOS \+ Android mobile app; faster iteration |
| Tailwind CSS | Utility-first styling; rapid UI development; mobile-first responsive design |
| TanStack Query (React Query) | Server-state management; caching; background refetching for real-time data |
| Zustand | Lightweight global state management for auth, session state, UI flags |
| React Hook Form \+ Zod | Form handling \+ runtime validation for clinical intake forms |
| i18next | Internationalization: English \+ Swahili language switching |
| Daily.co React SDK | Pre-built WebRTC video UI components; HIPAA-compliant session management |
| Socket.io Client | Real-time secure chat, typing indicators, session status updates |
| Recharts \+ D3.js | Mood tracking visualizations, clinical outcome dashboards |
| Workbox (PWA) | Offline support, service workers, installable web app for low-connectivity areas |

## **4.2 Backend Stack**

| Technology | Purpose |
| :---- | :---- |
| Node.js 20 LTS \+ Express.js | Primary microservice runtime; async I/O for high concurrency |
| Python 3.12 \+ FastAPI | AI/ML services: triage scoring, NLP sentiment analysis, outcome prediction |
| PostgreSQL 15 (AWS RDS) | ACID-compliant relational DB for clinical records, appointments, billing |
| Redis 7 (ElastiCache) | Session caching, rate limiting, real-time availability slots |
| MongoDB (DocumentDB) | Chat messages, unstructured session data, content library |
| Prisma ORM | Type-safe database access layer for PostgreSQL microservices |
| AWS SQS \+ SNS | Asynchronous message queue for notifications, billing events, audit logs |
| JWT \+ AWS Cognito | Stateless auth tokens; OAuth 2.0 / OIDC identity provider |
| Stripe \+ Safaricom Daraja API | Card payments \+ M-Pesa STK Push & C2B integration |
| Africa's Talking SMS API | SMS notifications (appointment reminders, OTP) — Kenya-optimized |
| AWS SES | Transactional email (booking confirmations, receipts, session summaries) |
| OpenAI API (GPT-4o) | AI triage assistant, psychoeducation content suggestions, session summaries |

## **4.3 Infrastructure Stack**

| Technology | Role |
| :---- | :---- |
| AWS EKS (Kubernetes) | Container orchestration — auto-scaling, self-healing microservices |
| AWS CloudFront \+ S3 | CDN for web app, media, psychoeducation content delivery |
| AWS API Gateway | REST \+ WebSocket API management, throttling, usage plans |
| AWS Cognito | User pools, identity pools, MFA, social login (Google, Apple) |
| AWS KMS \+ Secrets Manager | Encryption key management, secure credential storage |
| AWS WAF \+ Shield | DDoS protection, OWASP rule sets, IP reputation filtering |
| Terraform \+ AWS CDK | Infrastructure as Code — reproducible, version-controlled environments |
| GitHub Actions | CI/CD pipelines: lint → test → build → deploy |
| Prometheus \+ Grafana | Real-time metrics dashboards: API latency, error rates, DB performance |
| ELK Stack (Elasticsearch) | Centralized logging, log analysis, security event monitoring |
| AWS Backup | Automated cross-region backup for RDS, S3, DynamoDB |

| SECTION 5 — DATABASE SCHEMA DESIGN |
| :---- |

# **5\. Database Schema Design**

## **5.1 Core Entities**

| Entity / Table | Key Fields |
| :---- | :---- |
| users | id, email, phone, password\_hash, role (patient/therapist/admin), is\_verified, created\_at |
| patient\_profiles | user\_id, date\_of\_birth, gender, county, emergency\_contact, insurance\_provider\_id |
| therapist\_profiles | user\_id, cpb\_license\_number, cpb\_expiry, specialties\[\], languages\[\], session\_rate\_ksh |
| appointments | id, patient\_id, therapist\_id, scheduled\_at, duration\_mins, status, video\_room\_token, payment\_id |
| payments | id, appointment\_id, amount\_ksh, method (mpesa/airtel/card), mpesa\_checkout\_id, status, paid\_at |
| clinical\_notes | id, appointment\_id, therapist\_id, note\_type (SOAP), S\_subjective, O\_objective, A\_assessment, P\_plan, created\_at |
| treatment\_plans | id, patient\_id, therapist\_id, goals\[\], interventions\[\], review\_date, status |
| intake\_assessments | id, patient\_id, phq9\_score, gad7\_score, cage\_score, risk\_level, completed\_at |
| mood\_journals | id, patient\_id, mood\_score (1-10), notes, tags\[\], logged\_at |
| messages | id, conversation\_id, sender\_id, body\_encrypted, file\_url, sent\_at, read\_at |
| audit\_logs | id, user\_id, action, resource\_type, resource\_id, ip\_address, user\_agent, timestamp |
| therapist\_availability | id, therapist\_id, day\_of\_week, start\_time, end\_time, is\_available, buffer\_mins |
| session\_recordings | id, appointment\_id, s3\_key, duration\_secs, encryption\_key\_id, consent\_given, created\_at |
| notifications | id, user\_id, channel (sms/email/push), template, payload, status, sent\_at |

## **5.2 Data Security Controls**

* Column-level encryption on: clinical\_notes (all SOAP fields), messages.body\_encrypted, patient\_profiles.date\_of\_birth

* Row-level security (RLS) in PostgreSQL: therapists can only query their own patients' records

* AES-256-GCM encryption for session recordings stored in S3

* Separate encryption keys per patient (envelope encryption via AWS KMS)

* Audit log table is write-only via dedicated service account — no UPDATE or DELETE permissions

* Database credentials rotated every 90 days via AWS Secrets Manager automatic rotation

| SECTION 6 — SDLC PHASES & PROJECT PLAN |
| :---- |

# **6\. SDLC Methodology & Phases**

Suluhu platform development follows an Agile-Waterfall Hybrid ("Wagile") approach: structured waterfall phases for architecture, compliance, and infrastructure decisions; Agile 2-week sprints for feature development within each phase. This balances regulatory rigor with rapid iteration.

## **Phase 1 — Planning & Discovery (Weeks 1–4)**

| Activity | Deliverable |
| :---- | :---- |
| Stakeholder workshops (therapists, patients, admin) | Validated requirements document |
| Regulatory review: CPB, KMPDC, Data Protection Act | Compliance checklist \+ legal opinion |
| Competitive analysis: BetterHelp, Amsha, local alternatives | Differentiation strategy |
| Technology feasibility: M-Pesa Daraja API, video latency tests | Tech stack decision record |
| Resource planning: dev team, budget, timeline | Project charter \+ cost estimate |
| Risk assessment matrix | Risk register with mitigation plans |

## **Phase 2 — System Design (Weeks 5–8)**

| Activity | Deliverable |
| :---- | :---- |
| Architecture design (this document) | Complete SDLC & architecture documentation |
| Database schema design \+ ERD | Reviewed, approved DB schema |
| UI/UX wireframes \+ prototypes (Figma) | High-fidelity mockups for all user roles |
| API contract design (OpenAPI 3.0) | API specification document for all microservices |
| Security design: threat model, data classification | Security architecture document |
| Infrastructure design: AWS architecture diagram | IaC templates (Terraform) |
| Integration specs: M-Pesa, Daily.co, Africa's Talking | Integration test plans |

## **Phase 3 — Development (Weeks 9–28) — Agile Sprints**

| Sprint | Features Delivered |
| :---- | :---- |
| Sprint 1–2 (Wk 9–12) | Auth system, user registration, therapist profile creation, CPB license verification flow |
| Sprint 3–4 (Wk 13–16) | Appointment booking engine, therapist availability calendar, M-Pesa payment integration |
| Sprint 5–6 (Wk 17–20) | Video session module (Daily.co), waiting room, in-session chat, session recording |
| Sprint 7–8 (Wk 21–24) | Clinical notes (SOAP), treatment plans, AI triage intake (PHQ-9/GAD-7), mood journal |
| Sprint 9–10 (Wk 25–28) | Admin dashboard, analytics, notification system, psychoeducation content, PWA \+ mobile app |

## **Phase 4 — Testing & QA (Weeks 27–32, parallel)**

| Test Type | Scope & Tools |
| :---- | :---- |
| Unit Testing | Jest (Node.js), Pytest (Python) — minimum 80% code coverage |
| Integration Testing | Supertest for API endpoints, database transaction tests |
| End-to-End Testing | Playwright — full patient and therapist user journeys |
| Security Testing | OWASP ZAP penetration testing, Semgrep SAST, Snyk dependency scanning |
| Performance Testing | k6 load testing — simulate 1,000 concurrent video sessions |
| Accessibility Testing | axe-core automated scan \+ manual keyboard/screen reader testing |
| Clinical UAT | CPB-licensed therapists validate clinical note workflows, intake forms |
| Patient UAT | Pilot group of 20 patients test full booking-to-session journey |
| HIPAA/Data Protection Audit | Third-party security audit against Kenya Data Protection Act requirements |

## **Phase 5 — Deployment & Launch (Weeks 33–36)**

| Activity | Detail |
| :---- | :---- |
| Staging environment deployment | Full production mirror on AWS — final regression testing |
| Data migration (if applicable) | Migrate any existing patient records from current systems |
| Therapist onboarding | Onboard 10 founding therapists with CPB license verification |
| Soft launch (beta) | Invite 100 patients from Eldoret; monitor closely for 2 weeks |
| Full launch | Open registration; activate marketing; enable M-Pesa live payments |
| Post-launch monitoring | 24/7 CloudWatch alerting; weekly review meetings for 8 weeks |

## **Phase 6 — Maintenance & Iteration (Ongoing)**

* Monthly security patch updates (OS, runtime, dependencies)

* Quarterly compliance review against updated CPB / Data Protection Act guidelines

* Feature roadmap iterations based on therapist and patient feedback (NPS surveys)

* Annual third-party penetration testing

* CPB license renewal tracking for all onboarded therapists

| SECTION 7 — SECURITY ARCHITECTURE |
| :---- |

# **7\. Security Architecture**

## **7.1 Zero Trust Security Model**

Suluhu implements a Zero Trust Architecture (ZTA): no user, device, or service is trusted by default — all access is verified continuously. Every API call requires a valid JWT token regardless of network origin. Microservices authenticate to each other via AWS IAM roles and service-to-service mTLS certificates.

## **7.2 Authentication & Authorization**

* Multi-Factor Authentication (MFA): mandatory for all therapists and admins; optional but encouraged for patients

* JWT access tokens: 15-minute expiry; refresh tokens: 7-day expiry stored as HttpOnly cookies

* Role-Based Access Control (RBAC): Patient | Therapist | Admin | Super Admin

* Attribute-Based Access Control (ABAC): therapists can only access records for their assigned patients

* Social login: Google (via AWS Cognito) — no Facebook due to GDPR/data privacy concerns

* Session invalidation on logout: refresh token blocklisted in Redis

## **7.3 Data Protection Controls**

| Control | Implementation |
| :---- | :---- |
| Encryption in Transit | TLS 1.3 enforced on all API calls; HSTS headers; certificate pinning on mobile app |
| Encryption at Rest | AES-256-GCM on RDS (KMS-managed); S3 SSE-KMS; Redis AUTH \+ encryption |
| PHI Field Encryption | Application-layer encryption on clinical note fields before DB storage |
| Key Management | AWS KMS with yearly automatic key rotation; separate keys per patient |
| Data Minimization | Collect only clinically necessary data; anonymize analytics data |
| Right to Erasure | Patient data deletion workflow within 30 days of request (Data Protection Act) |
| Data Residency | All PHI stored in AWS af-south-1 (Cape Town); no cross-border transfer without consent |
| Audit Logging | All PHI read/write operations logged to immutable DynamoDB audit table |

## **7.4 Video Session Security**

* Daily.co HIPAA-eligible plan with Business Associate Agreement (BAA) signed

* Short-lived room tokens (15-minute expiry) generated per session by backend

* Token bound to specific patient\_id and therapist\_id — prevents unauthorized joins

* Waiting room enforced: therapist admits patient explicitly

* Session recordings: AES-256 encrypted in S3 with patient-specific KMS key; opt-in consent required

* No recording stored if patient revokes consent mid-session

## **7.5 Compliance Summary**

| Compliance Framework | Status & Controls |
| :---- | :---- |
| Kenya Data Protection Act, 2019 | Data minimization, consent management, DPO designation, breach notification (72h) |
| HIPAA Technical Safeguards | Encryption, audit controls, automatic logoff, authentication (applied as best practice) |
| OWASP Top 10 | WAF rules, input validation, parameterized queries, CSP headers, CSRF tokens |
| ISO 27001 (aligned) | Information security management controls across all services |
| WCAG 2.1 AA | Accessibility: keyboard nav, screen reader, color contrast, font scaling |
| PCI DSS (via Stripe) | Card data never stored on Suluhu servers; Stripe handles PCI scope |

| SECTION 8 — THIRD-PARTY INTEGRATIONS |
| :---- |

# **8\. Third-Party Integrations**

## **8.1 Payment Integrations**

| Integration | Details |
| :---- | :---- |
| Safaricom M-Pesa Daraja API | STK Push for patient payments; B2C for therapist payouts; C2B for paybill payments |
| Airtel Money | Alternative mobile money for Airtel subscribers in Eldoret/Rift Valley |
| Stripe | Visa/Mastercard card payments for diaspora patients or card-preference users |
| M-Pesa Sandbox | Used in development/staging environment before live key activation |
| Webhook Handlers | All payment events trigger webhook → billing service → appointment activation |

## **8.2 Communication Integrations**

| Integration | Details |
| :---- | :---- |
| Africa's Talking SMS API | Appointment reminders, OTP verification, crisis alerts — Kenya shortcode |
| AWS SES | Transactional email: booking confirmations, invoices, session summaries |
| Firebase Cloud Messaging | Push notifications for Android and iOS mobile apps |
| Apple Push Notification Service | iOS push notifications for session reminders and messages |
| Daily.co Video API | HIPAA-eligible WebRTC video sessions; built-in recording; bandwidth adaptation |
| Socket.io (self-hosted) | Real-time secure in-platform chat, typing indicators, online presence |

## **8.3 Clinical & AI Integrations**

| Integration | Details |
| :---- | :---- |
| OpenAI GPT-4o API | AI intake assistant, psychoeducation summaries, session note drafting suggestions |
| PHQ-9 / GAD-7 / CAGE | Validated clinical screening questionnaires integrated into intake flow |
| WHO mhGAP Guidelines API | Kenya Ministry of Health-aligned clinical decision support |
| Befrienders Kenya | Crisis escalation: platform auto-provides hotline (0800 723 253\) at risk flags |
| CPB License Verification | API integration with CPB portal for real-time therapist license status checks |

| SECTION 9 — API DESIGN SPECIFICATION |
| :---- |

# **9\. API Design**

All APIs follow RESTful conventions with OpenAPI 3.0 documentation. WebSocket endpoints are used for real-time features (chat, video signaling). All responses use standard HTTP status codes and a consistent JSON envelope.

## **9.1 Standard Response Format**

{ "success": true, "data": {...}, "meta": { "timestamp": "ISO8601", "version": "v1" }, "error": null }

## **9.2 Key API Endpoints**

| Endpoint | Method \+ Description |
| :---- | :---- |
| POST /api/v1/auth/register | Patient/therapist registration; returns JWT \+ refresh token |
| POST /api/v1/auth/login | Credentials → JWT access token \+ refresh token |
| POST /api/v1/auth/mfa/verify | OTP verification for MFA; required for therapists and admins |
| GET /api/v1/therapists | List available therapists; filter by specialty, language, availability, price |
| GET /api/v1/therapists/:id/availability | Return available time slots for a therapist (next 30 days) |
| POST /api/v1/appointments | Create appointment booking; triggers payment initiation |
| POST /api/v1/payments/mpesa/stk-push | Initiate M-Pesa STK Push; returns checkout\_request\_id |
| POST /api/v1/payments/mpesa/callback | M-Pesa webhook: payment confirmation → appointment activation |
| GET /api/v1/sessions/:id/token | Generate short-lived Daily.co room token for video session |
| POST /api/v1/clinical-notes | Create SOAP note for a completed session (therapist only) |
| GET /api/v1/patients/:id/notes | Retrieve clinical notes for a patient (therapist \+ patient, ABAC enforced) |
| POST /api/v1/intake/assessments | Submit PHQ-9/GAD-7/CAGE answers; returns AI risk score \+ therapist matches |
| GET /api/v1/mood-journal | Retrieve patient mood entries with trend data |
| POST /api/v1/mood-journal | Log new mood entry (score 1-10, notes, tags) |
| WS /ws/chat/:conversationId | WebSocket: real-time encrypted messaging between patient and therapist |
| GET /api/v1/admin/compliance/audit-log | Paginated audit log viewer (admin only) |
| GET /api/v1/therapists/:id/earnings | Earnings summary with payout history (therapist own data only) |

| SECTION 10 — DEPLOYMENT & CI/CD PIPELINE |
| :---- |

# **10\. Deployment Architecture & CI/CD**

## **10.1 Environment Strategy**

| Environment | Purpose & Configuration |
| :---- | :---- |
| Development (local) | Docker Compose; LocalStack for AWS mocking; M-Pesa sandbox credentials |
| Staging (AWS) | 1:1 mirror of production; used for UAT and pre-release testing; separate Cognito pool |
| Production (AWS) | Multi-AZ EKS deployment; live M-Pesa; CloudFront CDN; full monitoring |
| Disaster Recovery (AWS) | Cross-region replication to eu-west-1 (Ireland); cold standby; RTO \< 4 hours |

## **10.2 CI/CD Pipeline**

* 1\. Developer pushes code to feature branch on GitHub

* 2\. GitHub Actions triggers on pull request: ESLint \+ TypeScript type-check \+ unit tests

* 3\. On merge to main: Docker image built → pushed to AWS ECR with SHA tag

* 4\. Terraform plan generated → reviewed by senior engineer

* 5\. On approval: kubectl rolling update on EKS staging → smoke tests run

* 6\. Manual gate: QA sign-off required before production promotion

* 7\. Production deploy: EKS rolling update (zero-downtime); health checks on each pod

* 8\. Post-deploy: CloudWatch synthetic canaries verify key endpoints for 30 minutes

## **10.3 Kubernetes Deployment Configuration**

Each microservice runs as a Kubernetes Deployment with:

* Minimum 2 replicas (high availability across AZs)

* Resource limits: 512MB RAM, 0.5 CPU per pod baseline; auto-scales to 4 replicas under load

* Health checks: /health liveness probe (30s interval); /ready readiness probe

* Pod Disruption Budget: ensures at least 1 pod running during rolling updates

* Network Policies: each service can only receive traffic from authorized services

| SECTION 11 — UI/UX DESIGN PRINCIPLES |
| :---- |

# **11\. UI/UX Design Principles**

## **11.1 Design Philosophy**

Suluhu's design language is calm, trustworthy, and clinically appropriate. Mental health platforms must avoid visual stress — no bright reds, aggressive CTAs, or overwhelming information density. The design uses soft greens and blues to convey calm professionalism, with ample white space and clear typography.

## **11.2 Design System**

| Element | Specification |
| :---- | :---- |
| Primary Brand Colors | \#1B4F8C (deep trust blue), \#0E6655 (calm teal), \#2E86AB (action accent) |
| Typography | Inter for UI text (high readability); sizes: 14px body, 18px subheads, 24px+ headings |
| Spacing System | 8px base grid; consistent 16px, 24px, 32px spacing throughout |
| Component Library | Custom components built on Radix UI primitives \+ Tailwind CSS classes |
| Icon System | Lucide React icons — consistent, accessible, crisp at all sizes |
| Form Design | Clear labels above fields; inline validation; progress indicators on multi-step forms |
| Loading States | Skeleton loaders (not spinners) for clinical content — reduces anxiety |
| Error States | Friendly error messages — no technical jargon; always provide a next action |

## **11.3 Key User Flows**

### **Patient Onboarding Flow**

1. Landing page: "Get started" → registration form (name, phone, email)

2. OTP verification via Africa's Talking SMS

3. AI-guided intake: "How are you feeling?" → PHQ-9 questions (conversational UI)

4. Risk score computed → therapist recommendations displayed

5. Select therapist → view profile, specialties, reviews, availability

6. Choose session time → payment (M-Pesa STK push appears on phone)

7. Confirmation screen → add to calendar → reminder set

### **Therapist Session Flow**

8. Session dashboard: upcoming session widget with 15-minute pre-launch

9. Review patient intake summary before session starts

10. Join video room → patient admitted from waiting room

11. Session ends → SOAP note template auto-populated with session metadata

12. Submit note → treatment plan updated → mood check sent to patient

## **11.4 Accessibility**

* WCAG 2.1 Level AA compliance across all interfaces

* Full keyboard navigation — no mouse-only interactions

* Screen reader optimized: ARIA labels on all interactive elements

* Color contrast ratio minimum 4.5:1 for normal text; 3:1 for large text

* Font size scaling: user can increase to 150% without layout breakage

* Swahili language toggle: all clinical forms, intake questionnaires, and UI translated

* Low-bandwidth mode: disable video previews, compress image assets, text-first rendering

| SECTION 12 — AI & CLINICAL INTELLIGENCE FEATURES |
| :---- |

# **12\. AI & Clinical Intelligence**

## **12.1 AI Triage Engine**

The intake AI service uses validated clinical screening tools (PHQ-9 for depression, GAD-7 for anxiety, CAGE for substance use) combined with a conversational UI powered by GPT-4o. The AI guides patients through questionnaires in a supportive, natural dialogue rather than a cold form-filling experience.

Risk Stratification Output:

| Risk Level | PHQ-9 Score | Action Triggered |
| :---- | :---- | :---- |
| Minimal | 0–4 | Self-help resources recommended; optional therapist match |
| Mild | 5–9 | Therapist recommendation with 1-week booking window |
| Moderate | 10–14 | Priority therapist match; booking encouraged within 48 hours |
| Moderately Severe | 15–19 | Urgent match; admin notified; same-day availability shown |
| Severe | 20–27 | Crisis protocol: Befrienders Kenya hotline shown immediately; admin alerted |

## **12.2 AI Session Assistant**

* Pre-session: generates patient summary from intake scores \+ previous session notes (therapist view only)

* Post-session: suggests SOAP note structure based on session duration and pre-session context

* Content recommendations: suggests psychoeducation resources based on patient diagnosis tags

## **12.3 Clinical Outcome Analytics**

The Analytics Service tracks clinical outcomes over time using standardized measurement tools:

* PHQ-9 trend tracking across sessions — visualized for both patient and therapist

* GAD-7 anxiety score trends

* Session attendance rate and dropout risk prediction (ML model)

* Platform-level: de-identified, aggregated outcome reports for clinical governance

| SECTION 13 — BUSINESS MODEL & REVENUE |
| :---- |

# **13\. Business Model & Revenue Architecture**

## **13.1 Revenue Streams**

| Revenue Stream | Model |
| :---- | :---- |
| Session Commission | Platform takes 20–30% of each session fee; therapists set their rate (KES 1,000–5,000/session) |
| Subscription (Patients) | Premium tier: KES 800/month — unlimited messaging, mood tracking analytics, priority booking |
| Subscription (Therapists) | Pro tier: KES 2,000/month — advanced analytics, CPD tracker, supervision marketplace access |
| Corporate Wellness Packages | B2B: Employee Assistance Programmes (EAP) with Eldoret-based employers |
| Insurance Panels | Partner with UAP, Jubilee, APA insurance for insured patient billing |
| Content Marketplace | Therapist-created psychoeducation courses sold to patients |
| API Licensing | License triage AI and scheduling engine to other Kenyan health clinics |

## **13.2 Pricing Strategy**

| Tier | Target Audience & Price |
| :---- | :---- |
| Free | Intake assessment \+ 1 free 30-min session \+ self-help content library |
| Pay-Per-Session | KES 1,200–4,500 per session based on therapist level |
| Monthly Wellness (Patient) | KES 800/month — 2 sessions included \+ messaging \+ premium content |
| Professional (Therapist) | KES 2,000/month — full analytics \+ CPD tracking \+ supervision access |
| Corporate EAP | KES 15,000–50,000/month per organization — 50–200 employees covered |

| SECTION 14 — RISK REGISTER |
| :---- |

# **14\. Risk Register**

| Risk | Likelihood | Impact | Mitigation |
| :---- | :---- | :---- | :---- |
| Low internet penetration in rural Rift Valley | High | High | PWA offline mode; audio-only fallback; WhatsApp scheduling option |
| M-Pesa API downtime | Medium | High | Airtel Money fallback; card backup; pending payment retry queue |
| CPB non-compliance (unlicensed therapists) | Low | Critical | Automated license verification API \+ manual admin review before onboarding |
| Patient data breach | Low | Critical | Zero Trust architecture; encryption; annual pen testing; DPA incident response plan |
| Daily.co video service outage | Low | High | Twilio Video hot-failover; session reschedule workflow auto-triggered |
| Therapist attrition / supply shortage | Medium | High | Locum marketplace; referral incentives; CPD offerings to attract quality therapists |
| Regulatory change (new digital health law) | Medium | Medium | Quarterly compliance review; legal retainer on Kenya health law |
| Competition from well-funded platforms | Medium | Medium | Rift Valley geographic focus; Swahili UX; local therapist community; price positioning |
| Crisis patient mismanaged via platform | Low | Critical | Mandatory crisis protocol; Befrienders Kenya integration; admin alert system; liability insurance |
| AWS region outage (af-south-1) | Very Low | High | Cross-region DR in eu-west-1; RTO \< 4 hours; daily automated backups |

| SECTION 15 — AI SYSTEM PROMPTS & CLINICAL LOGIC |
| :---- |

# **15\. Detailed AI System Prompts**

## **15.1 Patient Intake AI Assistant Prompt**

The following is the system prompt used for the GPT-4o-powered intake assistant:

| SYSTEM PROMPT: Suluhu Intake Assistant You are Asilimia, a warm and empathetic intake assistant for Suluhu Therapy Center, a licensed mental health clinic in Eldoret, Kenya. Your role is to gently guide new patients through an intake assessment to understand how they are feeling and connect them with the right therapist. GUIDELINES: \- Speak in a calm, non-clinical tone. Avoid psychiatric jargon. \- Support both English and Swahili responses. Match the patient's language. \- Administer PHQ-9 questions one at a time, rephrased conversationally. \- If a patient expresses suicidal ideation at ANY point, immediately output the trigger: CRISIS\_ALERT and provide the Befrienders Kenya number: 0800 723 253\. \- Never diagnose. You gather information to help our clinical team, not to make medical judgments. \- Be especially sensitive to stigma around mental health in Kenya. Normalize help-seeking behavior. \- At the end of intake, output a structured JSON object: { phq9\_score, gad7\_score, primary\_concern, risk\_level, recommended\_specialties\[\] } |
| :---- |

## **15.2 Clinical Note Drafting Prompt**

| SYSTEM PROMPT: SOAP Note Drafting Assistant You are a clinical documentation assistant for Suluhu Therapy Center. You help licensed therapists draft SOAP notes efficiently and accurately after therapy sessions. Given: \[session\_duration\], \[patient\_presenting\_concerns\], \[therapist\_modality\], \[intake\_PHQ9\_score\], \[previous\_plan\_goals\] Draft a SOAP note structure with placeholders. Use CBT/psychodynamic language appropriate to the therapist's stated modality. Note must be editable — this is a DRAFT ONLY. Therapist reviews and finalizes before submission. Output JSON: { S: string, O: string, A: string, P: string, risk\_assessment: string, next\_session\_goals: string\[\] } CRITICAL: Never fabricate clinical content. Use placeholders like \[THERAPIST TO CONFIRM\] for any uncertain clinical observations. |
| :---- |

| SECTION 16 — OPERATIONS & SUPPORT |
| :---- |

# **16\. Operations & Support Plan**

## **16.1 SLA Definitions**

| Service Level | Target |
| :---- | :---- |
| Platform Uptime | 99.5% monthly (max \~3.6 hours downtime/month) |
| Video Session Availability | 99.9% during business hours (7am–9pm EAT Mon–Sat) |
| P1 (Critical) Incident Response | \< 30 minutes acknowledgement; \< 2 hours resolution |
| P2 (High) Incident Response | \< 2 hours acknowledgement; \< 8 hours resolution |
| P3 (Medium) Incident Response | \< 8 hours acknowledgement; \< 48 hours resolution |
| Data Breach Notification (DPA) | Notify ICT Authority within 72 hours of confirmed breach |
| Support Response (Patients) | \< 2 hours during business hours; \< 8 hours outside |

## **16.2 Support Tiers**

| Support Tier | Channel & Scope |
| :---- | :---- |
| Tier 0 (Self-service) | In-app help center, FAQs, video tutorials, Swahili \+ English |
| Tier 1 (Patient Support) | WhatsApp chat bot \+ human agent: scheduling, billing, account issues |
| Tier 2 (Clinical Support) | Dedicated admin line for therapists: technical issues during sessions |
| Tier 3 (Engineering) | On-call engineer via PagerDuty for P1/P2 infrastructure incidents |
| Crisis Response | 24/7 monitored: any CRISIS\_ALERT triggers from AI intake → immediate admin alert |

## **16.3 Monitoring & Alerting**

* CloudWatch dashboards: API error rates, response times, database connections, EKS pod health

* Grafana dashboards: business metrics — active sessions, bookings/day, payment success rate

* PagerDuty on-call rotation: 2-engineer team for after-hours P1 incidents

* Uptime Robot: external synthetic monitoring pinging key endpoints every 60 seconds

* M-Pesa payment success rate: alert if \< 95% success in any 15-minute window

* Video session quality: alert on packet loss \> 5% or session drop rate \> 2%

| SECTION 17 — TEAM STRUCTURE & RESOURCE PLAN |
| :---- |

# **17\. Team Structure**

## **17.1 Core Development Team**

| Role | Responsibilities |
| :---- | :---- |
| Tech Lead / Senior Full-Stack Engineer (1) | Architecture decisions, code review, EKS/DevOps, API gateway design |
| Frontend Engineer — React/React Native (2) | Web app, mobile app, UI component library, PWA |
| Backend Engineer — Node.js (2) | Microservices development, API design, M-Pesa integration |
| Backend Engineer — Python/AI (1) | AI triage service, clinical outcome analytics, ML models |
| DevOps / Cloud Engineer (1) | AWS infrastructure, Terraform IaC, CI/CD pipelines, monitoring |
| QA Engineer (1) | Test automation (Playwright, k6), security testing coordination |
| UI/UX Designer (1) | Figma designs, design system, accessibility audit |
| Clinical Product Manager (1) | Bridge between clinical team and engineering; CPB compliance owner |

## **17.2 Clinical Team**

| Role | Requirement |
| :---- | :---- |
| Clinical Director (1) | Qualified psychiatrist or clinical psychologist; oversees clinical protocols |
| Founding Therapists (10) | CPB-licensed counsellors or psychologists; various specialties |
| Supervision Consultant (1) | Senior psychologist for case supervision and therapist support |

## **17.3 Project Timeline Overview**

| Milestone | Target Date (from kickoff) |
| :---- | :---- |
| Architecture & Design Complete | Month 2 |
| Auth \+ Booking MVP (internal) | Month 4 |
| Video Sessions \+ Payments Live (staging) | Month 5 |
| Clinical Notes \+ AI Triage (staging) | Month 6 |
| Full Beta (100 patients, 10 therapists) | Month 8 |
| Public Launch (Eldoret region) | Month 9 |
| Regional Expansion (Nakuru, Kisumu) | Month 12 |
| National Scale \+ Insurance Panels | Month 18 |

| SECTION 18 — APPENDIX & REFERENCE MATERIALS |
| :---- |

# **18\. Appendix**

## **18.1 Glossary**

| Term | Definition |
| :---- | :---- |
| CPB | Counsellors and Psychologists Board — Kenya's regulatory authority for mental health professionals |
| KMPDC | Kenya Medical Practitioners and Dentists Council |
| PHQ-9 | Patient Health Questionnaire-9: validated 9-item depression screening tool |
| GAD-7 | Generalized Anxiety Disorder-7: validated anxiety screening tool |
| CAGE | 4-question validated screening tool for alcohol use disorder |
| SOAP Note | Subjective, Objective, Assessment, Plan — standard clinical documentation format |
| EHR | Electronic Health Record — digital version of patient medical records |
| WebRTC | Web Real-Time Communication — open standard for browser-based video/audio |
| M-Pesa STK Push | SIM Toolkit Push — Safaricom's API to initiate payment prompt on user's phone |
| HIPAA | Health Insurance Portability and Accountability Act — US standard used as global benchmark |
| ABAC | Attribute-Based Access Control — data access rules based on data attributes and user attributes |
| RTO | Recovery Time Objective — maximum acceptable system downtime after failure |
| RPO | Recovery Point Objective — maximum acceptable data loss window in hours |
| EAT | East Africa Time (UTC+3) — used for all session scheduling |
| CPD | Continuing Professional Development — ongoing training required for license renewal |

## **18.2 Key References**

* Kenya Counsellors and Psychologists Act No. 14 of 2014

* Kenya Mental Health Act, 2022 (Act No. 27 of 2022\)

* Kenya Data Protection Act, 2019 (Act No. 24 of 2019\)

* KMPDC Mental Health Treatment Rules, 2022 (Legal Notice No. 173\)

* Kenya Ministry of Health Clinical Guidelines for Mental Disorders, September 2024

* WHO mhGAP Intervention Guide v2.0 (adapted for Kenya)

* Safaricom M-Pesa Daraja API v2.0 Documentation

* Daily.co HIPAA-Eligible Video API Documentation

* Africa's Talking SMS API Documentation

* AWS Well-Architected Framework — Healthcare Industry Lens

**— END OF DOCUMENT —**

Suluhu Therapy Center | Eldoret, Kenya | SDLC Documentation v1.0 | June 2026