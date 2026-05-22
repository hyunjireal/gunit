import type { CSSProperties } from 'react'
import blueTeamImg from '../../asset/images/main_hero02.png'
import redTeamImg from '../../asset/images/main_hero01.png'
import vsImg from '../../asset/images/main_hero_vs.png'
import './TournamentHero.css'

interface TournamentHeroProps {
  skipIntro?: boolean
}

type DotStyle = CSSProperties & {
  '--th-dx': string
  '--th-delay': string
  '--th-dur': string
}

const BLUE_DOTS: Array<{ style: DotStyle }> = [
  { style: { '--th-dx': '-7px', '--th-delay': '0.3s', '--th-dur': '3.8s', left: '38%', top: '38%' } },
  { style: { '--th-dx': '-5px', '--th-delay': '1.5s', '--th-dur': '4.4s', left: '58%', top: '62%' } },
  { style: { '--th-dx': '-9px', '--th-delay': '2.3s', '--th-dur': '3.3s', left: '28%', top: '72%' } },
]

const RED_DOTS: Array<{ style: DotStyle }> = [
  { style: { '--th-dx': '7px',  '--th-delay': '0.8s', '--th-dur': '4.1s', right: '38%', top: '32%' } },
  { style: { '--th-dx': '5px',  '--th-delay': '1.9s', '--th-dur': '3.5s', right: '55%', top: '58%' } },
  { style: { '--th-dx': '9px',  '--th-delay': '0.5s', '--th-dur': '4.6s', right: '26%', top: '48%' } },
]

