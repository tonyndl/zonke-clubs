import React, { useState, useCallback } from "react";
import { Image, View, StyleSheet } from "react-native";

interface Props {
  uri: string;
  posX?: number; // 0–100, maps to CSS objectPosition X%
  posY?: number; // 0–100, maps to CSS objectPosition Y%
  height: number;
  style?: object;
  children?: React.ReactNode;
}

/**
 * Replicates CSS `objectFit: cover` + `objectPosition: X% Y%` in React Native.
 * Loads the image's natural dimensions, scales it to cover the container, then
 * shifts it so the focal point (posX, posY) stays visible — exactly matching
 * the admin preview behaviour.
 */
export function PositionedBannerImage({
  uri,
  posX = 50,
  posY = 50,
  height,
  style,
  children,
}: Props) {
  const [containerW, setContainerW] = useState(0);
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const onLayout = useCallback((e: any) => {
    setContainerW(e.nativeEvent.layout.width);
  }, []);

  const onLoad = useCallback(() => {
    Image.getSize(uri, (w, h) => setImgSize({ width: w, height: h }));
  }, [uri]);

  let imgStyle: object;

  if (!containerW || !imgSize) {
    // While dimensions are loading, fall back to centered cover
    imgStyle = StyleSheet.absoluteFill;
  } else {
    const scale = Math.max(containerW / imgSize.width, height / imgSize.height);
    const scaledW = imgSize.width * scale;
    const scaledH = imgSize.height * scale;
    const left = -(((scaledW - containerW) * posX) / 100);
    const top = -(((scaledH - height) * posY) / 100);
    imgStyle = {
      position: "absolute" as const,
      width: scaledW,
      height: scaledH,
      left,
      top,
    };
  }

  return (
    <View style={[style, { height, overflow: "hidden" }]} onLayout={onLayout}>
      <Image
        source={{ uri }}
        style={imgStyle}
        resizeMode={!containerW || !imgSize ? "cover" : "stretch"}
        onLoad={onLoad}
      />
      {children}
    </View>
  );
}
