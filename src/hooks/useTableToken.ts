// src/hooks/useTableToken.ts
import { useMemo } from "react";

export type TableToken = {
  uuid: string;
  name: string;
  table: number;
  type: string;
  phone: string;
  imageUrl: string | null;
  bannerUrl: string;
};

function decodeJwtPayload(token: string): TableToken | null {
  try {
    const payload = token.split(".")[0]; // token é só base64, não JWT assinado
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    try {
      // tenta direto como base64 simples (formato que o GDoor usa)
      const decoded = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

export function useTableToken(): TableToken | null {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return null;
    return decodeJwtPayload(token);
  }, []);
}