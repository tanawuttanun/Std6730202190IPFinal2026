import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import GradientButton from '../common/GradientButton';
import { colors } from '../../constants/theme';
import { showAlert } from '../../utils/alert';
import { MAX_TEXT_LENGTH, parseSalary, validateEmployee } from '../../utils/validation';

export default function AddEmployeeForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // A ref (not state) blocks a fast double tap from creating the employee twice.
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    const error = validateEmployee({ name, position, salary });
    if (error) {
      // Prevent submission: request is never sent to the API.
      showAlert('Invalid input', error);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const ok = await onSubmit({
        name: name.trim(),
        position: position.trim(),
        salary: parseSalary(salary),
      });
      if (ok) {
        setName('');
        setPosition('');
        setSalary('');
        Keyboard.dismiss();
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Add Employee</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        maxLength={MAX_TEXT_LENGTH}
      />
      <TextInput
        style={styles.input}
        placeholder="Position"
        placeholderTextColor={colors.textMuted}
        value={position}
        onChangeText={setPosition}
        maxLength={MAX_TEXT_LENGTH}
      />
      <TextInput
        style={styles.input}
        placeholder="Salary (e.g. 35000)"
        placeholderTextColor={colors.textMuted}
        value={salary}
        onChangeText={(t) => setSalary(t.replace(/[^0-9.,]/g, ''))}
        keyboardType="numeric"
        maxLength={15}
      />
      <GradientButton title="+  Add Employee" onPress={handleSubmit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },
});
