/* 앱 실행 스플래시 — Figma 원본 `438:10131`.

   두 곳에서 쓴다:
     ① 앱 진입(/) — 실제 앱처럼 켜지는 연출
     ② 시연 도입부(/demo/push) — 알림을 눌러 앱이 콜드 스타트하는 자리

   ⚠️ 배경색 + 로고를 코드로 합치지 않는다. 원본은 이미지 한 장이고,
      로고가 앱 아이콘이 아니라 super SOL 워드마크이며 파랑도 --primary 보다
      진하다. 코드로 맞추려다 한 번 틀렸다 — 이미지를 그대로 깐다. */

import styles from './Splash.module.css'

export function Splash() {
  return (
    <div className={styles.splash}>
      <img className={styles.img} src="/assets/demo/splash.jpg" alt="" aria-hidden="true" />
      {/* 그림뿐이라 스크린리더에는 읽을 것이 없다 — 지금 무슨 상태인지 알려 준다 */}
      <p className="sr-only" role="status">앱을 여는 중이에요</p>
    </div>
  )
}
