# Scholarship Monitoring System — Final Laboratory Prototype

This project follows the supplied Systems Analysis and Design laboratory scope:
Authentication, Scholar Management, Scholarship Requirements, Grade Submission/Verification,
Compliance Dashboard/Status, Search/Filter, validation, GitHub, and deployment preparation.

## Run locally

1. Extract the ZIP.
2. Open the folder in VS Code.
3. Use Live Server to open `index.html`.
4. Demo login:
   - Email: `admin@scholarship.com`
   - Password: `admin123`

The browser demo stores data in localStorage so the core workflow can be demonstrated without credentials.

## Supabase setup

The lab specifies Supabase PostgreSQL and Authentication. `supabase_schema.sql` contains the required
relational tables and starter scholarship programs. `config.js` contains placeholders for a Supabase project URL
and anon key.

Important: do NOT put a Supabase service-role key in the frontend.

To make this prototype a true online Supabase implementation, connect the UI data operations to Supabase Auth
and the four tables in `supabase_schema.sql`, then configure RLS policies for admin/staff/scholar access.

## Implemented workflow

Authorized login
→ Register/select scholar
→ Assign scholarship program
→ Submit semester grades
→ Pending
→ Authorized verification
→ Compliance evaluation
→ Compliant / With Deficiency
→ Dashboard monitoring

## Included features

- Login/logout
- Scholar Create/Read/Update
- Unique Student ID validation
- Scholarship program configuration
- Required GWA, minimum units, failing-grade policy
- Grade submission with academic year/semester
- Pending / Verified / Returned
- Verification and verified-by tracking in demo data
- Compliance evaluation
- Compliant / With Deficiency status
- Dashboard counts
- Search by Student ID/name
- Filter by scholar status and grade status
- Required-field and numeric validation
- Responsive modern UI
- Supabase SQL schema for the required relational backend

## Functional test checklist from the lab

TC-01 valid authorized login → dashboard opens
TC-02 create scholar with complete data → scholar saved
TC-03 create scholar without Student ID → rejected
TC-04 submit semester grades → Pending
TC-05 verify pending submission → Verified
TC-06 scholar meeting requirements → Compliant
TC-07 scholar failing a requirement → With Deficiency
TC-08 search by Student ID/name → matching scholar displayed
TC-09 filter by scholarship/status → correct subset displayed
TC-10 deployed URL → accessible online

## Submission items still outside this ZIP

The laboratory also requires Part I analysis outputs, a Use Case Diagram, final functional requirements,
ERD/database diagram or screenshot, at least four meaningful Git commits, functional test results,
requirements-to-implementation table, two to four workflow screenshots, GitHub repository URL, and live deployed URL.
These are deliverables/documentation rather than pages of the prototype itself.
