import Header from './Header'
import Footer from './Footer'
import ToastContainer from '../ui/ToastContainer'
import { HomeIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import BottomTabBar from './BottomTabBar'
import { useSearchedStore } from '../../store/useSearchedStore'
import { useRef } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { SwitchTransition, CSSTransition } from 'react-transition-group'

type NavItem = { to: string; label: string; Icon: typeof HomeIcon }

const homeItem: NavItem = { to: '/', label: '集計', Icon: HomeIcon }
const resultsItem: NavItem = { to: '/results', label: '結果', Icon: ChartBarIcon }
const historyItem: NavItem = { to: '/history', label: '履歴', Icon: ClockIcon }

/**
 * ヘッダー／ボトムタブのナビ項目。
 * 「結果」はこのセッションで集計したときだけ表示する（未集計なら出さない）。
 */
export function useNavItems(): NavItem[] {
  const hasSearched = useSearchedStore((state) => state.hasSearched)
  return hasSearched ? [homeItem, resultsItem, historyItem] : [homeItem, historyItem]
}

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 flex-col">
        {/* <Sidebar /> */}
        <Header className="hidden md:block" />
        <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-6 pb-24 sm:px-8 md:pb-8">
          <AnimatedOutlet />
        </main>
        <BottomTabBar className="md:hidden" />
        <ToastContainer />
      </div>
      <Footer />
    </div>
  )
}

function AnimatedOutlet() {
  const location = useLocation()
  const outlet = useOutlet()
  const nodeRef = useRef<HTMLDivElement>(null)

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition key={location.pathname} nodeRef={nodeRef} classNames="page" timeout={300}>
        <div ref={nodeRef}>{outlet}</div>
      </CSSTransition>
    </SwitchTransition>
  )
}