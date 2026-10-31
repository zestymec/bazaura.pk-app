import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { Check } from '../icons';
import type { TimelineStep } from '../../api/types';
import { formatDateTime } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/** Vertical order stepper. Labels come from the server (§7.9). */
export const Timeline: React.FC<{ steps: TimelineStep[] }> = ({ steps }) => (
  <View>
    {steps.map((step, i) => {
      const last = i === steps.length - 1;
      const done = step.isCompleted;
      return (
        <View key={step.status} style={styles.row}>
          <View style={styles.rail}>
            <View style={[styles.dot, done && styles.dotDone, step.isCurrent && styles.dotCurrent]}>
              {done && <Check size={11} color={colors.neutral.white} strokeWidth={3} />}
            </View>
            {!last && <View style={[styles.line, done && steps[i + 1]?.isCompleted && styles.lineDone]} />}
          </View>
          <View style={styles.text}>
            <Text style={[styles.label, !done && !step.isCurrent && styles.labelMuted, step.isCurrent && styles.labelCurrent]}>
              {step.label}
            </Text>
            {!!step.completedAt && <Text style={styles.time}>{formatDateTime(step.completedAt)}</Text>}
          </View>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: 48 },
  rail: { width: 28, alignItems: 'center' },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  dotCurrent: { borderColor: colors.primary[500], borderWidth: 3 },
  line: { flex: 1, width: 2, backgroundColor: colors.neutral[200], marginVertical: 2 },
  lineDone: { backgroundColor: colors.primary[500] },
  text: { flex: 1, paddingLeft: 8, paddingBottom: 14 },
  label: { fontSize: 14, fontWeight: typography.weight.semibold, color: colors.neutral[900] },
  labelMuted: { color: colors.neutral[400] },
  labelCurrent: { fontWeight: typography.weight.extrabold, color: colors.primary[700] },
  time: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
});
