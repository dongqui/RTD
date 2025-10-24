import { BehaviorState } from "./StateTypes";

export interface State<T> {
  enter(entity: T): void;
  update(entity: T, delta: number): void;
  exit(entity: T): void;
  canTransitionTo?(state: BehaviorState): boolean;
}
