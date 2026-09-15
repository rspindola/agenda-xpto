# Professionals and Services Context

**Gathered:** 2026-09-15
**Spec:** `.specs/features/professionals-and-services/spec.md`
**Status:** Ready for design

---

## Feature Boundary

This feature covers the CRUD operations (Create, Read, Update, Soft Delete) for **Professionals** and **Services** within the context of an Establishment in the admin settings panel. It also includes the management of the relationship between them (which professional performs which service, and potential price overrides).

---

## Implementation Decisions

### Page Layout and Structure
- Professionals and Services will be managed on a **single page with tabs** (e.g., `/settings/team-and-services`), rather than separate routes.

### Linking Professionals and Services
- Users will be able to manage the linkage from **both sides**:
  - From the Professional's profile (selecting which services they perform).
  - From the Service's details (selecting which professionals can perform it).

### Price Overrides
- To handle custom pricing per professional for the same service (e.g., Senior vs Junior rates), the UI will show a **simple toggle 'Custom price'** when linking them. If toggled, it will reveal the price override input.

### List Visualization
- Professionals and Services will be displayed in a **Card format** (rather than a dense table) for a cleaner UI that accommodates avatars and icons well.

### Catalog Combo (Services)
- The `catalogCombo` property will be managed via a simple **checkbox in the service form** ("É um pacote/combo?"). In the list view, it will appear as a **badge/tag** on the service card.

### Deletion / Soft-Delete
- Users can delete a professional or service directly from the list via a **trash icon** that triggers a simple confirmation modal, avoiding the need to open an edit form just to access a danger zone.

### Agent's Discretion
- Micro-interactions, form validation visual feedback, and empty state designs are left to the agent's discretion.

---

## Specific References
No specific references provided. Open to standard approaches leveraging the existing design system.

---

## Deferred Ideas
None — discussion stayed within feature scope.
