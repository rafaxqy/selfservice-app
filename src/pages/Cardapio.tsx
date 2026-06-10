import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { checkStoreStatus, fetchGroups, fetchAllMenu, type ApiMenuItem } from "@/services/api";
import type { MenuCategory, MenuItem, MenuVariant } from "@/data/menu";
import { CategoryNav } from "@/components/CategoryNav";
import { MenuItemCard } from "@/components/MenuItemCard";
import { CartSheet } from "@/components/CartSheet";
import { Footer } from "@/components/Footer";
import { heroImage, logoImage } from "@/assets/images";

// Funções de parsing
const QTY_IN_NAME_RE = /^(.*?)[\s(]*(\d+)\s*(PEÇAS?|PÇS|UNIDADES?|UNI|UN)\s*\)?\s*$/i;
const SIZE_RE = /\b(INTEIRA|MEIA)\b/i;
const QTY_IN_DESC_RE = /(\d+)\s*(UNIDADES?|PEÇAS?|UN|PÇS)\b/i;

type ParsedVariant = { kind: "qty"; base: string; qty: number } | { kind: "size"; base: string; size: "Inteira" | "Meia" };

const parseVariant = (name: string): ParsedVariant | null => {
  const q = name.match(QTY_IN_NAME_RE);
  if (q) {
    const base = q[1].replace(/[\s(]+$/, "").trim();
    const qty = parseInt(q[2], 10);
    if (base && qty) return { kind: "qty", base, qty };
  }
  const s = name.match(SIZE_RE);
  if (s) {
    const size = s[1].toUpperCase() === "INTEIRA" ? "Inteira" : "Meia";
    const base = name.replace(SIZE_RE, "").replace(/\s*\/\s*/g, " ").replace(/\s+/g, " ").trim();
    if (base) return { kind: "size", base, size };
  }
  return null;
};

const extractQtyFromDesc = (desc?: string): number | null => {
  if (!desc) return null;
  const m = desc.match(QTY_IN_DESC_RE);
  return m ? parseInt(m[1], 10) : null;
};

const buildLabel = (p: ParsedVariant, desc?: string): string => {
  if (p.kind === "qty") return p.qty === 1 ? "1 peça" : `${p.qty} peças`;
  const descQty = extractQtyFromDesc(desc);
  return descQty ? `${p.size} · ${descQty} un.` : p.size;
};

const SEM_ARROZ_RE = /\s+SEM\s+ARROZ\s*$/i;
const baseWithoutSemArroz = (name: string) => name.replace(SEM_ARROZ_RE, "").trim().toUpperCase();

const reorderSemArroz = (items: MenuItem[]): MenuItem[] => {
  const regulars: MenuItem[] = [];
  const semArrozByBase = new Map<string, MenuItem[]>();
  for (const item of items) {
    if (SEM_ARROZ_RE.test(item.name)) {
      const base = baseWithoutSemArroz(item.name);
      if (!semArrozByBase.has(base)) semArrozByBase.set(base, []);
      semArrozByBase.get(base)!.push(item);
    } else {
      regulars.push(item);
    }
  }
  const result: MenuItem[] = [];
  for (const item of regulars) {
    result.push(item);
    const base = baseWithoutSemArroz(item.name);
    const matches = semArrozByBase.get(base);
    if (matches) {
      result.push(...matches);
      semArrozByBase.delete(base);
    }
  }
  for (const remaining of semArrozByBase.values()) result.push(...remaining);
  return result;
};

const COMBO_PART_RE = /^\d+\s+/;
const hasComboDescription = (desc?: string): boolean => {
  if (!desc) return false;
  const parts = desc.split(/[,;]/).map((s) => s.replace(/\.$/, "").trim()).filter(Boolean);
  return parts.length >= 3 && parts.every((p) => COMBO_PART_RE.test(p));
};

const groupVariants = (items: MenuItem[]): MenuItem[] => {
  const buckets = new Map<string, MenuItem[]>();
  const order: string[] = [];
  for (const item of items) {
    const parsed = parseVariant(item.name);
    const key = parsed ? `${parsed.kind}:${parsed.base.toUpperCase()}` : `solo:${item.id}`;
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(item);
  }
  return order.flatMap((key) => {
    const bucket = buckets.get(key)!;
    if (bucket.length < 2) return [bucket[0]];
    if (bucket.some((item) => hasComboDescription(item.description))) return bucket;
    const sorted = [...bucket].sort((a, b) => a.price - b.price);
    const base = parseVariant(sorted[0].name)!.base;
    const variants: MenuVariant[] = sorted.map((v) => ({
      id: v.id!,
      label: buildLabel(parseVariant(v.name)!, v.description),
      fullName: v.name,
      price: v.price,
      description: v.description,
    }));
    const withImage = sorted.find((v) => v.image) ?? sorted[0];
    const withDesc = sorted.find((v) => v.description) ?? sorted[0];
    return [{
      id: sorted[0].id,
      name: base,
      price: variants[0].price,
      description: withDesc.description,
      image: withImage.image,
      variants,
    }];
  });
};

const Cardapio = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: storeStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["storeStatus"],
    queryFn: checkStoreStatus,
    refetchInterval: 60000,
  });
  const storeOpen = storeStatus?.open ?? true;

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
    staleTime: 5 * 60 * 1000,
  });

  const { data: apiItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: fetchAllMenu,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = statusLoading || menuLoading;

  const menuData = useMemo<MenuCategory[]>(() => {
    if (!groups.length || !apiItems.length) return [];

    const sortedGroups = [...groups].sort((a, b) => a.ordering - b.ordering);

    const categories = sortedGroups
      .map((group) => {
        const items: MenuItem[] = apiItems
          .filter((item) => item.categoryId === group.id && item.price > 0)
          .map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.observation?.trim() || undefined,
            image: item.imageUrl || undefined,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base", numeric: true }));
        return {
          id: String(group.id),
          name: group.name,
          items: reorderSemArroz(groupVariants(items)),
        };
      })
      .filter((cat) => cat.items.length > 0);

    return categories;
  }, [groups, apiItems]);

  const firstCategoryId = menuData[0]?.id ?? "";
  const resolvedActive = activeCategory || firstCategoryId;

  const scrollTo = useCallback((id: string) => {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return menuData;
    const q = searchTerm.toLowerCase();
    return menuData
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [searchTerm, menuData]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-4xl flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-8 w-8 rounded-full overflow-hidden bg-white flex items-center justify-center p-0.5">
            <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-lg font-semibold text-foreground flex-1">Cardápio</h1>

          {searchOpen ? (
            <div className="relative flex-1 max-w-xs animate-in fade-in duration-200">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-full border border-border bg-card text-foreground pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchTerm(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {!storeOpen && !statusLoading && (
        <div className="bg-destructive/10 border-b border-destructive/20">
          <div className="mx-auto max-w-4xl px-3 sm:px-4 py-2.5 flex items-center gap-2.5 text-destructive">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              <span className="font-semibold">Loja fechada</span>
              <span className="hidden sm:inline"> — Voltamos de Terça a Domingo das 19h às 23h30.</span>
              <span className="sm:hidden"> — pedidos indisponíveis</span>
            </p>
          </div>
        </div>
      )}

      {menuData.length > 0 && <CategoryNav categories={menuData} activeCategory={resolvedActive} onSelect={scrollTo} />}

      <main className="flex-1 flex flex-col mx-auto w-full max-w-4xl px-3 sm:px-4 py-4 sm:py-6 pb-28">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <p className="text-4xl animate-pulse">🍣</p>
            <p className="text-sm">Carregando cardápio...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-medium">Nenhum item encontrado</p>
            <p className="text-sm mt-1">Tente buscar por outro termo</p>
          </div>
        ) : (
          filteredData.map((category) => (
            <section
              key={category.id}
              ref={(el: HTMLDivElement | null) => { sectionRefs.current[category.id] = el; }}
              className="mb-10 scroll-mt-28"
            >
              <div className="mb-6 text-center">
                <div className="flex items-center gap-4 mb-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-primary/50" />
                  <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] text-foreground font-serif">
                    {category.name}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-primary/50" />
                </div>
                <div className="w-12 h-0.5 bg-primary mx-auto rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {category.items.map((item) => (
                  <MenuItemCard key={item.id ?? item.name} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <Footer />
      <CartSheet />
    </div>
  );
};

export default Cardapio;