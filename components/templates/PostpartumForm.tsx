import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NumericField from '@/components/form/NumericField';
import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import { copyToClipboard } from '@/services/export';
import {
  addStopToTodayTrip,
  buildMileageSummary,
  getTripForDate,
} from '@/services/trip/tripStorage';
import {
  createEmptyPostpartumForm,
  createEmptyTcbTrendRow,
  INFANT_SEX_OPTIONS,
  PostpartumFormData,
  TcbTrendRow,
  TSB_RISK_OPTIONS,
} from '@/store/postpartumTemplate';
import { formatDeliveryDateMdY } from '@/utils/formInputFilters';
import { formatEmrExport } from '@/utils/formatEmrExport';
import { formatPostpartumNote } from '@/utils/postpartumFormat';

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  placeholder,
  onBlur,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  placeholder?: string;
  onBlur?: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <ThemedTextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        scrollEnabled={false}
        textAlignVertical={multiline ? 'top' : 'center'}
        onBlur={onBlur}
      />
    </View>
  );
}

function PairedField({
  label,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  onChangeLeft,
  onChangeRight,
}: {
  label: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  onChangeLeft: (v: string) => void;
  onChangeRight: (v: string) => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.pairedRow}>
        <View style={styles.pairedCol}>
          <Text style={[styles.subLabel, { color: theme.textMuted }]}>{leftLabel}</Text>
          <ThemedTextInput style={styles.input} value={leftValue} onChangeText={onChangeLeft} />
        </View>
        <View style={styles.pairedCol}>
          <Text style={[styles.subLabel, { color: theme.textMuted }]}>{rightLabel}</Text>
          <ThemedTextInput style={styles.input} value={rightValue} onChangeText={onChangeRight} />
        </View>
      </View>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const { theme } = useAppTheme();
  return <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>;
}

function CheckboxRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.checkboxRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.checkboxLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function PostpartumForm() {
  const { createNote, isUnlocked, sessionPassword } = useVault();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<PostpartumFormData>(createEmptyPostpartumForm());
  const [previewVisible, setPreviewVisible] = useState(false);
  const [emrPreviewVisible, setEmrPreviewVisible] = useState(false);
  const [emrPreviewText, setEmrPreviewText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const updateField = <K extends keyof PostpartumFormData>(
    field: K,
    value: PostpartumFormData[K],
  ) => {
    setFormData((current) => {
      const next = { ...current, [field]: value };
      if (field === 'birthWeight' && typeof value === 'string') {
        next.bw = value;
      }
      return next;
    });
  };

  const updateTcbTrend = (index: number, field: keyof TcbTrendRow, value: string) => {
    setFormData((current) => ({
      ...current,
      tcbTrends: current.tcbTrends.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const addTcbTrendRow = () => {
    setFormData((current) => ({
      ...current,
      tcbTrends: [...current.tcbTrends, createEmptyTcbTrendRow()],
    }));
  };

  const removeTcbTrendRow = (index: number) => {
    setFormData((current) => ({
      ...current,
      tcbTrends:
        current.tcbTrends.length > 1
          ? current.tcbTrends.filter((_, rowIndex) => rowIndex !== index)
          : current.tcbTrends,
    }));
  };

  const formattedNote = formatPostpartumNote(formData);

  const finalizeForExport = useCallback(async (): Promise<PostpartumFormData> => {
    let data = formData;

    if (data.addToTrip && data.address.trim() && sessionPassword) {
      const trip = await addStopToTodayTrip(
        sessionPassword,
        data.address,
        data.birther.trim() || undefined,
      );
      data = {
        ...data,
        linkedTripId: trip.id,
        mileageSummary: buildMileageSummary(trip),
      };
      setFormData(data);
    } else if (sessionPassword) {
      const today = new Date().toISOString().slice(0, 10);
      const trip = await getTripForDate(sessionPassword, today);
      if (trip) {
        data = { ...data, mileageSummary: buildMileageSummary(trip) };
      }
    }

    return data;
  }, [formData, sessionPassword]);

  const handleCopy = async () => {
    const data = await finalizeForExport();
    await copyToClipboard(formatPostpartumNote(data), sessionPassword, 'postpartum');
    setStatusMessage('Copied — ready to paste into work software.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleCopyForEmr = async () => {
    const data = await finalizeForExport();
    const text = formatEmrExport({ plainText: formatPostpartumNote(data) });
    setEmrPreviewText(text);
    setEmrPreviewVisible(true);
  };

  const confirmEmrCopy = async () => {
    await copyToClipboard(emrPreviewText, sessionPassword, 'postpartum-emr');
    setEmrPreviewVisible(false);
    setStatusMessage('Copied for EMR — review before pasting into Plexia.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSave = async () => {
    if (!isUnlocked) {
      Alert.alert('Vault locked', 'Unlock the vault from Settings before saving notes.');
      return;
    }

    const data = await finalizeForExport();
    const title = data.birther.trim()
      ? `Postpartum - ${data.birther.trim()}`
      : 'Postpartum Nursing Note';
    await createNote(title, formatPostpartumNote(data), 'postpartum');
    Alert.alert('Saved', 'Note saved to your encrypted vault.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAwareScrollView
        extraBottomInset={insets.bottom + 78}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}>
        <Text style={[styles.title, { color: theme.text }]}>Postpartum Nursing Note</Text>

        <Field
          label="Postpartum Visit at Day/Week"
          value={formData.visitDayWeek}
          onChangeText={(text) => updateField('visitDayWeek', text)}
          placeholder="e.g. Day 3 / Week 1"
        />

        <SectionTitle title="BIRTHER | PARENT" />
        <PairedField
          label="Birther | Parent"
          leftLabel="Birther"
          leftValue={formData.birther}
          rightLabel="Parent"
          rightValue={formData.parent}
          onChangeLeft={(text) => updateField('birther', text)}
          onChangeRight={(text) => updateField('parent', text)}
        />
        <Field
          label="Address"
          value={formData.address}
          onChangeText={(text) => updateField('address', text)}
          placeholder="Patient address for visit / trip planning"
        />
        <View style={[styles.checkboxRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.checkboxLabel, { color: theme.textSecondary }]}>
            Include in today&apos;s trip
          </Text>
          <Switch
            value={formData.addToTrip}
            onValueChange={(value) => updateField('addToTrip', value)}
          />
        </View>

        <PairedField
          label="HX: G/P"
          leftLabel="G"
          leftValue={formData.gravida}
          rightLabel="P"
          rightValue={formData.para}
          onChangeLeft={(text) => updateField('gravida', text)}
          onChangeRight={(text) => updateField('para', text)}
        />
        <Field
          label="Date of Delivery (m/d/yyyy)"
          value={formData.deliveryDate}
          onChangeText={(text) => updateField('deliveryDate', text)}
          placeholder="m/d/yyyy"
          onBlur={() =>
            updateField('deliveryDate', formatDeliveryDateMdY(formData.deliveryDate))
          }
        />

        <Field label="General" value={formData.general} onChangeText={(t) => updateField('general', t)} multiline />
        <PairedField
          label="Vitals | BP"
          leftLabel="Vitals"
          leftValue={formData.vitals}
          rightLabel="BP"
          rightValue={formData.bp}
          onChangeLeft={(t) => updateField('vitals', t)}
          onChangeRight={(t) => updateField('bp', t)}
        />
        <PairedField
          label="BM | Void"
          leftLabel="BM"
          leftValue={formData.bm}
          rightLabel="Void"
          rightValue={formData.voiding}
          onChangeLeft={(t) => updateField('bm', t)}
          onChangeRight={(t) => updateField('voiding', t)}
        />
        <Field label="Incision/Perineum" value={formData.incision} onChangeText={(t) => updateField('incision', t)} multiline />
        <Field label="Lochia" value={formData.lochia} onChangeText={(t) => updateField('lochia', t)} />
        <PairedField
          label="Breasts | Nipples | Milk Supply"
          leftLabel="Breasts"
          leftValue={formData.breasts}
          rightLabel="Nipples"
          rightValue={formData.nipples}
          onChangeLeft={(t) => updateField('breasts', t)}
          onChangeRight={(t) => updateField('nipples', t)}
        />
        <Field label="Milk Supply" value={formData.milkSupply} onChangeText={(t) => updateField('milkSupply', t)} />
        <PairedField
          label="Medications | Supplements"
          leftLabel="Medications"
          leftValue={formData.medications}
          rightLabel="Supplements"
          rightValue={formData.supplements}
          onChangeLeft={(t) => updateField('medications', t)}
          onChangeRight={(t) => updateField('supplements', t)}
        />
        <Field label="Follow-up" value={formData.followUp} onChangeText={(t) => updateField('followUp', t)} multiline />

        <SectionTitle
          title={
            formData.infantSex.trim() || formData.infantName.trim()
              ? `INFANT - Baby ${formData.infantSex.trim()} ${formData.infantName.trim()}`.trim()
              : 'INFANT - Baby Girl/Boy NAME'
          }
        />
        <PairedField
          label="Baby Girl/Boy | Name"
          leftLabel="Girl/Boy"
          leftValue={formData.infantSex}
          rightLabel="Name"
          rightValue={formData.infantName}
          onChangeLeft={(t) => updateField('infantSex', t)}
          onChangeRight={(t) => updateField('infantName', t)}
        />
        <Text style={[styles.hint, { color: theme.textMuted }]}>{INFANT_SEX_OPTIONS.join(' / ')}</Text>
        <Field label="DOB" value={formData.infantDob} onChangeText={(t) => updateField('infantDob', t)} />
        <NumericField
          label="Birth Weight"
          value={formData.birthWeight}
          onChangeText={(t) => updateField('birthWeight', t)}
          suffix="grams"
        />
        <NumericField label="Apgar" value={formData.apgar} onChangeText={(t) => updateField('apgar', t)} />
        <Field label="HC" value={formData.headCircumference} onChangeText={(t) => updateField('headCircumference', t)} />
        <Field label="Length" value={formData.length} onChangeText={(t) => updateField('length', t)} />
        <Field label="PHN" value={formData.phn} onChangeText={(t) => updateField('phn', t)} />
        <Field label="Complications" value={formData.complications} onChangeText={(t) => updateField('complications', t)} multiline />

        <SectionTitle title="NEWBORN WEIGHT TRENDS" />
        <NumericField label="BW" value={formData.bw} onChangeText={(t) => updateField('bw', t)} suffix="g" />
        <NumericField
          label="Previous wt"
          value={formData.previousWeight}
          onChangeText={(t) => updateField('previousWeight', t)}
          suffix="g"
        />
        <Field
          label="Date of last visit (m/d/yyyy)"
          value={formData.lastVisitDate}
          onChangeText={(t) => updateField('lastVisitDate', t)}
          placeholder="m/d/yyyy"
        />
        <Field label="Date (today)" value={formData.visitDate} onChangeText={(t) => updateField('visitDate', t)} />
        <NumericField
          label="Today's Weight"
          value={formData.todaysWeight}
          onChangeText={(t) => updateField('todaysWeight', t)}
          suffix="g"
        />

        <SectionTitle title="NEWBORN TcB/TSB TRENDS" />
        {formData.tcbTrends.map((row, index) => (
          <View key={`tcb-${index}`} style={styles.tcbRow}>
            <Text style={[styles.subSectionLabel, { color: theme.textSecondary }]}>
              Row {index + 1}
            </Text>
            <NumericField
              label="@ hours"
              value={row.hours}
              onChangeText={(text) => updateTcbTrend(index, 'hours', text)}
              suffix="hrs"
            />
            <Field
              label="Risk Level"
              value={row.risk}
              onChangeText={(text) => updateTcbTrend(index, 'risk', text)}
              placeholder={TSB_RISK_OPTIONS.join(' / ')}
            />
            <Field
              label="DAT"
              value={row.dat}
              onChangeText={(text) => updateTcbTrend(index, 'dat', text)}
            />
            {formData.tcbTrends.length > 1 ? (
              <Pressable
                style={[styles.removeRowButton, { borderColor: theme.border }]}
                onPress={() => removeTcbTrendRow(index)}>
                <Text style={[styles.removeRowText, { color: theme.textMuted }]}>Remove row</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        <Pressable
          style={[styles.addRowButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={addTcbTrendRow}>
          <Text style={[styles.addRowText, { color: theme.text }]}>Add TcB/TSB row</Text>
        </Pressable>
        <PairedField
          label="Feeding | Feeding Plan"
          leftLabel="Feeding"
          leftValue={formData.feeding}
          rightLabel="Feeding Plan"
          rightValue={formData.feedingPlan}
          onChangeLeft={(t) => updateField('feeding', t)}
          onChangeRight={(t) => updateField('feedingPlan', t)}
        />
        <Field label="Sleeping" value={formData.sleeping} onChangeText={(t) => updateField('sleeping', t)} />
        <Field label="Stools" value={formData.stools} onChangeText={(t) => updateField('stools', t)} />
        <Field label="Voids" value={formData.voids} onChangeText={(t) => updateField('voids', t)} />
        <Field label="Exam | Vitals | Hips" value={formData.examHips} onChangeText={(t) => updateField('examHips', t)} multiline />
        <Field label="Color | Skin" value={formData.colorSkin} onChangeText={(t) => updateField('colorSkin', t)} />
        <Field label="Red Reflex" value={formData.redReflex} onChangeText={(t) => updateField('redReflex', t)} />
        <Field label="Umbilicus" value={formData.umbilicus} onChangeText={(t) => updateField('umbilicus', t)} />
        <Field
          label="Newborn Metabolic screen result"
          value={formData.metabolicResult}
          onChangeText={(t) => updateField('metabolicResult', t)}
        />

        <SectionTitle title="DISCUSSED THE FOLLOWING WITH THE PARENT(S):" />
        <CheckboxRow
          label="Vitamin D drops 400 IU daily"
          value={formData.vitaminD}
          onValueChange={(v) => updateField('vitaminD', v)}
        />
        <CheckboxRow
          label="Health Passport and immunization information from Public Health"
          value={formData.healthPassport}
          onValueChange={(v) => updateField('healthPassport', v)}
        />
        <CheckboxRow
          label={"Period of 'PURPLE' Crying"}
          value={formData.purpleCrying}
          onValueChange={(v) => updateField('purpleCrying', v)}
        />

        <SectionTitle title="Ongoing Concerns to Follow-Up On For Mom &/or Baby:" />
        <Field label="1." value={formData.ongoing1} onChangeText={(t) => updateField('ongoing1', t)} multiline />
        <Field label="2." value={formData.ongoing2} onChangeText={(t) => updateField('ongoing2', t)} multiline />

        <SectionTitle title="Next Appointment:" />
        <NumericField
          label="Will be seen in (days)"
          value={formData.appointmentDays}
          onChangeText={(t) => updateField('appointmentDays', t)}
          placeholder="___"
        />
        <Field
          label="Location"
          value={formData.appointmentLocation}
          onChangeText={(t) => updateField('appointmentLocation', t)}
          placeholder="home/clinic"
        />
      </KeyboardAwareScrollView>

      {statusMessage ? (
        <Text
          style={[
            styles.status,
            { backgroundColor: theme.successSurface, color: theme.success, bottom: 78 + insets.bottom },
          ]}>
          {statusMessage}
        </Text>
      ) : null}

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: 12 + insets.bottom },
        ]}>
        <Pressable style={[styles.footerButton, styles.secondaryButton]} onPress={() => setPreviewVisible(true)}>
          <Text style={styles.secondaryButtonText}>Preview</Text>
        </Pressable>
        <Pressable style={[styles.footerButton, styles.secondaryButton]} onPress={handleCopyForEmr}>
          <Text style={styles.secondaryButtonText}>Plexia</Text>
        </Pressable>
        <Pressable style={styles.footerButton} onPress={handleCopy}>
          <Text style={styles.footerButtonText}>Copy</Text>
        </Pressable>
        <Pressable style={[styles.footerButton, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.footerButtonText}>Save Note</Text>
        </Pressable>
      </View>

      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={[styles.previewContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>Formatted Note Preview</Text>
          <ScrollView style={styles.previewScroll}>
            <Text style={[styles.previewText, { color: theme.text }]}>{formattedNote}</Text>
          </ScrollView>
          <Pressable style={styles.footerButton} onPress={() => setPreviewVisible(false)}>
            <Text style={styles.footerButtonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={emrPreviewVisible} animationType="slide" onRequestClose={() => setEmrPreviewVisible(false)}>
        <View style={[styles.previewContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>Copy for Plexia / EMR</Text>
          <Text style={[styles.hint, { color: theme.textMuted, marginBottom: 8 }]}>
            Review before pasting. Clipboard auto-clears per your security timeout.
          </Text>
          <ScrollView style={styles.previewScroll}>
            <Text style={[styles.previewText, { color: theme.text }]}>{emrPreviewText}</Text>
          </ScrollView>
          <Pressable style={styles.footerButton} onPress={confirmEmrCopy}>
            <Text style={styles.footerButtonText}>Copy plain text</Text>
          </Pressable>
          <Pressable style={[styles.footerButton, styles.secondaryButton]} onPress={() => setEmrPreviewVisible(false)}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  field: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  subLabel: { fontSize: 12, marginBottom: 4 },
  hint: { fontSize: 12, marginBottom: 8 },
  input: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 0 },
  multiline: { minHeight: 80 },
  pairedRow: { flexDirection: 'row', gap: 8 },
  pairedCol: { flex: 1 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  checkboxLabel: { flex: 1, paddingRight: 12, fontSize: 14 },
  tcbRow: { marginBottom: 12, gap: 4 },
  subSectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  addRowButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  addRowText: { fontSize: 14, fontWeight: '600' },
  removeRowButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
  },
  removeRowText: { fontSize: 12, fontWeight: '600' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButton: { backgroundColor: '#059669' },
  secondaryButton: { backgroundColor: '#e5e7eb' },
  footerButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  secondaryButtonText: { color: '#111827', fontWeight: '600', fontSize: 13 },
  status: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
  previewContainer: { flex: 1, padding: 16 },
  previewTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  previewScroll: { flex: 1, marginBottom: 12 },
  previewText: { fontSize: 14, lineHeight: 22 },
});
