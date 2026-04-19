import type { AnyMessage } from '../types/chat.types';

const GROUP_THRESHOLD_MS = 60_000;

export type RenderItem =
  | { kind: 'message'; message: AnyMessage; isFirstOfGroup: boolean; isLastOfGroup: boolean }
  | { kind: 'date'; key: string; date: Date };

/**
 * 메시지 배열(DESC, 최신이 [0])을 받아 inverted FlatList용 렌더 아이템으로 변환.
 * - 그룹: 같은 senderId + 60초 이내
 * - 날짜 구분선: 일자가 바뀔 때 삽입 (inverted 기준 "그 다음 메시지" 위에 보이도록)
 */
export function buildRenderItems(messages: AnyMessage[]): RenderItem[] {
  const items: RenderItem[] = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const next = messages[i + 1]; // 더 과거 메시지
    const prev = messages[i - 1]; // 더 최신 메시지

    const sameSenderAsPrev =
      prev != null &&
      prev.senderId === m.senderId &&
      m.senderId != null &&
      Math.abs(toMs(prev.createdAt) - toMs(m.createdAt)) <= GROUP_THRESHOLD_MS;

    const sameSenderAsNext =
      next != null &&
      next.senderId === m.senderId &&
      m.senderId != null &&
      Math.abs(toMs(m.createdAt) - toMs(next.createdAt)) <= GROUP_THRESHOLD_MS;

    const isLastOfGroup = !sameSenderAsPrev; // 화면 하단(시각적 마지막)
    const isFirstOfGroup = !sameSenderAsNext; // 화면 상단(시각적 첫번째)

    items.push({ kind: 'message', message: m, isFirstOfGroup, isLastOfGroup });

    // 날짜 구분선: 다음(더 과거) 메시지와 일자가 다르면 그 사이에 삽입
    if (next) {
      const dCur = startOfDay(m.createdAt);
      const dNext = startOfDay(next.createdAt);
      if (dCur.getTime() !== dNext.getTime()) {
        items.push({
          kind: 'date',
          key: `date:${dCur.toISOString()}`,
          date: dCur,
        });
      }
    } else {
      // 가장 과거 메시지 위에 항상 그 일자 표시
      const d = startOfDay(m.createdAt);
      items.push({ kind: 'date', key: `date:${d.toISOString()}`, date: d });
    }
  }
  return items;
}

function toMs(iso: string): number {
  return new Date(iso).getTime();
}

function startOfDay(iso: string): Date {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatDateLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.getTime() === today.getTime()) return '오늘';
  if (d.getTime() === yesterday.getTime()) return '어제';

  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
