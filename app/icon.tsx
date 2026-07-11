import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        background: "#101310",
      }}
    >
      <div style={{ display: "flex", height: 36, alignItems: "flex-end", gap: 5 }}>
        <div style={{ width: 8, height: 13, borderRadius: 2, background: "#8dfc68" }} />
        <div style={{ width: 8, height: 23, borderRadius: 2, background: "#8dfc68" }} />
        <div style={{ width: 8, height: 34, borderRadius: 2, background: "#8dfc68" }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 7,
          right: 7,
          display: "flex",
          width: 19,
          height: 19,
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #fffdf7",
          borderRadius: "50%",
          color: "#fffdf7",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        $
      </div>
    </div>,
    size,
  );
}
