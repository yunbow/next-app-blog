import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          color: "white",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: "6px",
        }}
      >
        B
        <div
          style={{
            position: "absolute",
            top: 11,
            left: 13,
            width: 8,
            height: 2,
            borderRadius: 999,
            background: "#2488ff",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 13,
            width: 7,
            height: 2,
            borderRadius: 999,
            background: "#ffffff",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
