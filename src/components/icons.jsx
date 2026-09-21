const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function BackIcon(props) {
  return (
    <svg {...base} strokeWidth={2.2} width={17} height={17} stroke="currentColor" {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon(props) {
  return (
    <svg {...base} width={16} height={16} stroke="currentColor" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function ChevronDownIcon(props) {
  return (
    <svg {...base} width={16} height={16} stroke="currentColor" {...props}>
      <path d="M8 11l4 4 4-4" />
    </svg>
  )
}

export function BellIcon(props) {
  return (
    <svg {...base} strokeWidth={1.8} width={19} height={19} stroke="currentColor" {...props}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

export function ClockIcon(props) {
  return (
    <svg {...base} width={13} height={13} stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

export function InfoIcon(props) {
  return (
    <svg {...base} width={16} height={16} stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export function CheckIcon(props) {
  return (
    <svg {...base} strokeWidth={3} width={13} height={13} stroke="currentColor" {...props}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function HomeIcon(props) {
  return (
    <svg {...base} strokeWidth={1.8} width={20} height={20} stroke="currentColor" {...props}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}

export function CardsIcon(props) {
  return (
    <svg {...base} strokeWidth={1.8} width={20} height={20} stroke="currentColor" {...props}>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}

export function LoanIcon(props) {
  return (
    <svg {...base} strokeWidth={1.8} width={20} height={20} stroke="currentColor" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export function ProfileIcon(props) {
  return (
    <svg {...base} strokeWidth={1.8} width={20} height={20} stroke="currentColor" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg {...base} strokeWidth={2.2} width={16} height={16} stroke="currentColor" {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

export function GearIcon(props) {
  return (
    <svg {...base} strokeWidth={1.8} width={18} height={18} stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg {...base} strokeWidth={2} width={16} height={16} stroke="currentColor" {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

export function GridIcon(props) {
  return (
    <svg {...base} strokeWidth={1.8} width={18} height={18} stroke="currentColor" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  )
}
