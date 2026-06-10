// API Self-service - Mesa (sem delivery)
const BASE_URL = 'https://api-gfood.gdoor.com.br/establishments/83bf7d48-3425-494e-8215-3dd153b32bab';

const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg1MzA4LCJpYXQiOjE3ODAwMTg2ODh9.TgoOzDNUw-Rn3BdYZtseIJWRCZ-0m2eNOotdBb4I7yo';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': AUTH_TOKEN,
  'Origin': 'https://self-service.gdoor.com.br',
  'Referer': 'https://self-service.gdoor.com.br/'
};

export type ApiMenuItem = {
  id: number;
  name: string;
  price: number;
  observation?: string;
  imageUrl?: string;
  categoryId: number;
};

// Buscar cardápio completo com paginação
export async function fetchAllMenu(): Promise<ApiMenuItem[]> {
  let allItems: ApiMenuItem[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${BASE_URL}/menu?page=${page}&size=50`, { headers });
    if (!response.ok) break;
    
    const data = await response.json();
    if (data.length === 0) break;
    
    allItems = [...allItems, ...data];
    hasMore = data.length === 50;
    page++;
  }
  
  return allItems;
}

// Buscar grupos/categorias
export async function fetchGroups() {
  const response = await fetch(`${BASE_URL}/groups`, { headers });
  if (!response.ok) return [];
  return response.json();
}

// Verificar status da loja (sempre aberto ou consulta real)
export async function checkStoreStatus() {
  try {
    const response = await fetch(`${BASE_URL}/system-status`, { headers });
    if (!response.ok) return { open: true };
    const data = await response.json();
    return { open: data?.open ?? true };
  } catch {
    return { open: true };
  }
}

// Enviar pedido (self-service mesa)
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
    type: 'table',
    customer: {
      name: orderData.customerName,
      deliveryAddresses: []
    },
    table: orderData.tableNumber,
    items: orderData.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      observations: item.observations || '',
      tipPercent: 0
    }))
  };

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  
  if (response.status === 204) return { success: true, id: Date.now() };
  if (!response.ok) throw new Error('Erro ao enviar pedido');
  return response.json();
}