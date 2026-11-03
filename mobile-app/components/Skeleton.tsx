import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { palette, radius, spacing } from '../constants/theme'

// Skeleton loading mượt (fade pulse) — thay spinner cho danh sách/grid
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.45)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return <Animated.View style={[styles.base, style, { opacity }]} />
}

// Lưới skeleton cho danh sách sản phẩm 2 cột
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton style={styles.image} />
          <View style={styles.cardBody}>
            <Skeleton style={styles.line} />
            <Skeleton style={[styles.line, { width: '55%' }]} />
            <Skeleton style={[styles.lineShort, { width: '40%' }]} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  base: { backgroundColor: palette.border, borderRadius: radius.sm },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    paddingHorizontal: spacing.lg
  },
  card: {
    flex: 1, minWidth: '45%',
    backgroundColor: palette.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: palette.border, overflow: 'hidden'
  },
  image: { height: 120, borderRadius: 0 },
  cardBody: { padding: spacing.md, gap: spacing.sm },
  line: { height: 12, borderRadius: 6 },
  lineShort: { height: 12, borderRadius: 6 }
})
