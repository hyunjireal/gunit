export type BeginnerGuideSection = {
  id: string
  number: string
  route: string
  title: string
  summary: string
  points: string[]
}

export const beginnerGuideSections: BeginnerGuideSection[] = [
  {
    id: 'safety-gear',
    number: '01.',
    route: '/guide/safety',
    title: '게임장에 들어가기 전,\n무엇을 준비해야 할까?',
    summary: '게임장에 들어가기 전, 기본 안전수칙을 이해하고 보호장비와 복장, 매너를 미리 준비해요.',
    points: [
      '게임 구역에서는 보안경을 반드시 착용해요.',
      '고글에 김이 서리거나 불편해도 임의로 벗지 않아요.',
      '장비에 문제가 생기면 손을 들고 운영자에게 말해요.',
    ],
  },
  {
    id: 'safe-zone',
    number: '02.',
    route: '/guide/rules',
    title: '세이프존에서는\n총을 어떻게 다뤄야 할까?',
    summary: '세이프존은 쉬는 공간이지만, 총을 안전하게 관리해야 하는 공간이기도 해요.',
    points: [
      '세이프존에 들어가기 전 탄창을 제거해요.',
      '잔탄이 남아 있지 않은지 확인해요.',
      '안전장치를 걸고 총구가 사람을 향하지 않게 해요.',
    ],
  },
  {
    id: 'in-game',
    number: '03.',
    route: '/guide/gear',
    title: '게임 중 맞았을 때는 어떻게 해야 할까?',
    summary: '맞았는지 애매한 상황이라도 안전하고 매너 있는 플레이를 위해 히트로 처리하는 것이 좋아요.',
    points: [
      '맞았다면 큰 소리로 "히트!"라고 말해요.',
      '손을 들거나 히트 표시를 하고 이동해요.',
      '리스폰 지점까지 다른 플레이어를 방해하지 않게 이동해요.',
    ],
  },
  {
    id: 'danger',
    number: '04.',
    route: '/guide/terms',
    title: '절대 하면 안 되는 위험 행동은 무엇일까?',
    summary: '상대가 보이지 않는 상태에서 쏘거나 가까운 거리에서 과하게 사격하는 행동은 매우 위험해요.',
    points: [
      '일부러 얼굴이나 머리를 조준하지 않아요.',
      '너무 가까운 거리에서 연속 사격하지 않아요.',
      '히트 선언한 사람에게 계속 사격하지 않아요.',
    ],
  },
  {
    id: 'law',
    number: '05.',
    route: '/guide/etiquette',
    title: '장비와 필드 매너에서 꼭 지켜야 할 것은?',
    summary: '임의 개조, 기준을 넘는 세팅, 공공장소 노출은 안전 문제뿐 아니라 법적 문제로 이어질 수 있어요.',
    points: [
      '장비는 필드 규정에 맞게 사용해요.',
      '이동할 때는 장비를 케이스에 넣고 노출하지 않아요.',
      '게임 전 브리핑과 운영자 안내를 따라요.',
    ],
  },
]
