import { CardsIcon, HomeIcon, LoanIcon, ProfileIcon } from './icons'
import './BottomNav.css'

const items = [
  { key: 'home', label: 'Home', Icon: HomeIcon, screen: 'home' },
  { key: 'cards', label: 'Cards', Icon: CardsIcon, screen: 'card' },
  { key: 'loans', label: 'Loans', Icon: LoanIcon, screen: 'loan' },
  { key: 'profile', label: 'Profile', Icon: ProfileIcon, screen: null },
]

export default function BottomNav({ active = 'home', onNavigate }) {
  return (
    <div className="bottom-nav">
      {items.map(({ key, label, Icon, screen }) => (
        <button
          key={key}
          type="button"
          className={`bottom-nav__item ${key === active ? 'is-active' : ''}`}
          onClick={() => screen && onNavigate?.(screen)}
          disabled={!screen}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
