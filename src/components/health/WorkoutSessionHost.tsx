import { ActiveWorkoutModal } from './ActiveWorkoutModal';
import { WorkoutGoalPickerModal } from './WorkoutGoalPickerModal';

/** Global workout modals — goal picker + active session. */
export function WorkoutSessionHost() {
  return (
    <>
      <WorkoutGoalPickerModal />
      <ActiveWorkoutModal />
    </>
  );
}
