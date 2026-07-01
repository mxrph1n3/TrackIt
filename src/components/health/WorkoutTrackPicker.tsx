import * as Haptics from 'expo-haptics';
import { ChevronRight, Crown } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { FREE_BUILTIN_PROGRAM_ID } from '../../constants/workoutFreeTier';
import { getWorkoutTracks } from '../../constants/workoutPrograms';
import { useWorkoutProgramAccess } from '../../hooks/useWorkoutProgramAccess';
import type { WorkoutTrackId } from '../../types/workout';
import { GlassPanel } from '../GlassPanel';

type WorkoutTrackPickerProps = {
  selectedTrackId: WorkoutTrackId;
  onSelect: (id: WorkoutTrackId) => void;
};

export function WorkoutTrackPicker({ selectedTrackId, onSelect }: WorkoutTrackPickerProps) {
  const { trySelectBuiltinProgram, isProProgram } = useWorkoutProgramAccess();

  return (
    <View className="mb-4">
      <Text className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
        Program
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {getWorkoutTracks().map((track) => {
          const active = track.id === selectedTrackId;
          const locked = isProProgram(track.id);
          const isFreeProgram = track.id === FREE_BUILTIN_PROGRAM_ID;

          return (
            <Pressable
              key={track.id}
              onPress={() => {
                void Haptics.selectionAsync();
                trySelectBuiltinProgram(track.id, () => onSelect(track.id));
              }}
              className="active:opacity-90"
            >
              <GlassPanel
                borderRadius={20}
                style={{
                  width: 220,
                  borderWidth: active ? 1 : 0,
                  borderColor: active ? 'rgba(119,93,216,0.5)' : 'transparent',
                  opacity: locked ? 0.92 : 1,
                }}
              >
                <View className="p-4">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className={`flex-1 text-sm font-bold ${active ? 'text-obsidian-primary' : 'text-ethereal-ink'}`}
                      numberOfLines={1}
                    >
                      {track.title}
                    </Text>
                    {locked ? (
                      <View className="flex-row items-center gap-1 rounded-full bg-ethereal-neon/15 px-2 py-0.5">
                        <Crown color="#775DD8" size={10} strokeWidth={2.4} />
                        <Text className="text-[9px] font-bold uppercase text-ethereal-neon">Pro</Text>
                      </View>
                    ) : null}
                    {isFreeProgram ? (
                      <View className="rounded-full bg-emerald-500/15 px-2 py-0.5">
                        <Text className="text-[9px] font-bold uppercase text-emerald-600">Free</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="mt-1 text-xs leading-4 text-ethereal-slate" numberOfLines={2}>
                    {track.description}
                  </Text>
                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-[10px] font-semibold uppercase tracking-wider text-ethereal-slate">
                      {track.durationWeeks === 1 ? '8 days' : `${track.durationWeeks} wk`}
                    </Text>
                    {active ? <ChevronRight color="#775DD8" size={16} /> : null}
                  </View>
                </View>
              </GlassPanel>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
