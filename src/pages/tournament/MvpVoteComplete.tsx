import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainTag from '../../components/MainTag'
import { PageHeader } from '../../components/PageHeader'
import { useThemeMode } from '../../hooks/useThemeMode'
import tournamentInfoIcon from '../../asset/icons/tournament_info.svg'
import tournamentCheckImg from '../../asset/images/tournament_check.png'
import tournamentMainCompleteDarkImg from '../../asset/images/mvpvote_done_dark.png'
import profileImg01 from '../../asset/images/mvpvote_profile_img01.png'
import profileImg02 from '../../asset/images/mvpvote_profile_img02.png'
import profileImg03 from '../../asset/images/mvpvote_profile_img03.png'
import profileImg04 from '../../asset/images/mvpvote_profile_img04.png'
import profileImg05 from '../../asset/images/mvpvote_profile_img05.png'
import profileImg06 from '../../asset/images/mvpvote_profile_img06.png'
import profileImg07 from '../../asset/images/mvpvote_profile_img07.png'
import profileImg08 from '../../asset/images/mvpvote_profile_img08.png'
import profileImg09 from '../../asset/images/mvpvote_profile_img09.png'
import profileImg10 from '../../asset/images/mvpvote_profile_img10.png'
import profileImg11 from '../../asset/images/mvpvote_profile_img11.png'
import profileImg12 from '../../asset/images/mvpvote_profile_img12.png'
import './Tournament.css'

type RankItem = { rank: number; name: string; votes: number; percent: number }

type CandidateInfo = {
  name: string
  team: string
  note: string
  round: string
  matchup: string
  ranking: RankItem[]
  profileImg: string
}

const formatRankName = (name: string) => (name.length >= 4 ? `${name.slice(0, 3)}...` : name)

const candidateMap: Record<string, CandidateInfo> = {
  'bazooka-01': {
    name: '김루키', team: '바주카', note: '결정적 돌파 성공',
    round: '8강 3경기', matchup: '바주카 VS 블랙워터', profileImg: profileImg01,
    ranking: [
      { rank: 1, name: '김루키', votes: 128, percent: 100 },
      { rank: 2, name: '이플레이', votes: 96, percent: 75 },
      { rank: 3, name: '박에이스', votes: 74, percent: 58 },
    ],
  },
  'bazooka-07': {
    name: '이플레이', team: '바주카', note: '연속 방어 성공',
    round: '8강 3경기', matchup: '바주카 VS 블랙워터', profileImg: profileImg02,
    ranking: [
      { rank: 1, name: '김루키', votes: 128, percent: 100 },
      { rank: 2, name: '이플레이', votes: 96, percent: 75 },
      { rank: 3, name: '박에이스', votes: 74, percent: 58 },
    ],
  },
  'bazooka-23': {
    name: '박에이스', team: '바주카', note: '마지막 교전 승리',
    round: '8강 3경기', matchup: '바주카 VS 블랙워터', profileImg: profileImg03,
    ranking: [
      { rank: 1, name: '김루키', votes: 128, percent: 100 },
      { rank: 2, name: '이플레이', votes: 96, percent: 75 },
      { rank: 3, name: '박에이스', votes: 74, percent: 58 },
    ],
  },
  'blackwater-04': {
    name: '한스모크', team: '블랙워터', note: '연막 진입 루트 확보',
    round: '8강 3경기', matchup: '바주카 VS 블랙워터', profileImg: profileImg04,
    ranking: [
      { rank: 1, name: '한스모크', votes: 112, percent: 100 },
      { rank: 2, name: '오버워치', votes: 89, percent: 79 },
      { rank: 3, name: '나이트샷', votes: 68, percent: 61 },
    ],
  },
  'blackwater-11': {
    name: '오버워치', team: '블랙워터', note: '후방 엄호 성공',
    round: '8강 3경기', matchup: '바주카 VS 블랙워터', profileImg: profileImg05,
    ranking: [
      { rank: 1, name: '한스모크', votes: 112, percent: 100 },
      { rank: 2, name: '오버워치', votes: 89, percent: 79 },
      { rank: 3, name: '나이트샷', votes: 68, percent: 61 },
    ],
  },
  'blackwater-19': {
    name: '나이트샷', team: '블랙워터', note: '막판 거점 방어',
    round: '8강 3경기', matchup: '바주카 VS 블랙워터', profileImg: profileImg06,
    ranking: [
      { rank: 1, name: '한스모크', votes: 112, percent: 100 },
      { rank: 2, name: '오버워치', votes: 89, percent: 79 },
      { rank: 3, name: '나이트샷', votes: 68, percent: 61 },
    ],
  },
  'smokeline-02': {
    name: '강브리치', team: '스모크', note: '첫 교전 선제 제압',
    round: '8강 4경기', matchup: '스모크 VS 델타포스', profileImg: profileImg07,
    ranking: [
      { rank: 1, name: '강브리치', votes: 104, percent: 100 },
      { rank: 2, name: '민커버', votes: 91, percent: 88 },
      { rank: 3, name: '서패스', votes: 63, percent: 61 },
    ],
  },
  'smokeline-08': {
    name: '민커버', team: '스모크', note: '엄폐 전환 성공',
    round: '8강 4경기', matchup: '스모크 VS 델타포스', profileImg: profileImg08,
    ranking: [
      { rank: 1, name: '강브리치', votes: 104, percent: 100 },
      { rank: 2, name: '민커버', votes: 91, percent: 88 },
      { rank: 3, name: '서패스', votes: 63, percent: 61 },
    ],
  },
  'smokeline-15': {
    name: '서패스', team: '스모크', note: '측면 돌파 기여',
    round: '8강 4경기', matchup: '스모크 VS 델타포스', profileImg: profileImg09,
    ranking: [
      { rank: 1, name: '강브리치', votes: 104, percent: 100 },
      { rank: 2, name: '민커버', votes: 91, percent: 88 },
      { rank: 3, name: '서패스', votes: 63, percent: 61 },
    ],
  },
  'deltaforce-03': {
    name: '윤스나이프', team: '델타포스', note: '장거리 견제 성공',
    round: '8강 4경기', matchup: '스모크 VS 델타포스', profileImg: profileImg10,
    ranking: [
      { rank: 1, name: '윤스나이프', votes: 118, percent: 100 },
      { rank: 2, name: '최리콘', votes: 85, percent: 72 },
      { rank: 3, name: '도미네이터', votes: 72, percent: 61 },
    ],
  },
  'deltaforce-10': {
    name: '최리콘', team: '델타포스', note: '정찰 정보 공유',
    round: '8강 4경기', matchup: '스모크 VS 델타포스', profileImg: profileImg11,
    ranking: [
      { rank: 1, name: '윤스나이프', votes: 118, percent: 100 },
      { rank: 2, name: '최리콘', votes: 85, percent: 72 },
      { rank: 3, name: '도미네이터', votes: 72, percent: 61 },
    ],
  },
  'deltaforce-21': {
    name: '도미네이터', team: '델타포스', note: '최종 라운드 세이브',
    round: '8강 4경기', matchup: '스모크 VS 델타포스', profileImg: profileImg12,
    ranking: [
      { rank: 1, name: '윤스나이프', votes: 118, percent: 100 },
      { rank: 2, name: '최리콘', votes: 85, percent: 72 },
      { rank: 3, name: '도미네이터', votes: 72, percent: 61 },
    ],
  },
}

