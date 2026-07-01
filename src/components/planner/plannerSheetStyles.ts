import { StyleSheet } from 'react-native';

import { BRAND, RADIUS, TEXT } from '../../theme/designTokens';

export const plannerSheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(30, 26, 62, 0.32)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: TEXT.muted,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT.primary,
    marginTop: 4,
    marginBottom: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: TEXT.muted,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(119, 93, 216, 0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT.primary,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingRight: 8,
  },
  chip: {
    maxWidth: 180,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(119, 93, 216, 0.12)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  chipActive: {
    borderColor: 'rgba(119, 93, 216, 0.45)',
    backgroundColor: 'rgba(119, 93, 216, 0.1)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT.secondary,
  },
  chipTextActive: {
    color: TEXT.primary,
  },
  hint: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  error: {
    color: '#F87171',
    fontSize: 13,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(119, 93, 216, 0.15)',
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.secondary,
  },
  primaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: BRAND.primary,
    minHeight: 48,
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
