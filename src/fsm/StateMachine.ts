import { State } from "./State";
import { BehaviorState } from "./StateTypes";

export class StateMachine<T> {
  private currentState: State<T> | null = null;
  private currentStateType: BehaviorState | null = null;
  private states: Map<BehaviorState, State<T>> = new Map();
  private entity: T;
  private previousStateType: BehaviorState | null = null;

  constructor(entity: T) {
    this.entity = entity;
  }

  registerState(type: BehaviorState, state: State<T>): void {
    this.states.set(type, state);
  }

  changeState(newStateType: BehaviorState): void {
    console.log("changeState", newStateType);
    console.log("currentStateType", this.currentStateType);
    if (this.currentStateType === newStateType) {
      return;
    }

    const newState = this.states.get(newStateType);
    if (!newState) {
      console.error(`State ${newStateType} not registered!`);
      return;
    }

    if (this.currentState?.canTransitionTo) {
      if (!this.currentState.canTransitionTo(newStateType)) {
        console.warn(
          `Cannot transition from ${this.currentStateType} to ${newStateType}`
        );
        return;
      }
    }

    if (this.currentState) {
      this.currentState.exit(this.entity);
    }

    this.previousStateType = this.currentStateType;
    this.currentStateType = newStateType;
    this.currentState = newState;

    this.currentState.enter(this.entity);
  }

  update(delta: number): void {
    if (this.currentState) {
      this.currentState.update(this.entity, delta);
    }
  }

  getCurrentStateType(): BehaviorState | null {
    return this.currentStateType;
  }

  getPreviousStateType(): BehaviorState | null {
    return this.previousStateType;
  }

  isInState(stateType: BehaviorState): boolean {
    return this.currentStateType === stateType;
  }

  /**
   * Force change state without checking canTransitionTo
   * Used for special cases like revival from DEAD state
   */
  forceChangeState(newStateType: BehaviorState): void {
    if (this.currentStateType === newStateType) {
      return;
    }

    const newState = this.states.get(newStateType);
    if (!newState) {
      console.error(`State ${newStateType} not registered!`);
      return;
    }

    if (this.currentState) {
      this.currentState.exit(this.entity);
    }

    this.previousStateType = this.currentStateType;
    this.currentStateType = newStateType;
    this.currentState = newState;

    this.currentState.enter(this.entity);
  }
}