const defaultCandidate = candidateMap['bazooka-01']
const VOTE_POINT_REWARD = 300
const POINT_COUNT_DURATION = 900
const POINT_COUNT_DELAY = 520

const applyVoteToRanking = (candidate: CandidateInfo): CandidateInfo => {
  const updatedRanking = candidate.ranking
    .map((player) => ({
      ...player,
      votes: player.votes + (player.name === candidate.name ? 1 : 0),
    }))
    .sort((a, b) => b.votes - a.votes)

  const topVotes = Math.max(...updatedRanking.map((player) => player.votes))

  return {
    ...candidate,
    ranking: updatedRanking.map((player, index) => ({
      ...player,
      rank: index + 1,
      percent: Math.round((player.votes / topVotes) * 100),
    })),
  }
}

export function MvpVoteComplete() {
  const navigate = useNavigate()
  const themeMode = useThemeMode()
  const rankSectionRef = useRef<HTMLElement | null>(null)
  const [rankInView, setRankInView] = useState(false)
  const [headerSolid, setHeaderSolid] = useState(false)
  const [displayPointReward, setDisplayPointReward] = useState(0)
  const voted = useMemo<CandidateInfo>(() => {
    const id = localStorage.getItem('votedMvpId') ?? ''
    return applyVoteToRanking(candidateMap[id] ?? defaultCandidate)
  }, [])
  const heroImage = tournamentMainCompleteDarkImg

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    if (prefersReducedMotion) {
      setDisplayPointReward(VOTE_POINT_REWARD)
      return undefined
    }

    let frameId = 0
    let startTime = 0
    const startTimer = window.setTimeout(() => {
      const tick = (timestamp: number) => {
        if (!startTime) startTime = timestamp

        const progress = Math.min((timestamp - startTime) / POINT_COUNT_DURATION, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        setDisplayPointReward(Math.round(VOTE_POINT_REWARD * easedProgress))

        if (progress < 1) {
          frameId = window.requestAnimationFrame(tick)
        }
      }

      frameId = window.requestAnimationFrame(tick)
    }, POINT_COUNT_DELAY)

    return () => {
      window.clearTimeout(startTimer)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    const updateHeaderSolid = () => {
      setHeaderSolid(window.scrollY > 0)
    }

    updateHeaderSolid()
    window.addEventListener('scroll', updateHeaderSolid, { passive: true })
    window.addEventListener('resize', updateHeaderSolid)

    return () => {
      window.removeEventListener('scroll', updateHeaderSolid)
      window.removeEventListener('resize', updateHeaderSolid)
    }
  }, [])

  useEffect(() => {
    const rankSection = rankSectionRef.current
    if (!rankSection) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRankInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(rankSection)

    return () => observer.disconnect()
  }, [])

  return (
    <div className={`tournament_page mvp_vote_complete_page is_${themeMode}${headerSolid ? ' has_solid_header' : ''}`}>
      <PageHeader
        title="투표 완료"
        variant="default"
        onBack={() => navigate(-1)}
      />

      {/* 히어로 */}
      <section
        className="mvpc_hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="mvpc_hero_inner">
          <div className="mvpc_check_medal" aria-hidden="true">
            <img src={tournamentCheckImg} alt="" />
          </div>
          <h1 className="mvpc_hero_tit">투표 완료!</h1>
        </div>
      </section>

      {/* 포인트 카드 */}
      <section className="mvpc_point_section">
        <div className="mvpc_point_card">
          <p className="mvpc_point_label">포인트 적립 완료</p>
          <strong className="mvpc_point_amount" aria-label={`+${VOTE_POINT_REWARD} 포인트`}>
            +{displayPointReward}p
          </strong>
          <span className="mvpc_point_prev">1,240P → 1,540P</span>
          <Link className="mvpc_point_link" to="/my/point-shop">
            <span className="mvpc_point_icon" aria-hidden="true" />
            포인트 쓰러가기
          </Link>
        </div>
      </section>

      {/* 내가 선택한 선수 */}
      <section className="mvpc_player_section">
        <h2 className="body_sb_24">내가 선택한 선수</h2>
        <div className="mvpc_player_card">
          <div className="mvpc_player_left">
            <img className="mvpc_player_photo" src={voted.profileImg} alt={voted.name} />
            <strong className="mvpc_player_name body_b_16">{voted.name}</strong>
          </div>
          <dl className="mvpc_player_info">
            <dt className="body_m_14">경기</dt>
            <dd className="body_sb_14">{voted.round}</dd>
            <dt className="body_m_14">매치업</dt>
            <dd className="body_sb_14">{voted.matchup}</dd>
            <dt className="body_m_14">선택 분야</dt>
            <dd className="body_sb_14">{voted.team} MVP</dd>
            <dt className="body_m_14">주요 활약</dt>
            <dd className="body_sb_14">{voted.note}</dd>
          </dl>
        </div>
      </section>

      {/* 실시간 랭킹 */}
      <section className={`mvpc_rank_section${rankInView ? ' has_rank_fill' : ''}`} ref={rankSectionRef}>
        <h2 className="body_sb_24">실시간 랭킹</h2>
        <div className="tournament_player_rank_list">
          {voted.ranking.map((player) => (
            <div className="tournament_player_rank_item" key={player.rank}>
              <div className="tournament_player_rank_name">
                <MainTag
                  className={`tournament_rank_tag${player.rank === 1 ? ' is_first' : ''}`}
                  style={{ padding: '1px 5px' }}
                >
                  <span className="body_m_14">{player.rank}위</span>
                </MainTag>
                <strong className="body_sb_16" title={player.name}>{formatRankName(player.name)}</strong>
              </div>
              <div className="tournament_player_rank_meter">
                <i aria-hidden="true">
                  <b style={{ width: rankInView ? `${player.percent}%` : '0%' }} />
                </i>
                <em className="body_m_14">{player.votes}표</em>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mvpc_cta_section">
        <Link className="mvpc_btn_primary body_b_18" to="/tournament/mvp-vote">
          다른 경기 투표하기
        </Link>
        <Link className="mvpc_btn_secondary body_sb_16" to="/tournament">
          토너먼트 돌아가기
        </Link>
        <p className="mvpc_result_notice body_m_14">
          <img src={tournamentInfoIcon} alt="" aria-hidden="true" />
          결과는 실시간으로 집계되어 반영됩니다.
        </p>
      </section>

    </div>
  )
}
