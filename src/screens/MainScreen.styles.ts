import { StyleSheet } from 'react-native'
import { colors } from '../constants/colours'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 60,
    paddingBottom: 16,
  },
  stabilityLabel: {
    color: colors.text.muted,
    fontSize: 14,
  },
  stabilityValue: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: colors.bg.card,
    marginHorizontal: 14,
    borderRadius: 2,
    padding: 10,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  insightDot: {
    color: colors.text.muted,
    fontSize: 12,
    marginTop: 2,
  },
  insightText: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  groupBlock: {
    marginHorizontal: 18,
    marginBottom: 14,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '500',
  },
  groupScore: {
    fontSize: 15,
    fontWeight: '500',
  },
  serverCard: {
    backgroundColor: colors.bg.card,
    borderRadius: 2,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderLeftWidth: 2.5,
  },
  serverCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serverName: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  serverUpdated: {
    color: colors.text.hint,
    fontSize: 10,
  },
  serverScore: {
    fontSize: 18,
    fontWeight: '500',
  },
  serverScoreLabel: {
    color: colors.text.hint,
    fontSize: 9,
    textAlign: 'right',
    marginTop: 1,
  },
  serverMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    color: colors.text.hint,
    fontSize: 9,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  countersBlock: {
    marginHorizontal: 18,
    marginTop: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  counterLabel: {
    color: colors.text.muted,
    fontSize: 14,
  },
  counterValue: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
})