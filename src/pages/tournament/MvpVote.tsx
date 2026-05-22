import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoginButton } from '../../components/LoginButton'
import MainTag from '../../components/MainTag'
import { PageHeader } from '../../components/PageHeader'
import { useThemeMode } from '../../hooks/useThemeMode'
import tournamentLockIcon from '../../asset/icons/tournament_lock.svg'
import tournamentMainDarkImg from '../../asset/images/tournament_main01.png'
import tournamentMainLightImg from '../../asset/images/tournament_main_light.png'
import thumbBazooka from '../../asset/images/mvpvote_thumbnail_bajuka.png'
import thumbBlackwater from '../../asset/images/mvpvote_thumbnail_blackwater.png'
import thumbSmoke from '../../asset/images/mvpvote_thumbnail_smoke.png'
import thumbDeltaforce from '../../asset/images/mvpvote_thumbnail_deltapos.png'
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

const teamThumbnails: Record<string, string> = {
  bazooka: thumbBazooka,
  blackwater: thumbBlackwater,
  smokeline: thumbSmoke,
  deltaforce: thumbDeltaforce,
}

const formatRankName = (name: string) => (name.length >= 4 ? `${name.slice(0, 3)}...` : name)

const matches = [
  {
    id: 'quarter-3',
    round: '8강 3경기',
    teams: [
      {
        id: 'bazooka',
        name: '바주카',
        candidates: [
          { id: 'bazooka-01', team: '바주카', name: '김루키', note: '결정적 돌파 성공', votes: 128, profileImg: profileImg01 },
          { id: 'bazooka-07', team: '바주카', name: '이플레이', note: '연속 방어 성공', votes: 96, profileImg: profileImg02 },
          { id: 'bazooka-23', team: '바주카', name: '빅에이스', note: '마지막 교전 승리', votes: 74, profileImg: profileImg03 },
        ],
      },
      {
        id: 'blackwater',
        name: '블랙워터',
        candidates: [
          { id: 'blackwater-04', team: '블랙워터', name: '한스모크', note: '연막 진입 루트 확보', votes: 112, profileImg: profileImg04 },
          { id: 'blackwater-11', team: '블랙워터', name: '오버워치', note: '후방 엄호 성공', votes: 89, profileImg: profileImg05 },
          { id: 'blackwater-19', team: '블랙워터', name: '나이트샷', note: '막판 거점 방어', votes: 68, profileImg: profileImg06 },
        ],
      },
    ],
  },
  {
    id: 'quarter-4',
    round: '8강 4경기',
    teams: [
      {
        id: 'smokeline',
        name: '스모크',
        candidates: [
          { id: 'smokeline-02', team: '스모크', name: '강브리치', note: '첫 교전 선제 제압', votes: 104, profileImg: profileImg07 },
          { id: 'smokeline-08', team: '스모크', name: '민커버', note: '엄폐 전환 성공', votes: 91, profileImg: profileImg08 },
          { id: 'smokeline-15', team: '스모크', name: '서패스', note: '측면 돌파 기여', votes: 63, profileImg: profileImg09 },
        ],
      },
      {
        id: 'deltaforce',
        name: '델타포스',
        candidates: [
          { id: 'deltaforce-03', team: '델타포스', name: '윤스나이프', note: '장거리 견제 성공', votes: 118, profileImg: profileImg10 },
          { id: 'deltaforce-10', team: '델타포스', name: '최리콘', note: '정찰 정보 공유', votes: 85, profileImg: profileImg11 },
          { id: 'deltaforce-21', team: '델타포스', name: '도미네이터', note: '최종 라운드 세이브', votes: 72, profileImg: profileImg12 },
        ],
      },
    ],
  },
]

const getCandidateMatchId = (candidateId: string) => {
  for (const match of matches) {
    for (const team of match.teams) {
      if (team.candidates.some((candidate) => candidate.id === candidateId)) {
        return match.id
      }
    }
  }

  return null
}

