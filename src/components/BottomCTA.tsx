/* §4 하단 고정 CTA — fixed 흰 배경 h102, 버튼 h56 r16 폭 353.
   탭바와 같은 화면에 함께 두지 않는다 (화면당 둘 중 하나). */

import type { ReactNode } from 'react'
import styles from './BottomCTA.module.css'

export function BottomCTA({ children }: { children: ReactNode }) {
  return <div className={styles.cta}>{children}</div>
}
