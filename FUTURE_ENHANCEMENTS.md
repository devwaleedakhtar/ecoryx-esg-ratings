# Future Enhancements & Scalability Considerations

## 1. Automated Cron Jobs for Survey Expiry
**Current:** Event-driven (Admin closes survey).
**Future:** Implement a robust Cron job (e.g., via BullMQ + Redis) that runs daily at midnight to check for surveys where `endDate < NOW` and validates them automatically. This decouples the dependency on Admin action.

## 2. Multi-Tenancy & RBAC
**Current:** Single Admin Role.
**Future:**
- **Tenancy:** `Organization` table to allow multiple companies to use the platform.
- **RBAC:** Fine-grained permissions (e.g., `SurveyPlanner` vs `Analyst` vs `Viewer`).

## 3. Advanced AI Models
**Current:** Simple prompt engineering for summary.
**Future:**
- Fine-tuned models on specific industry ESG reports.
- RAG (Retrieval Augmented Generation) to compare against competitor benchmarks.

## 4. Security & Compliance
- Rate limiting on API endpoints.
- 2FA for Admin accounts.
- Audit logs for all data modification events.
