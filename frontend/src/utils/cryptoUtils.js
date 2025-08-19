// Utility functions for crypto operations in browser environment

// Simple SHA-256 implementation for instruction discriminator
export function sha256(data) {
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Use Web Crypto API for SHA-256
  return crypto.subtle.digest('SHA-256', dataBuffer);
}

// Generate instruction discriminator
export async function getInstructionDiscriminator(instructionName) {
  const data = `global:${instructionName}`;
  const hash = await sha256(data);
  return new Uint8Array(hash).slice(0, 8);
}

// Convert string to buffer
export function stringToBuffer(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convert number to buffer
export function numberToBuffer(num, bytes = 8) {
  const buffer = new ArrayBuffer(bytes);
  const view = new DataView(buffer);
  
  if (bytes === 8) {
    view.setBigUint64(0, BigInt(num), true); // little-endian
  } else if (bytes === 4) {
    view.setUint32(0, num, true); // little-endian
  } else if (bytes === 1) {
    view.setUint8(0, num);
  }
  
  return new Uint8Array(buffer);
} 