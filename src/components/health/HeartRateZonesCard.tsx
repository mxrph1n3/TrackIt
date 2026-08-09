import { Heart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { tHeartRateZoneName } from '../../i18n/helpers';
import { formatZoneRange } from '../../lib/health/heartRateEngine';
import type { HeartRateProfile, HeartRateZone } from '../../types/workout';
import { GlassPanel } from '../GlassPanel';

type HeartRateZonesCardProps = {
  profile: HeartRateProfile;
  activeZones?: number[];
  compact?: boolean;
};

function ZoneRow({ zone, active }: { zone: HeartRateZone; active: boolean }) {
  const { t } = useTranslation();
  return (
    <View
      className={`mb-2 flex-row items-center justify-between rounded-xl px-3 py-2 ${
        active ? 'border border-obsidian-primary/40 bg-obsidian-primary/10' : 'bg-white/5'
      }`}
    >
      <View className="flex-1 pr-2">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-ethereal-slate">
          {t('health.zoneLabel', { zone: zone.zone })}
        </Text>
        <Text className="mt-0.5 text-xs font-semibold text-ethereal-ink">
          {tHeartRateZoneName(t, zone.zone, zone.name)}
        </Text>
      </View>
      <Text className={`text-sm font-bold ${active ? 'text-obsidian-primary' : 'text-ethereal-ink'}`}>
        {formatZoneRange(zone)}
      </Text>
    </View>
  );
}

export function HeartRateZonesCard({ profile, activeZones = [1, 2], compact = false }: HeartRateZonesCardProps) {
  const { t } = useTranslation();
  return (
    <GlassPanel borderRadius={18}>
      <View className={compact ? 'p-3' : 'p-4'}>
        <View className="mb-3 flex-row items-center gap-2">
          <Heart color="#775DD8" size={16} />
          <Text className="text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
            {t('health.hrZonesTitle', { max: profile.maxHr })}
          </Text>
        </View>

        {profile.zones.map((zone) => (
          <ZoneRow key={zone.zone} zone={zone} active={activeZones.includes(zone.zone)} />
        ))}
      </View>
    </GlassPanel>
  );
}
