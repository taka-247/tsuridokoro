import { useRef } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { SwitchTransition, CSSTransition } from 'react-transition-group'

/**
 * ルート遷移に enter/exit アニメーションを付ける Outlet。
 * SwitchTransition(mode="out-in") で「旧ページが exit → 新ページが enter」の順に再生。
 * React 19 は findDOMNode を持たないため nodeRef 必須。out-in は同時に2つ存在しないので単一 ref でよい。
 * アニメーション定義は index.css の `.page-enter* / .page-exit*`（timeout と duration を一致させること）。
 */
export default function AnimatedOutlet() {
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
