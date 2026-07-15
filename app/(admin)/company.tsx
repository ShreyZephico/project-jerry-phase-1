import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SectionHeader } from '@/components/ui/ContentBlocks';
import { AppButton, FilterChipGroup, FormField } from '@/components/ui/FormControls';
import ScreenContainer, { ScreenLoader } from '@/components/ui/ScreenContainer';
import { colors, radius, spacing } from '@/constants/colors';
import { businessTypes } from '@/constants/labels';
import {
  getCompanyProfile,
  updateCompanyProfile,
} from '@/services/companyService';
import type { CompanyProfile } from '@/types/app';
import {
  isValidEmail,
  isValidGst,
  isValidPan,
  isValidPhone,
  isValidPincode,
  required,
} from '@/utils/validation';

type FormErrors = Partial<Record<keyof CompanyProfile, string>>;

const emptyProfile: CompanyProfile = {
  id: '',
  logoUrl: null,
  companyName: '',
  legalBusinessName: '',
  businessType: 'proprietorship',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  supportPhone: '',
  email: '',
  supportEmail: '',
  gstNumber: '',
  panNumber: '',
  termsSummary: '',
  privacySummary: '',
  refundSummary: '',
  updatedAt: '',
};

export default function CompanyProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CompanyProfile>(emptyProfile);
  const [errors, setErrors] = useState<FormErrors>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getCompanyProfile();
      setForm(profile);
      setErrors({});
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};

    if (!required(form.companyName)) next.companyName = 'Company name is required';
    if (!required(form.legalBusinessName)) {
      next.legalBusinessName = 'Legal business name is required';
    }
    if (!required(form.businessType)) next.businessType = 'Business type is required';
    if (!required(form.addressLine1)) next.addressLine1 = 'Address is required';
    if (!required(form.city)) next.city = 'City is required';
    if (!required(form.state)) next.state = 'State is required';

    if (!required(form.pincode)) next.pincode = 'Pincode is required';
    else if (!isValidPincode(form.pincode)) next.pincode = 'Enter a valid 6-digit pincode';

    if (!required(form.phone)) next.phone = 'Phone is required';
    else if (
      !isValidPhone(form.phone) &&
      !/^\d{10,12}$/.test(form.phone.replace(/\s/g, ''))
    ) {
      next.phone = 'Enter a valid phone number';
    }

    if (!required(form.supportPhone)) next.supportPhone = 'Support phone is required';
    else if (!isValidPhone(form.supportPhone)) {
      next.supportPhone = 'Enter a valid 10-digit mobile';
    }

    if (!required(form.email)) next.email = 'Email is required';
    else if (!isValidEmail(form.email)) next.email = 'Enter a valid email';

    if (!required(form.supportEmail)) next.supportEmail = 'Support email is required';
    else if (!isValidEmail(form.supportEmail)) {
      next.supportEmail = 'Enter a valid email';
    }

    if (!required(form.gstNumber)) next.gstNumber = 'GST number is required';
    else if (!isValidGst(form.gstNumber)) next.gstNumber = 'Enter a valid GSTIN';

    if (!required(form.panNumber)) next.panNumber = 'PAN is required';
    else if (!isValidPan(form.panNumber)) next.panNumber = 'Enter a valid PAN';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) {
      Alert.alert('Validation', 'Please fix the highlighted fields.');
      return;
    }

    try {
      setSaving(true);
      const updated = await updateCompanyProfile({
        ...form,
        gstNumber: form.gstNumber.trim().toUpperCase(),
        panNumber: form.panNumber.trim().toUpperCase(),
      });
      setForm(updated);
      setEditing(false);
      Alert.alert('Success', 'Company profile updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to update company profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    setEditing(false);
    setErrors({});
    await load();
  }

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenLoader />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onRefresh={load}>
      <SectionHeader
        title="Company Profile"
        subtitle={editing ? 'Edit business details' : 'View business details'}
        right={editing ? 'Editing' : 'Read only'}
      />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => Alert.alert('Coming soon', 'Image picker coming soon')}
        style={styles.logoBox}
      >
        <Text style={styles.logoInitial}>
          {(form.companyName || 'P').slice(0, 1).toUpperCase()}
        </Text>
        <Text style={styles.logoHint}>Tap to upload logo</Text>
      </TouchableOpacity>

      <SectionHeader title="Business Identity" />
      <FormField
        label="Company Name"
        value={form.companyName}
        onChangeText={(t) => setField('companyName', t)}
        editable={editing}
        error={errors.companyName}
      />
      <FormField
        label="Legal Business Name"
        value={form.legalBusinessName}
        onChangeText={(t) => setField('legalBusinessName', t)}
        editable={editing}
        error={errors.legalBusinessName}
      />

      <Text style={styles.fieldLabel}>Business Type</Text>
      {editing ? (
        <FilterChipGroup
          options={businessTypes}
          value={form.businessType}
          onChange={(key) => setField('businessType', key)}
        />
      ) : (
        <Text style={styles.readValue}>
          {businessTypes.find((b) => b.key === form.businessType)?.label ??
            form.businessType}
        </Text>
      )}
      {errors.businessType ? (
        <Text style={styles.errorText}>{errors.businessType}</Text>
      ) : null}

      <SectionHeader title="Address" />
      <FormField
        label="Address Line 1"
        value={form.addressLine1}
        onChangeText={(t) => setField('addressLine1', t)}
        editable={editing}
        error={errors.addressLine1}
      />
      <FormField
        label="Address Line 2"
        value={form.addressLine2}
        onChangeText={(t) => setField('addressLine2', t)}
        editable={editing}
      />
      <FormField
        label="City"
        value={form.city}
        onChangeText={(t) => setField('city', t)}
        editable={editing}
        error={errors.city}
      />
      <FormField
        label="State"
        value={form.state}
        onChangeText={(t) => setField('state', t)}
        editable={editing}
        error={errors.state}
      />
      <FormField
        label="Pincode"
        value={form.pincode}
        onChangeText={(t) => setField('pincode', t)}
        editable={editing}
        keyboardType="number-pad"
        maxLength={6}
        error={errors.pincode}
      />

      <SectionHeader title="Contact" />
      <FormField
        label="Phone"
        value={form.phone}
        onChangeText={(t) => setField('phone', t)}
        editable={editing}
        keyboardType="phone-pad"
        error={errors.phone}
      />
      <FormField
        label="Support Phone"
        value={form.supportPhone}
        onChangeText={(t) => setField('supportPhone', t)}
        editable={editing}
        keyboardType="phone-pad"
        error={errors.supportPhone}
      />
      <FormField
        label="Email"
        value={form.email}
        onChangeText={(t) => setField('email', t)}
        editable={editing}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <FormField
        label="Support Email"
        value={form.supportEmail}
        onChangeText={(t) => setField('supportEmail', t)}
        editable={editing}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.supportEmail}
      />

      <SectionHeader title="Tax Details" />
      <FormField
        label="GST Number"
        value={form.gstNumber}
        onChangeText={(t) => setField('gstNumber', t.toUpperCase())}
        editable={editing}
        autoCapitalize="characters"
        error={errors.gstNumber}
      />
      <FormField
        label="PAN Number"
        value={form.panNumber}
        onChangeText={(t) => setField('panNumber', t.toUpperCase())}
        editable={editing}
        autoCapitalize="characters"
        error={errors.panNumber}
      />

      <SectionHeader title="Policy Summaries" />
      <FormField
        label="Terms Summary"
        value={form.termsSummary}
        onChangeText={(t) => setField('termsSummary', t)}
        editable={editing}
        multiline
        style={styles.multiline}
      />
      <FormField
        label="Privacy Summary"
        value={form.privacySummary}
        onChangeText={(t) => setField('privacySummary', t)}
        editable={editing}
        multiline
        style={styles.multiline}
      />
      <FormField
        label="Refund Summary"
        value={form.refundSummary}
        onChangeText={(t) => setField('refundSummary', t)}
        editable={editing}
        multiline
        style={styles.multiline}
      />

      {editing ? (
        <View style={styles.actions}>
          <AppButton
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving}
          />
          <AppButton title="Cancel" onPress={handleCancel} variant="secondary" />
        </View>
      ) : (
        <AppButton title="Edit Profile" onPress={() => setEditing(true)} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    alignSelf: 'center',
    width: 112,
    height: 112,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.brandTitle,
  },
  logoHint: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandTitle,
    marginBottom: spacing.sm,
  },
  readValue: {
    fontSize: 15,
    color: colors.textBody,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
