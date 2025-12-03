/**
 * Throttle 함수 - 지정된 시간 간격으로 함수 실행을 제한
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= delay) {
      lastCallTime = now;
      func.apply(this, args);
    } else {
      // 마지막 호출 후 남은 시간만큼 지연 후 실행
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func.apply(this, args);
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Throttle이 적용된 console.log
 * @param delay - 밀리초 단위의 throttle 지연 시간 (기본값: 100ms)
 */
export const throttledLog = (delay: number = 100, ...args: any[]) => {
  const log = throttle(console.log, delay);
  return (...args: any[]) => log(...args);
};

/**
 * 기본 throttle 설정(100ms)으로 사용할 수 있는 편의 함수
 */
export const log = throttledLog(100);
