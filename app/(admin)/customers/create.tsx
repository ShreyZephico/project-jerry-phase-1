import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppAlert } from '@/components/ui/AppAlert';
import { SectionHeader } from '@/components/ui/ContentBlocks';
import {
  AppButton,
  FilterChipGroup,
  FormField,
} from '@/components/ui/FormControls';
import ScreenContainer from '@/components/ui/ScreenContainer';
import { colors, spacing } from '@/constants/colors';
import { genderOptions } from '@/constants/labels';
import { createCustomer } from '@/services/customerService';
import {
  isValidEmail,
  isValidPan,
  isValidPhone,
  isValidPincode,
  required,
} from '@/utils/validation';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
  fullName: '',
  email: '',
  phone: '',
  gender: 'male',
  dob: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  pan: '',
  notes: '',
};

export default function CreateCustomerScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};

    if (!required(form.fullName)) next.fullName = 'Full name is required';
    if (!required(form.email)) next.email = 'Email is required';
    else if (!isValidEmail(form.email)) next.email = 'Enter a valid email';
    if (!required(form.phone)) next.phone = 'Phone is required';
    else if (!isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile';
    if (!required(form.address)) next.address = 'Address is required';
    if (!required(form.city)) next.city = 'City is required';
    if (!required(form.state)) next.state = 'State is required';
    if (!required(form.pincode)) next.pincode = 'Pincode is required';
    else if (!isValidPincode(form.pincode)) next.pincode = 'Enter a valid 6-digit pincode';
    if (form.pan.trim() && !isValidPan(form.pan)) next.pan = 'Enter a valid PAN';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreate() {
    if (!validate()) {
      showAlert({
        type: 'warning',
        title: 'Incomplete form',
        message: 'Please fix the highlighted fields before continuing.',
      });
      return;
    }

    try {
      setSaving(true);
      const created = await createCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\s/g, ''),
        gender: form.gender,
        dob: form.dob.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        pan: form.pan.trim().toUpperCase() || undefined,
        notes: form.notes.trim() || undefined,
      });
      showAlert({
        type: 'success',
        title: 'Customer created',
        message: 'Wallet account is ready.',
        details: [
          { label: 'Name', value: created.fullName },
          { label: 'Phone', value: created.phone },
        ],
        primaryAction: {
          label: 'View customer',
          onPress: () => router.replace(`/(admin)/customers/${created.id}`),
        },
        secondaryAction: {
          label: 'Done',
          onPress: () => router.back(),
        },
      });
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Create failed',
        message: err?.message ?? 'Failed to create customer.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <SectionHeader
        title="Create Customer"
        subtitle="Register a new wallet customer"
      />

      <FormField
        label="Full Name"
        value={form.fullName}
        onChangeText={(t) => setField('fullName', t)}
        error={errors.fullName}
      />
      <FormField
        label="Email"
        value={form.email}
        onChangeText={(t) => setField('email', t)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <FormField
        label="Phone"
        value={form.phone}
        onChangeText={(t) => setField('phone', t)}
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <Text style={styles.fieldLabel}>Gender</Text>
      <FilterChipGroup
        options={genderOptions}
        value={form.gender}
        onChange={(key) => setField('gender', key)}
      />

      <FormField
        label="Date of Birth"
        value={form.dob}
        onChangeText={(t) => setField('dob', t)}
        placeholder="YYYY-MM-DD"
      />
      <FormField
        label="Address"
        value={form.address}
        onChangeText={(t) => setField('address', t)}
        error={errors.address}
      />
      <FormField
        label="City"
        value={form.city}
        onChangeText={(t) => setField('city', t)}
        error={errors.city}
      />
      <FormField
        label="State"
        value={form.state}
        onChangeText={(t) => setField('state', t)}
        error={errors.state}
      />
      <FormField
        label="Pincode"
        value={form.pincode}
        onChangeText={(t) => setField('pincode', t)}
        keyboardType="number-pad"
        maxLength={6}
        error={errors.pincode}
      />
      <FormField
        label="PAN"
        value={form.pan}
        onChangeText={(t) => setField('pan', t.toUpperCase())}
        autoCapitalize="characters"
        error={errors.pan}
      />
      <FormField
        label="Notes"
        value={form.notes}
        onChangeText={(t) => setField('notes', t)}
        multiline
        style={styles.multiline}
      />

      <View style={styles.actions}>
        <AppButton
          title={saving ? 'Creating...' : 'Create Customer'}
          onPress={handleCreate}
          disabled={saving}
        />
        <AppButton title="Cancel" onPress={() => router.back()} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandTitle,
    marginBottom: spacing.sm,
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
