import { describe, it, expect } from "vitest";
import { notificationSuffix } from "./notifications";

// QA7-3: 알림 타입 전수 매핑(QA4-1을 잡았을 테스트). 5개 타입 각각 정확한 문구.
describe("notificationSuffix", () => {
  it.each([
    ["follow", "님이 회원님을 팔로우했습니다"],
    ["mention", "님이 댓글에서 회원님을 언급했습니다"],
    ["review_like", "님이 회원님의 리뷰를 좋아합니다"],
    ["warning", "경고를 받았습니다."],
    ["announcement", "새 공지사항이 등록되었어요."],
  ] as const)("%s → %s", (type, expected) => expect(notificationSuffix(type)).toBe(expected));
});
