# UI Standardization Checklist (TODO)

## 1. Modal Components
- [ ] Standardize all detail/view modals to use the same layout and styling as `BaseAddEditModal`/`BaseViewModal`.
  - [ ] BillDetailModal.vue
  - [ ] AppointmentDetailModal.vue
  - [ ] PrescriptionDetailModal.vue
  - [ ] PurchaseOrderDetailModal.vue
  - [ ] EncounterDetailModal.vue
  - [ ] GRNDetailModal.vue
  - [ ] MedicationItemDetailModal.vue
  - [ ] RecordPaymentModal.vue
  - [ ] ConfirmDeleteModal.vue
  - [ ] All Add/Edit modals should use `BaseAddEditModal` as a wrapper.
  - [ ] Add TODOs in each modal file: "// TODO: Standardize modal layout and styling using BaseAddEditModal or BaseViewModal."

## 2. Form Elements
- [ ] Ensure all forms use `FormInput.vue`, `FormSelect.vue`, and `FormTextarea.vue` for all fields.
  - [ ] Replace native HTML inputs/selects with these components where possible.
  - [ ] Add TODOs in forms using native elements: "// TODO: Replace with FormInput/FormSelect/FormTextarea for consistency."

## 3. Table Components
- [ ] All tables should use `BaseTable.vue` for structure, sorting, and actions.
  - [ ] Replace custom table markup with BaseTable where possible.
  - [ ] Add TODOs in custom table files: "// TODO: Replace with BaseTable for consistency."

## 4. Button Components
- [ ] Use `BaseButton.vue`, `AddButton.vue`, `EditButton.vue`, `DeleteButton.vue` for all actions.
  - [ ] Replace custom buttons with these components.
  - [ ] Add TODOs in files with custom buttons: "// TODO: Use standardized button components."

## 5. Section Titles & Headings
- [ ] Use a shared class/component for section titles and modal headers.
  - [ ] Add TODOs in files with inconsistent headings: "// TODO: Standardize section title/header styling."

## 6. Pagination & Filter Bars
- [ ] Standardize pagination controls and filter/search bars across all list/table views.
  - [ ] Add TODOs in files with custom or inconsistent pagination/filter bars: "// TODO: Standardize pagination/filter bar UI."

## 7. Notification/Message Components
- [ ] Create and use a shared `BaseAlert.vue` or `BaseNotification.vue` for error, success, and info messages.
  - [ ] Add TODOs in files with custom alert/message markup: "// TODO: Use BaseAlert/BaseNotification for messages."

---

> For each item, add a `// TODO:` comment in the relevant file with a short description of what should be standardized. Create missing base components as needed (e.g., `BaseAlert.vue`).
