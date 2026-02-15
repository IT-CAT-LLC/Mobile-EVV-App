import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { ThemedText, ThemedView } from "../Themed";
import { theme } from "@/theme";

const CONTAINER_SIZE = 160;
const SHADER_SIZE = 140;
const LOGO_SIZE = 120;

const SHADER_OFFSET = (CONTAINER_SIZE - SHADER_SIZE) / 2;
const LOGO_OFFSET = (CONTAINER_SIZE - LOGO_SIZE) / 2;
const BORDER_RADIUS = SHADER_SIZE / 2;

function HolographicGradientWeb() {
  return (
    <div
      style={{
        width: SHADER_SIZE,
        height: SHADER_SIZE,
        borderRadius: BORDER_RADIUS,
        background: "linear-gradient(135deg, #f09, #0ff, #f0f, #0f0, #ff0, #f09)",
        backgroundSize: "400% 400%",
      }}
    />
  );
}

export function PoweredByExpo() {
  return (
    <ThemedView style={styles.container} color={theme.color.transparent}>
      <ThemedView style={styles.layeredView} color={theme.color.transparent}>
        <View style={styles.cardSide}>
          <View style={styles.shaderBackground}>
            <HolographicGradientWeb />
          </View>
          <Image
            source={require("@/assets/images/sub-expo.png")}
            style={styles.logoOverlay}
          />
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardSide: {
    alignItems: "center",
    height: CONTAINER_SIZE,
    justifyContent: "center",
    position: "absolute",
    width: CONTAINER_SIZE,
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  layeredView: {
    alignItems: "center",
    height: CONTAINER_SIZE,
    justifyContent: "center",
    position: "relative",
    width: CONTAINER_SIZE,
  },
  logoOverlay: {
    height: LOGO_SIZE,
    left: LOGO_OFFSET,
    position: "absolute",
    resizeMode: "contain",
    top: LOGO_OFFSET,
    width: LOGO_SIZE,
  },
  shaderBackground: {
    borderColor: theme.colorBlack,
    borderRadius: BORDER_RADIUS,
    borderWidth: 2,
    height: SHADER_SIZE,
    left: SHADER_OFFSET,
    overflow: "hidden",
    position: "absolute",
    top: SHADER_OFFSET,
    width: SHADER_SIZE,
  },
});
