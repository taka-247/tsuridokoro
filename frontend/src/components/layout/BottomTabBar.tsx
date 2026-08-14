// src/components/layout/BottomTabBar.tsx
import { NavLink } from 'react-router-dom'
import { navItems } from './Layout'

type Props = React.ComponentProps<'nav'>

/** Mobile bottom tab bar. Hidden on ≥sm (desktop uses the header's inline links). */
export default function BottomTabBar({ className = '', ...props }: Props) {
  return (
    <nav
      aria-label="メインナビゲーション"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] ${className}`}
      {...props}
    >
      <div className="mx-auto flex max-w-md">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-bold transition-colors',
                isActive ? 'text-aqua' : 'text-faint hover:text-fg',
              ].join(' ')
            }
          >
            <Icon className="h-6 w-6" aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}