import { View } from 'react-native';

import { NextWorkoutCard } from './training/NextWorkoutCard';
import { RecentWorkoutCard } from './training/RecentWorkoutCard';
import { StreakCard } from './training/StreakCard';
import { TrainingHeroCard } from './training/TrainingHeroCard';
import { TrainingStatsGrid } from './training/TrainingStatsGrid';
import { TrainingWeekList } from './training/TrainingWeekList';
import { WeeklyProgressCard } from './training/WeeklyProgressCard';

export function WorkoutsTabPanel() {
  return (
    <View>
      <TrainingHeroCard />
      <WeeklyProgressCard />
      <TrainingStatsGrid />
      <StreakCard />
      <RecentWorkoutCard />
      <NextWorkoutCard />
      <TrainingWeekList />
    </View>
  );
}