const readVotedMvpMatchIds = () => {
  const storedMatchIds = localStorage.getItem('votedMvpMatchIds')
  const matchIds = new Set<string>()

  if (storedMatchIds) {
    try {
      const parsed = JSON.parse(storedMatchIds)
      if (Array.isArray(parsed)) {
        parsed.forEach((matchId) => {
          if (typeof matchId === 'string') {
            matchIds.add(matchId)
          }
        })
      }
    } catch {
      // Ignore malformed local storage and fall back to the latest vote.
    }
  }

  const latestMatchId = localStorage.getItem('votedMvpMatchId')
  if (latestMatchId) {
    matchIds.add(latestMatchId)
  }

  const latestCandidateId = localStorage.getItem('votedMvpId')
  const inferredMatchId = latestCandidateId ? getCandidateMatchId(latestCandidateId) : null
  if (inferredMatchId) {
    matchIds.add(inferredMatchId)
  }

  return Array.from(matchIds)
}

const getFirstAvailableMatchId = (votedMatchIds: string[]) => (
  matches.find((match) => !votedMatchIds.includes(match.id))?.id ?? null
)

const readInitialSelectedMatch = (requestedMatchId: string | null, votedMatchIds: string[]) => {
  const requestedMatch = matches.find((match) => match.id === requestedMatchId)

  if (requestedMatch && !votedMatchIds.includes(requestedMatch.id)) {
    return requestedMatch.id
  }

  return getFirstAvailableMatchId(votedMatchIds)
}

const getMatchStatusLabel = (matchId: string, votedMatchIds: string[]) => (
  votedMatchIds.includes(matchId) ? '투표 완료' : '투표 진행중'
)

const getMatchCardClassName = (matchId: string, selectedMatch: string | null, votedMatchIds: string[]) => {
  const classNames = ['tournament_match_card']

  if (selectedMatch === matchId) {
    classNames.push('is_selected')
  }

  if (votedMatchIds.includes(matchId)) {
    classNames.push('is_disabled')
  }

  return classNames.join(' ')
}

