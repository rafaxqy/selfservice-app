// src/services/api.ts

const API_BASE = "/api";

// Token Bearer do GDoor (do self-service.gdoor.com.br)
const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg1MzA4LCJpYXQiOjE3ODAwMTg2ODh9.TgoOzDNUw-Rn3BdYZtseIJWRCZ-0m2eNOotdBb4I7yo";

function getHeaders() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: AUTH_TOKEN,
    Origin: "https://self-service.gdoor.com.br",
    Referer: "https://self-service.gdoor.com.br/",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };
}

// Pega o uuid do token na URL, com fallback para o uuid do Japa Sushi
export function getEstablishmentUuid(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      const decoded = JSON.parse(atob(token.replace(/-/g, "+").replace(/_/g, "/")));
      if (decoded?.uuid) return decoded.uuid;
    }
  } catch {
    // fallback
  }
  return "83bf7d48-3425-494e-8215-3dd153b32bab";
}

export type ApiMenuItem = {
  id: number;
  name: string;
  price: number;
  observation?: string;
  imageUrl?: string;
  categoryId: number;
};

export async function fetchAllMenu(): Promise<ApiMenuItem[]> {
  const uuid = getEstablishmentUuid();
  let allItems: ApiMenuItem[] = [];
  let page = 1;

  while (true) {
    try {
      const res = await fetch(
        `${API_BASE}/establishments/${uuid}/menu?page=${page}&size=50`,
        { headers: getHeaders() }
      );
      if (!res.ok) break;
      const data: ApiMenuItem[] = await res.json();
      if (!data.length) break;
      allItems = [...allItems, ...data];
      if (data.length < 50) break;
      page++;
    } catch {
      break;
    }
  }

  return allItems;
}

export async function fetchGroups() {
  const uuid = getEstablishmentUuid();
  try {
    const res = await fetch(
      `${API_BASE}/establishments/${uuid}/groups`,
      { headers: getHeaders() }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function checkStoreStatus() {
  const uuid = getEstablishmentUuid();
  try {
    const res = await fetch(
      `${API_BASE}/establishments/${uuid}/system-status`,
      { headers: getHeaders() }
    );
    if (!res.ok) return { open: true };
    return res.json();
  } catch {
    return { open: true };
  }
}

export async function submitOrder(orderData: {
  customerName: string;
  tableNumber: number;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    observations?: string;
  }>;
}) {
  const payload = {
    type: "table",
    customer: {
      name: orderData.customerName,
      deliveryAddresses: [],
    },
    table: orderData.tableNumber,
    items: orderData.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      observations: item.observations || "",
      tipPercent: 0,
    })),
  };

  const uuid = getEstablishmentUuid();
  const res = await fetch(`${API_BASE}/establishments/${uuid}/order`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 200 || res.status === 201 || res.status === 204) {
    return { success: true };
  }

  const errorText = await res.text();
  throw new Error(`Erro ${res.status}: ${errorText}`);
}