import { create } from 'zustand'

// セッション内で集計したかどうかのフラグ。
// SessionStorage 保持なので、同じタブのリロードでは残り、新しいセッションでは消える。
const SEARCHED_KEY = 'tsuridokoro:searched'

function readFlag(): boolean {
  try {
    return sessionStorage.getItem(SEARCHED_KEY) === '1'
  } catch {
    return false
  }
}

type SearchedState = {
  /** このセッションで一度でも集計したか（結果ページへのリンク表示に使う） */
  hasSearched: boolean
  isSearched: () => void
}

export const useSearchedStore = create<SearchedState>((set) => ({
  hasSearched: readFlag(),
  isSearched: () => {
    try {
      sessionStorage.setItem(SEARCHED_KEY, '1')
    } catch {
      // 保存できなくてもメモリ上のフラグだけで動作させる
    }
    set({ hasSearched: true })
  },
}))