export function MvpVote() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const themeMode = useThemeMode()
  const matchSectionRef = useRef<HTMLElement | null>(null)
  const requestedMatchId = searchParams.get('match')
  const [votedMatchIds, setVotedMatchIds] = useState<string[]>(readVotedMvpMatchIds)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(() => (
    readInitialSelectedMatch(requestedMatchId, votedMatchIds)
  ))
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [headerSolid, setHeaderSolid] = useState(false)
  const [showMatchHint, setShowMatchHint] = useState(true)
  const [matchHintDone, setMatchHintDone] = useState(false)
  const heroImage = themeMode === 'dark' ? tournamentMainDarkImg : tournamentMainLightImg
  const selectedMatchData = matches.find((match) => match.id === selectedMatch)
  const selectedTeamData = selectedMatchData?.teams.find((team) => team.id === selectedTeam)
  const currentCandidates = selectedTeamData?.candidates ?? matches[0].teams[0].candidates
  const selected = currentCandidates.find((candidate) => candidate.id === selectedCandidate)
  const previewCandidates = currentCandidates.map((candidate) => ({
    ...candidate,
    votes: candidate.votes + (selectedCandidate === candidate.id ? 1 : 0),
  }))
  const topVotes = Math.max(...previewCandidates.map((candidate) => candidate.votes))
  const liveRanking = [...previewCandidates]
    .sort((a, b) => b.votes - a.votes)
    .map((candidate, index) => ({
      id: candidate.id,
      rank: index + 1,
      name: candidate.name,
      displayName: formatRankName(candidate.name),
      votes: candidate.votes,
      percent: Math.round((candidate.votes / topVotes) * 100),
    }))
  const isTeamSelectOpen = selectedMatch !== null
  const isCandidateSelectOpen = selectedTeam !== null

  const openConfirm = () => {
    if (!selectedCandidate) return
    setConfirmOpen(true)
  }

  const confirmVote = () => {
    if (!selectedCandidate || !selectedMatch) return
    const nextVotedMatchIds = Array.from(new Set([...votedMatchIds, selectedMatch]))
    localStorage.setItem('votedMvpId', selectedCandidate)
    localStorage.setItem('votedMvpMatchId', selectedMatch)
    localStorage.setItem('votedMvpMatchIds', JSON.stringify(nextVotedMatchIds))
    setVotedMatchIds(nextVotedMatchIds)
    setConfirmOpen(false)
    setTransitioning(true)
  }

  const selectMatch = (matchId: string) => {
    if (votedMatchIds.includes(matchId)) return
    setShowMatchHint(false)
    setMatchHintDone(true)
    setSelectedMatch(matchId)
    setSelectedTeam(null)
    setSelectedCandidate(null)
  }

  const selectTeam = (teamId: string) => {
    setSelectedTeam(teamId)
    setSelectedCandidate(null)
  }

  useLayoutEffect(() => {
    const matchSection = matchSectionRef.current
    if (!matchSection) return undefined

    let frameId = 0

    const updateHeaderSolid = () => {
      frameId = 0
      const header = document.querySelector<HTMLElement>('.tournament_mvp_vote_page .page_header')
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0
      setHeaderSolid(matchSection.getBoundingClientRect().top <= headerBottom)
    }

    const requestHeaderSolidUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updateHeaderSolid)
    }

    updateHeaderSolid()
    window.addEventListener('scroll', requestHeaderSolidUpdate, { passive: true })
    window.addEventListener('resize', requestHeaderSolidUpdate)

    return () => {
      window.removeEventListener('scroll', requestHeaderSolidUpdate)
      window.removeEventListener('resize', requestHeaderSolidUpdate)
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowMatchHint(false)
      setMatchHintDone(true)
    }, 1900)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className={`tournament_page tournament_mvp_vote_page is_${themeMode}${headerSolid ? ' has_solid_header' : ''}${showMatchHint ? ' is_match_hinting' : ''}${matchHintDone ? ' is_match_hint_done' : ''}`}>
      <PageHeader
        title="MVP 투표"
        variant="default"
        onBack={() => navigate(-1)}
      />
      <section
        className="tournament_intro_card"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="tournament_intro_tit">
          <div className="tournament_intro_bottom">
            <p className="body_sb_20">
              각 경기에서 <em>가장 인상 깊었던</em><br />
              선수를 선택해주세요
            </p>
            <span>최종 MVP가 아닌 경기별 MVP 투표에요</span>
          </div>
        </div>
      </section>

      <section className="tournament_match_section" ref={matchSectionRef}>
        <h2>경기 선택</h2>
        <div className="tournament_match_list">
          <div className="tournament_match_list_top">
            <button
              className={getMatchCardClassName('quarter-3', selectedMatch, votedMatchIds)}
              type="button"
              disabled={votedMatchIds.includes('quarter-3')}
              onClick={() => selectMatch('quarter-3')}
            >
              <div className="tournament_match_info">
                <strong className="body_b_14">{matches[0].round}</strong>
                <div className="tournament_match_teams">
                  <span className="body_m_16">{matches[0].teams[0].name}</span>
                  <b className="body_b_14">VS</b>
                  <span className="body_m_16">{matches[0].teams[1].name}</span>
                </div>
              </div>
              <em className="body_sb_14">{getMatchStatusLabel('quarter-3', votedMatchIds)}</em>
            </button>
            <button
              className={getMatchCardClassName('quarter-4', selectedMatch, votedMatchIds)}
              type="button"
              disabled={votedMatchIds.includes('quarter-4')}
              onClick={() => selectMatch('quarter-4')}
            >
              <div className="tournament_match_info">
                <strong className="body_b_14">{matches[1].round}</strong>
                <div className="tournament_match_teams">
                  <span className="body_m_16">{matches[1].teams[0].name}</span>
                  <b className="body_b_14">VS</b>
                  <span className="body_m_16">{matches[1].teams[1].name}</span>
                </div>
              </div>
              <em className="body_sb_14">{getMatchStatusLabel('quarter-4', votedMatchIds)}</em>
            </button>
          </div>
          <button className="tournament_match_lock_card" type="button" disabled>
            <img src={tournamentLockIcon} alt="" aria-hidden="true" />
            <div>
              <strong className="body_b_14">4강 1경기</strong>
              <span className="body_sb_14">경기 후 오픈</span>
            </div>
          </button>
        </div>
      </section>

      <section className="tournament_team_select_section">
        <h2 className={!isTeamSelectOpen ? 'is_locked' : ''}>
          {!isTeamSelectOpen ? <img src={tournamentLockIcon} alt="" aria-hidden="true" /> : null}
          <span>MVP 팀 선택</span>
        </h2>
        {isTeamSelectOpen ? (
          <div className="tournament_team_select_box">
            <strong className="body_sb_16">{selectedMatchData?.round}</strong>
            <div className="tournament_team_select_cards">
              {selectedMatchData?.teams.map((team) => (
                <button
                  className={`${selectedTeam === team.id ? 'is_selected ' : ''}body_sb_16`}
                  key={team.id}
                  type="button"
                  onClick={() => selectTeam(team.id)}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {isCandidateSelectOpen ? (
        <section className="tournament_team_media_section">
          <h2 className="body_sb_20">{selectedTeamData?.name} 주요 장면</h2>
          <a
            className="tournament_team_media_placeholder"
            href="https://youtu.be/bnjqWY4uULA?si=mYqU6tLXVf8LDQal"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="선택한 팀 주요 장면 영상 보기"
          >
            {selectedTeam && teamThumbnails[selectedTeam] ? (
              <>
                <img src={teamThumbnails[selectedTeam]} alt={`${selectedTeamData?.name} 주요 장면`} />
                <span className="tournament_media_play_btn" aria-hidden="true" />
              </>
            ) : null}
          </a>
        </section>
      ) : null}

      <section className="tournament_candidate_section">
        <h2 className={!isCandidateSelectOpen ? 'is_locked' : ''}>
          {!isCandidateSelectOpen ? <img src={tournamentLockIcon} alt="" aria-hidden="true" /> : null}
          <span>후보 선택</span>
        </h2>
        {isCandidateSelectOpen ? (
          <div className="tournament_candidate_card_list">
            {currentCandidates.map((candidate) => (
              <button
                className={`tournament_vote_candidate_card${selectedCandidate === candidate.id ? ' is_selected' : ''}`}
                key={candidate.id}
                type="button"
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="tournament_candidate_player">
                  <img className="tournament_candidate_profile" src={candidate.profileImg} alt="" aria-hidden="true" />
                  <div>
                    <p className="body_m_14">{candidate.team}</p>
                    <strong className="body_b_16">{candidate.name}</strong>
                  </div>
                </div>
                <p className="tournament_candidate_desc body_m_14">{candidate.note}</p>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section
        className={`tournament_live_rank_section${!isCandidateSelectOpen ? ' is_locked' : ''}${selectedCandidate ? ' has_rank_fill' : ''}`}
      >
        <h2>실시간 랭킹</h2>
        <div className="tournament_player_rank_list" key={selectedCandidate ?? selectedTeam ?? 'locked'}>
          {liveRanking.map((player) => (
            <div className="tournament_player_rank_item" key={player.id}>
              <div className="tournament_player_rank_name">
                <MainTag
                  className={`tournament_rank_tag${player.rank === 1 ? ' is_first' : ''}`}
                  style={{ padding: '1px 5px' }}
                >
                  <span className="body_m_14">{player.rank}위</span>
                </MainTag>
                <strong className="body_sb_16" title={player.name}>{player.displayName}</strong>
              </div>
              <div className="tournament_player_rank_meter">
                <i aria-hidden="true">
                  <b style={{ width: `${player.percent}%` }} />
                </i>
                <em className="body_m_14">{player.votes}표</em>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tournament_cta_section">
        <LoginButton
          className="tournament_fixed_vote"
          onClick={openConfirm}
          disabled={!selectedCandidate}
          style={{
            background: 'var(--tournament-light-btn-bg)',
            backgroundColor: 'var(--tournament-light-btn-bg)',
            color: 'var(--tournament-light-btn-txt)',
            WebkitTextFillColor: 'var(--tournament-light-btn-txt)',
          }}
        >
          {selected ? selected.name : '후보'}에게 투표하기
        </LoginButton>
        <p className="tournament_lock_notice">
          <img src={tournamentLockIcon} alt="" aria-hidden="true" />
          <span className="body_m_14">투표 후 변경할 수 없습니다.</span>
        </p>
      </section>

      <AnimatePresence>
        {confirmOpen ? (
          <motion.div
            className="mvp_confirm_backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              className="mvp_confirm_sheet"
              role="dialog"
              aria-modal="true"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="mvp_confirm_handle" aria-hidden="true" />
              <div className="mvp_confirm_body">
                <p className="mvp_confirm_title body_b_20">
                  정말 <em>{selected?.name}</em>에게<br />투표하시겠습니까?
                </p>
                <p className="mvp_confirm_sub body_m_14">투표 후에는 변경할 수 없습니다.</p>
              </div>
              <div className="mvp_confirm_actions">
                <button className="mvp_confirm_cancel body_sb_16" type="button" onClick={() => setConfirmOpen(false)}>
                  취소
                </button>
                <button className="mvp_confirm_submit body_sb_16" type="button" onClick={confirmVote}>
                  투표하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {transitioning ? (
          <motion.div
            className="mvp_transition_overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            onAnimationComplete={() => navigate('/tournament/mvp-complete')}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
