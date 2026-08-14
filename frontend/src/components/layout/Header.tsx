import { NavLink } from 'react-router-dom'
import ThemeModeSwitcher from '../../components/ui/ThemeModeSwitcher'
import FishMark from '../ui/FishMark'
import { navItems } from './Layout'

type Props = React.ComponentProps<'header'>

export default function Header({ className = '', ...props }: Props) {
  return (
    <header className={`bg-gradient-to-br from-tide to-ink ${className}`} {...props}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-3" aria-label="釣りドコロ ホーム">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-aqua/15">
            <FishMark className="h-5 w-5 text-aqua" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold text-white">釣りドコロ</span>
            <span className="block font-data text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              AI釣果集計
            </span>
          </span>
        </NavLink>

        {/* Section nav + theme toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors',
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <ThemeModeSwitcher />
        </div>
      </div>
    </header>
  )
}