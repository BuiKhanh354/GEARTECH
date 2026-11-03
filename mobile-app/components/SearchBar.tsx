import { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, radius, spacing } from '../constants/theme'

// Ô tìm kiếm dùng chung: có trạng thái focus, nút xóa và nút gửi
export function SearchBar({ value, onChangeText, onSubmit, placeholder = 'Tìm sản phẩm...' }: {
  value: string
  onChangeText: (v: string) => void
  onSubmit?: () => void
  placeholder?: string
}) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.box, focused && styles.boxFocused]}>
      <Ionicons
        name="search"
        size={16}
        color={focused ? palette.brand : palette.faint}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={palette.faint}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity
          hitSlop={10}
          onPress={() => {
            onChangeText('')
            onSubmit?.()
          }}
        >
          <Ionicons name="close-circle" size={17} color={palette.borderStrong} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity hitSlop={10} onPress={onSubmit}>
          <Ionicons name="arrow-forward-circle" size={22} color={palette.brand} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  boxFocused: {
    backgroundColor: palette.surface,
    borderColor: palette.brand
  },
  input: { flex: 1, fontSize: 13, color: palette.ink, padding: 0 }
})
