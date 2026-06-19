import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useVault } from '@/context/VaultContext';
import { copyToClipboard } from '@/services/export';
import {
  createEmptyPostpartumForm,
  INFANT_SEX_OPTIONS,
  PostpartumFormData,
  TSB_RISK_OPTIONS,
} from '@/store/postpartumTemplate';
import { formatPostpartumNote } from '@/utils/postpartumFormat';

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
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
  return (
    <View style={styles.checkboxRow}>
      <Text style={styles.checkboxLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function PostpartumForm() {
  const { createNote, isUnlocked } = useVault();
  const [formData, setFormData] = useState<PostpartumFormData>(createEmptyPostpartumForm());
  const [previewVisible, setPreviewVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const formattedNote = useMemo(() => formatPostpartumNote(formData), [formData]);

  const updateField = <K extends keyof PostpartumFormData>(field: K, value: PostpartumFormData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleCopy = async () => {
    await copyToClipboard(formattedNote);
    setStatusMessage('Copied — ready to paste into work software.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSave = async () => {
    if (!isUnlocked) {
      Alert.alert('Vault locked', 'Unlock the vault from Settings before saving notes.');
      return;
    }

    const title = formData.birther.trim()
      ? `Postpartum - ${formData.birther.trim()}`
      : 'Postpartum Nursing Note';
    await createNote(title, formattedNote, 'postpartum');
    Alert.alert('Saved', 'Note saved to your encrypted vault.');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Postpartum Nursing Note</Text>

        <SectionTitle title="Visit" />
        <Field
          label="Day/Week"
          value={formData.visitDayWeek}
          onChangeText={(text) => updateField('visitDayWeek', text)}
          placeholder="e.g. Day 3 / Week 1"
        />

        <SectionTitle title="Birther | Parent" />
        <Field label="Birther" value={formData.birther} onChangeText={(text) => updateField('birther', text)} />
        <Field label="Parent" value={formData.parent} onChangeText={(text) => updateField('parent', text)} />
        <Field label="Gravida (G)" value={formData.gravida} onChangeText={(text) => updateField('gravida', text)} />
        <Field label="Para (P)" value={formData.para} onChangeText={(text) => updateField('para', text)} />
        <Field
          label="Date of Delivery"
          value={formData.deliveryDate}
          onChangeText={(text) => updateField('deliveryDate', text)}
        />

        <SectionTitle title="Maternal Assessment" />
        <Field label="General" value={formData.general} onChangeText={(text) => updateField('general', text)} multiline />
        <Field label="Vitals" value={formData.vitals} onChangeText={(text) => updateField('vitals', text)} />
        <Field label="BP" value={formData.bp} onChangeText={(text) => updateField('bp', text)} />
        <Field label="BM (Breastfeeding)" value={formData.breastfeeding} onChangeText={(text) => updateField('breastfeeding', text)} />
        <Field label="Void" value={formData.voiding} onChangeText={(text) => updateField('voiding', text)} />
        <Field label="Incision/Perineum" value={formData.incision} onChangeText={(text) => updateField('incision', text)} multiline />
        <Field label="Lochia" value={formData.lochia} onChangeText={(text) => updateField('lochia', text)} />
        <Field label="Breasts" value={formData.breasts} onChangeText={(text) => updateField('breasts', text)} />
        <Field label="Nipples" value={formData.nipples} onChangeText={(text) => updateField('nipples', text)} />
        <Field label="Milk Supply" value={formData.milkSupply} onChangeText={(text) => updateField('milkSupply', text)} />
        <Field label="Medications" value={formData.medications} onChangeText={(text) => updateField('medications', text)} />
        <Field label="Supplements" value={formData.supplements} onChangeText={(text) => updateField('supplements', text)} />
        <Field label="Follow-up" value={formData.followUp} onChangeText={(text) => updateField('followUp', text)} multiline />

        <SectionTitle title="Infant" />
        <Field
          label="Sex (Girl/Boy)"
          value={formData.infantSex}
          onChangeText={(text) => updateField('infantSex', text)}
          placeholder={INFANT_SEX_OPTIONS.join(' / ')}
        />
        <Field label="Name" value={formData.infantName} onChangeText={(text) => updateField('infantName', text)} />
        <Field label="DOB" value={formData.infantDob} onChangeText={(text) => updateField('infantDob', text)} />
        <Field label="Birth Weight" value={formData.birthWeight} onChangeText={(text) => updateField('birthWeight', text)} />
        <Field label="Apgar" value={formData.apgar} onChangeText={(text) => updateField('apgar', text)} />
        <Field label="HC" value={formData.headCircumference} onChangeText={(text) => updateField('headCircumference', text)} />
        <Field label="Length" value={formData.length} onChangeText={(text) => updateField('length', text)} />
        <Field label="PHN" value={formData.phn} onChangeText={(text) => updateField('phn', text)} />
        <Field label="Complications" value={formData.complications} onChangeText={(text) => updateField('complications', text)} multiline />

        <SectionTitle title="Newborn Weight Trends" />
        <Field label="BW" value={formData.bw} onChangeText={(text) => updateField('bw', text)} />
        <Field label="Previous wt" value={formData.previousWeight} onChangeText={(text) => updateField('previousWeight', text)} />

        <SectionTitle title="Newborn TcB/TSB Trends" />
        <Field label="Hours" value={formData.tcbHours} onChangeText={(text) => updateField('tcbHours', text)} placeholder="e.g. 24" />
        <Field
          label="Risk Level"
          value={formData.tsbRisk}
          onChangeText={(text) => updateField('tsbRisk', text)}
          placeholder={TSB_RISK_OPTIONS.join(' / ')}
        />
        <Field label="DAT" value={formData.tsbDat} onChangeText={(text) => updateField('tsbDat', text)} />
        <Field label="Additional TcB/TSB line" value={formData.tcbSecondLine} onChangeText={(text) => updateField('tcbSecondLine', text)} multiline />

        <SectionTitle title="Newborn Care" />
        <Field label="Feeding" value={formData.feeding} onChangeText={(text) => updateField('feeding', text)} />
        <Field label="Feeding Plan" value={formData.feedingPlan} onChangeText={(text) => updateField('feedingPlan', text)} multiline />
        <Field label="Sleeping" value={formData.sleeping} onChangeText={(text) => updateField('sleeping', text)} />
        <Field label="Stools" value={formData.stools} onChangeText={(text) => updateField('stools', text)} />
        <Field label="Voids" value={formData.voids} onChangeText={(text) => updateField('voids', text)} />
        <Field label="Exam | Vitals | Hips" value={formData.examHips} onChangeText={(text) => updateField('examHips', text)} multiline />
        <Field label="Color | Skin" value={formData.colorSkin} onChangeText={(text) => updateField('colorSkin', text)} />
        <Field label="Red Reflex" value={formData.redReflex} onChangeText={(text) => updateField('redReflex', text)} />
        <Field label="Umbilicus" value={formData.umbilicus} onChangeText={(text) => updateField('umbilicus', text)} />
        <Field
          label="Newborn Metabolic screen result"
          value={formData.metabolicResult}
          onChangeText={(text) => updateField('metabolicResult', text)}
        />

        <SectionTitle title="Parent Education Discussed" />
        <CheckboxRow
          label="Discussed Vitamin D drops 400 IU daily"
          value={formData.vitaminD}
          onValueChange={(value) => updateField('vitaminD', value)}
        />
        <CheckboxRow
          label="Received Health Passport and immunization information"
          value={formData.healthPassport}
          onValueChange={(value) => updateField('healthPassport', value)}
        />
        <CheckboxRow
          label="Aware of Period of 'PURPLE' Crying"
          value={formData.purpleCrying}
          onValueChange={(value) => updateField('purpleCrying', value)}
        />

        <SectionTitle title="Follow-Up" />
        <Field label="Ongoing concern 1" value={formData.ongoing1} onChangeText={(text) => updateField('ongoing1', text)} multiline />
        <Field label="Ongoing concern 2" value={formData.ongoing2} onChangeText={(text) => updateField('ongoing2', text)} multiline />
        <Field
          label="Next appointment (days)"
          value={formData.appointmentDays}
          onChangeText={(text) => updateField('appointmentDays', text)}
          placeholder="e.g. 3"
        />
        <Field
          label="Next appointment location"
          value={formData.appointmentLocation}
          onChangeText={(text) => updateField('appointmentLocation', text)}
          placeholder="home/clinic"
        />
      </ScrollView>

      {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}

      <View style={styles.footer}>
        <Pressable style={[styles.footerButton, styles.secondaryButton]} onPress={() => setPreviewVisible(true)}>
          <Text style={styles.secondaryButtonText}>Preview</Text>
        </Pressable>
        <Pressable style={styles.footerButton} onPress={handleCopy}>
          <Text style={styles.footerButtonText}>Copy to Clipboard</Text>
        </Pressable>
        <Pressable style={[styles.footerButton, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.footerButtonText}>Save Note</Text>
        </Pressable>
      </View>

      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Formatted Note Preview</Text>
          <ScrollView style={styles.previewScroll}>
            <Text style={styles.previewText}>{formattedNote}</Text>
          </ScrollView>
          <Pressable style={styles.footerButton} onPress={() => setPreviewVisible(false)}>
            <Text style={styles.footerButtonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#1f2937',
  },
  field: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  multiline: {
    minHeight: 80,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkboxLabel: {
    flex: 1,
    paddingRight: 12,
    color: '#374151',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#059669',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 13,
  },
  status: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 78,
    backgroundColor: '#ecfdf5',
    color: '#047857',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  previewScroll: {
    flex: 1,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#111827',
  },
});
