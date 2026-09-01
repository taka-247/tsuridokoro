/**
 * 集計結果ページ（ボイラープレート）。
 * いまは中身は未実装。集計完了後にここへ遷移してくる。
 * 結果本体は SessionStorage (`tsuridokoro:results`) に保存済み（§9.4）。
 * `anim` は App.tsx の globalLinks から渡され、ルート要素に `.anim-<kind>` を付与する。
 */
export default function Results() {
  return (
    <div className='p-6 flex'>
      {/* TODO: 集計結果UI（§8.1）を実装 */}

      <div className="w-[400px] h-[400px] bg-black"></div>
    </div>
  )
}