export function TournamentHero({ skipIntro = false }: TournamentHeroProps) {
  return (
    <section className={`th_hero${skipIntro ? ' is_intro_skipped' : ''}`} aria-label="다음 토너먼트 매치업">
      {/* Noise texture overlay */}
      <div className="th_noise" aria-hidden="true" />

      {/* Blue team — left */}
      <div className="th_side th_side_blue" aria-hidden="true">
        <div className="th_glow" />
        <div className="th_smoke" />
        <img src={blueTeamImg} alt="" className="th_img" draggable={false} />
        <div className="th_particles">
          {BLUE_DOTS.map((dot, i) => (
            <span key={i} className="th_dot" style={dot.style} />
          ))}
        </div>
      </div>

      {/* Red team — right */}
      <div className="th_side th_side_red" aria-hidden="true">
        <div className="th_glow" />
        <div className="th_smoke" />
        <img src={redTeamImg} alt="" className="th_img" draggable={false} />
        <div className="th_particles">
          {RED_DOTS.map((dot, i) => (
            <span key={i} className="th_dot" style={dot.style} />
          ))}
        </div>
      </div>

      {/* Central diagonal clash line — "/" direction: bottom-left → top-right */}
      <div className="th_clash" aria-hidden="true">
        <svg
          className="th_clash_svg"
          viewBox="0 0 390 423"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* gradient follows the "/" diagonal: blue at bottom-left, red at top-right */}
            <linearGradient id="thClashMain" gradientUnits="userSpaceOnUse"
              x1="65" y1="423" x2="325" y2="0">
              <stop offset="0%"   stopColor="#0b1c3d" stopOpacity="0" />
              <stop offset="22%"  stopColor="#1e4f9f" stopOpacity="0.28" />
              <stop offset="46%"  stopColor="#726a9e" stopOpacity="0.68" />
              <stop offset="54%"  stopColor="#8a617c" stopOpacity="0.62" />
              <stop offset="78%"  stopColor="#7c2631" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#2a0710" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="thClashGlow" gradientUnits="userSpaceOnUse"
              x1="65" y1="423" x2="325" y2="0">
              <stop offset="0%"   stopColor="#0b1c3d" stopOpacity="0" />
              <stop offset="28%"  stopColor="#173e83" stopOpacity="0.22" />
              <stop offset="50%"  stopColor="#5d5a88" stopOpacity="0.42" />
              <stop offset="72%"  stopColor="#651d2a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2a0710" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="thClashAmbient" gradientUnits="userSpaceOnUse"
              x1="65" y1="423" x2="325" y2="0">
              <stop offset="0%"   stopColor="#0b1c3d" stopOpacity="0" />
              <stop offset="33%"  stopColor="#12356f" stopOpacity="0.12" />
              <stop offset="50%"  stopColor="#4d4266" stopOpacity="0.2" />
              <stop offset="67%"  stopColor="#561623" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2a0710" stopOpacity="0" />
            </linearGradient>
            <filter id="thBlurAmbient" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="20" />
            </filter>
            <filter id="thBlurMid" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <filter id="thBlurCore" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>

          {/* 1. Ambient wide glow — broadest, softest */}
          <line x1="65" y1="423" x2="325" y2="0"
            stroke="url(#thClashAmbient)" strokeWidth="90"
            filter="url(#thBlurAmbient)" />

          {/* 2. Medium haze streak */}
          <line x1="65" y1="423" x2="325" y2="0"
            stroke="url(#thClashGlow)" strokeWidth="11"
            filter="url(#thBlurMid)" />

          {/* 3. Soft blurred core line */}
          <line x1="65" y1="423" x2="325" y2="0"
            stroke="url(#thClashMain)" strokeWidth="3.5"
            filter="url(#thBlurCore)" opacity="0.75" />

          {/* 4. Sharp primary line */}
          <line x1="65" y1="423" x2="325" y2="0"
            stroke="url(#thClashMain)" strokeWidth="0.9" />

          {/* 5. Secondary offset line — slightly parallel */}
          <line x1="68" y1="423" x2="328" y2="0"
            stroke="url(#thClashMain)" strokeWidth="0.4" opacity="0.28" />

          {/* Particles positioned along the "/" diagonal */}
          {/* t≈0.20  (117, 338) — blue zone */}
          <circle cx="117" cy="338" r="1.5" fill="#80ccff">
            <animate attributeName="opacity" values="0;0.75;0" dur="3.2s" begin="0.3s" repeatCount="indefinite" />
            <animate attributeName="r"       values="1;2.2;1"   dur="3.2s" begin="0.3s" repeatCount="indefinite" />
          </circle>

          {/* t≈0.35  (156, 275) — blue zone */}
          <circle cx="156" cy="275" r="1.4" fill="#60aaff">
            <animate attributeName="opacity" values="0;0.6;0"   dur="2.8s" begin="1.2s" repeatCount="indefinite" />
            <animate attributeName="r"       values="1;2;1"     dur="2.8s" begin="1.2s" repeatCount="indefinite" />
          </circle>

          {/* t≈0.50  (195, 212) — center intersection */}
          <circle cx="195" cy="212" r="2" fill="#ddeeff">
            <animate attributeName="opacity" values="0;0.5;0"   dur="2.5s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="r"       values="1.5;3.2;1.5" dur="2.5s" begin="0.7s" repeatCount="indefinite" />
          </circle>

          {/* t≈0.65  (234, 148) — red zone */}
          <circle cx="234" cy="148" r="1.4" fill="#ff9977">
            <animate attributeName="opacity" values="0;0.6;0"   dur="3s"   begin="1.6s" repeatCount="indefinite" />
            <animate attributeName="r"       values="1;2;1"     dur="3s"   begin="1.6s" repeatCount="indefinite" />
          </circle>

          {/* t≈0.80  (273, 85)  — red zone */}
          <circle cx="273" cy="85" r="1.5" fill="#ff7766">
            <animate attributeName="opacity" values="0;0.7;0"   dur="3.6s" begin="0.2s" repeatCount="indefinite" />
            <animate attributeName="r"       values="1;2.2;1"   dur="3.6s" begin="0.2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* VS image — hero center */}
      <div className="th_vs_wrap" aria-hidden="true">
        <img src={vsImg} alt="" className="th_vs_img" draggable={false} />
      </div>

      {/* Bottom text — Figma node 2916:23759 */}
      <div className="th_content">
        <span className="th_tag">MVP 투표중</span>
        <p className="th_title">승부를 바꾼 플레이,<br />당신의 선택은?</p>
      </div>
    </section>
  )
}
