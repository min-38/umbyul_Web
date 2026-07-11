import type { NotificationItem } from "@/lib/api";

// 알림 타입 → 문구(ko 키; en/ja/es는 t()가 치환). actor(이름) 뒤에 붙는 접미 문구가 기본이고,
// warning/announcement는 시스템 알림이라 이름 없이 단독 문구.
// 소진성 switch: NotificationItem["type"]에 새 타입이 추가되면 default의 never 할당이 컴파일 에러(QA7-3).
// (QA4-1: 공지 알림이 default로 흘러 "리뷰 좋아요"로 표시되던 버그를 이 전수 매핑이 잡았을 것.)
export function notificationSuffix(type: NotificationItem["type"]): string {
  switch (type) {
    case "follow":
      return "님이 회원님을 팔로우했습니다";
    case "mention":
      return "님이 댓글에서 회원님을 언급했습니다";
    case "review_like":
      return "님이 회원님의 리뷰를 좋아합니다";
    case "warning":
      return "경고를 받았습니다.";
    case "announcement":
      return "새 공지사항이 등록되었어요.";
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}
