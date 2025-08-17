// Scale.ts
import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 以 iPhone 14 Pro (393 x 852 pt) 作为基准设计稿尺寸
const guidelineBaseWidth = 393;
const guidelineBaseHeight = 852;

// 屏幕宽度、高度的缩放比例
const scaleWidth = SCREEN_WIDTH / guidelineBaseWidth;
const scaleHeight = SCREEN_HEIGHT / guidelineBaseHeight;

function scale(size: number): number {
  return size * scaleWidth;
}

function verticalScale(size: number): number {
  return size * scaleHeight;
}

function moderateScale(size: number, factor = 0.5): number {
  // 根据宽度缩放，但不要完全线性，可以调节 factor（0~1）
  return size + (scale(size) - size) * factor;
}

function normalizeFont(size: number): number {
  const newSize = size * scaleWidth;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    // Android 字体渲染偏大，微调
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) / 3 * 2;
  }
}

export const Scale = {
  width: scale,          // 水平方向缩放 (paddingHorizontal, marginLeft 等)
  height: verticalScale, // 垂直方向缩放 (paddingVertical, marginTop 等)
  moderate: moderateScale, // 适度缩放（按钮宽高常用）
  font: normalizeFont,   // 跨平台统一字体
};


{/*
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Scale } from './Scale';

export default function App() {
  return (
    <View
      style={[
        styles.container,
        { padding: Scale.width(16), margin: Scale.height(20) },
      ]}
    >
      <Text style={{ fontSize: Scale.font(16), marginBottom: Scale.height(10) }}>
        Hello World
      </Text>
      <View
        style={{
          width: Scale.width(200),
          height: Scale.height(60),
          backgroundColor: 'skyblue',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: Scale.moderate(12),
        }}
      >
        <Text style={{ fontSize: Scale.font(18), fontWeight: 'bold' }}>
          Button
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

*/}
