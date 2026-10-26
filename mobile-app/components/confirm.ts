import { Alert, Platform } from 'react-native'

// Alert.alert là no-op trên web — dùng window.confirm khi chạy web preview,
// giữ nguyên Alert trên iOS/Android (nền tảng mục tiêu chính).
export function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`))
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Không', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Đồng ý', style: 'default', onPress: () => resolve(true) }
    ])
  })
}
