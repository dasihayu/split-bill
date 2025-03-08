// src/lib/compression.ts
import pako from "pako";

// Encoding dan decoding untuk URL-safe Base64
export function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) {
    str += "=".repeat(4 - pad);
  }
  return atob(str);
}

// Kompresi string untuk URL
export async function compressToEncodedURIComponent(
  data: string
): Promise<string> {
  try {
    // Convert string to Uint8Array
    const uint8Array = new TextEncoder().encode(data);

    // Compress the data
    const compressed = pako.deflate(uint8Array, { level: 9 });

    // Convert to base64url
    const binaryString = Array.from(compressed)
      .map((byte) => String.fromCharCode(byte))
      .join("");

    return base64UrlEncode(binaryString);
  } catch (error) {
    console.error("Compression error:", error);
    throw error;
  }
}

// Dekompresi string dari URL
export async function decompressFromEncodedURIComponent(
  data: string
): Promise<string> {
  try {
    // Decode base64url
    const binaryString = base64UrlDecode(data);

    // Convert to Uint8Array
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Decompress
    const decompressed = pako.inflate(uint8Array);

    // Convert back to string
    return new TextDecoder().decode(decompressed);
  } catch (error) {
    console.error("Decompression error:", error);
    throw error;
  }
}
