# Architecture and boundaries

```mermaid
flowchart LR
    A[CI health update] --> B{Transition to Unhealthy?}
    B -- No --> X[No incident action]
    B -- Yes --> C[Read CMDB CI context]
    C --> D{Existing active health incident?}
    D -- Yes --> E[Skip duplicate]
    D -- No --> F[Create ITSM incident]
    F --> G[Copy CI + impact + urgency + owner]
    G --> H[Service Desk / support triage]
```

## Logical layers

1. **Operational inputs:** Azure and application events (conceptual unless integrated).
2. **CMDB context:** CI identity, health-state field, optional support ownership and relationships.
3. **Automation:** Record-triggered Business Rule OR Flow Designer, duplicate checks, field mapping.
4. **ITSM response:** Incident records, assignment, triage, SLA extensions.
5. **Service visibility:** Dashboards and dependency context (planned extensions).

The code uses CI-level health status but **does not perform Discovery**, ingest Azure events, construct native service maps, or infer actual application impact. The sample statements are hypotheses for technicians to validate.
