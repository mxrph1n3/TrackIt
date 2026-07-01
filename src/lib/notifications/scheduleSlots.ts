import type { ScheduledSlotConfig } from './types';

export const NOTIFICATION_SCHEDULE_SLOTS: ScheduledSlotConfig[] = [
  {
    id: 'trackit-slot-morning',
    hour: 8,
    minute: 0,
    slot: 'morning',
    channelId: 'trackit-morning',
    channelName: 'TrackIt · Morning',
    always: true,
  },
  {
    id: 'trackit-slot-midday',
    hour: 12,
    minute: 0,
    slot: 'midday',
    channelId: 'trackit-midday',
    channelName: 'TrackIt · Midday',
  },
  {
    id: 'trackit-slot-afternoon',
    hour: 16,
    minute: 0,
    slot: 'afternoon',
    channelId: 'trackit-afternoon',
    channelName: 'TrackIt · Progress',
  },
  {
    id: 'trackit-slot-evening',
    hour: 19,
    minute: 0,
    slot: 'evening',
    channelId: 'trackit-evening',
    channelName: 'TrackIt · Evening',
  },
  {
    id: 'trackit-slot-night',
    hour: 21,
    minute: 0,
    slot: 'night',
    channelId: 'trackit-night',
    channelName: 'TrackIt · Summary',
  },
  {
    id: 'trackit-slot-late',
    hour: 22,
    minute: 0,
    slot: 'late',
    channelId: 'trackit-late',
    channelName: 'TrackIt · Final',
  },
];

export const SLOT_IDS = NOTIFICATION_SCHEDULE_SLOTS.map((slot) => slot.id);
