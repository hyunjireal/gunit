import matchList01 from '../asset/images/match_list01.jpg'
import matchList02 from '../asset/images/match_list02.jpg'
import matchList03 from '../asset/images/match_list03.jpg'
import matchList04 from '../asset/images/match_list04.jpg'
import matchList05 from '../asset/images/match_list05.jpg'

export type AiRecommendedMatch = {
  id: string
  title: string
  time: string
  region: string
  matchRate: number
  currentMembers: number
  maxMembers: number
  imageSrc: string
}

export const aiRecommendedMatches: AiRecommendedMatch[] = [
  {
    id: 'match-003',
    title: '하남시 몬드필드\n주말 정기전',
    time: '5.17 (토) 12:00',
    region: '경기도 하남시',
    matchRate: 100,
    currentMembers: 17,
    maxMembers: 20,
    imageSrc: matchList01,
  },
  {
    id: 'match-011',
    title: '파주 택티컬 필드\n입문 환영전',
    time: '5.18 (일) 10:30',
    region: '경기도 파주시',
    matchRate: 94,
    currentMembers: 12,
    maxMembers: 16,
    imageSrc: matchList02,
  },
  {
    id: 'match-018',
    title: '인천 CQB 아레나\n근거리 스크림',
    time: '5.21 (수) 19:00',
    region: '인천 서구',
    matchRate: 88,
    currentMembers: 9,
    maxMembers: 12,
    imageSrc: matchList03,
  },
  {
    id: 'match-024',
    title: '용인 워게임 파크\n팀플 매치',
    time: '5.24 (토) 14:00',
    region: '경기도 용인시',
    matchRate: 97,
    currentMembers: 22,
    maxMembers: 28,
    imageSrc: matchList04,
  },
  {
    id: 'match-031',
    title: '김포 서바이벌존\n캐주얼 오픈전',
    time: '5.25 (일) 13:30',
    region: '경기도 김포시',
    matchRate: 91,
    currentMembers: 15,
    maxMembers: 20,
    imageSrc: matchList05,
  },
]

export const primaryAiRecommendedMatch = aiRecommendedMatches[0]
