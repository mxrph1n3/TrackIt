import { hydrateMealCatalog } from './mealCatalogService';
import { hydrateWorkoutCatalog } from './workoutCatalogService';

export {
  getMealById,
  getMealLibrary,
  hasMealId,
  hydrateMealCatalog,
  isMealCatalogLive,
} from './mealCatalogService';
export {
  getDefaultDayIndex,
  getProgramDay,
  getWorkoutTrack,
  getWorkoutTracks,
  hydrateWorkoutCatalog,
  isWorkoutCatalogLive,
  listDaysForWeek,
} from './workoutCatalogService';

export async function hydrateCatalog(): Promise<void> {
  await Promise.all([hydrateMealCatalog(), hydrateWorkoutCatalog()]);
}
