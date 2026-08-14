import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ToastContainer from '../ui/ToastContainer'
import { HomeIcon, ClockIcon } from '@heroicons/react/24/outline'
import BottomTabBar from './BottomTabBar'

export const navItems = [
  { to: '/', label: '集計', Icon: HomeIcon },
  { to: '/history', label: '履歴', Icon: ClockIcon },
] as const

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div>{/* className="flex flex-1" */}
        {/* <Sidebar /> */}
        <Header className="hidden md:block" />
        {/* TECH: max width for page contents */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 pb-24 sm:px-8 md:pb-8">
          <Outlet />
        </main>
        <BottomTabBar className="md:hidden" />
        <ToastContainer />
      </div>
      <Footer />
    </div>
  )
}