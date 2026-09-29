// Shown as the "Simulate:" buttons in the header while the Demo page is
// active — picks which kind of random profile the backend simulation
// generates. Shared between App.jsx (renders the buttons) and DemoPage.jsx
// (builds the profile for the selected type).
export const DEMO_CUSTOMER_TYPES = [
  { key: 'random', label: 'Random Customer' },
  { key: 'ineligible', label: 'Ineligible Customer' },
  { key: 'high', label: 'High Income Customer' },
  { key: 'low', label: 'Low Income Customer' },
]
