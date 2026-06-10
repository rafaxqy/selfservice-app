// src/components/CheckoutFlow.tsx
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitOrder } from "@/services/api";
import { useTableToken } from "@/hooks/useTableToken";

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  onBack: () => void;
}

export const CheckoutFlow = ({ onBack }: Props) => {
  const { items, totalPrice, clearCart } = useCart();
  const tableToken = useTableToken();

  const [customerName, setCustomerName] = useState("");
  // Pré-preenche a mesa do token se disponível
  const [tableNumber, setTableNumber] = useState(tableToken?.table ?? 1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderSent, setOrderSent] = useState(false);

  const tableFromToken = tableToken?.table ?? null;

  const sendOrder = async () => {
    if (!customerName.trim()) {
      setSubmitError("Digite seu nome");
      return;
    }
    if (!tableNumber || tableNumber <= 0) {
      setSubmitError("Número da mesa inválido");
      return;
    }
    if (items.length === 0) {
      setSubmitError("Carrinho vazio");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      await submitOrder({
        customerName: customerName.trim(),
        tableNumber,
        items: items.map((item) => ({
          id: item.id ?? 0,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          observations: item.observations || "",
        })),
      });

      clearCart();
      setOrderSent(true);
    } catch (err) {
      setSubmitError("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Obrigado!</h2>
          <p className="text-sm text-muted-foreground">
            Seu pedido foi enviado com sucesso
          </p>
        </div>
        <div className="bg-muted rounded-lg p-4 w-full text-left space-y-1">
          <p className="text-sm text-muted-foreground">
            Horário: {new Date().toLocaleTimeString("pt-BR")}
          </p>
          <p className="text-sm text-muted-foreground">Mesa: {tableNumber}</p>
          <p className="text-sm text-muted-foreground">Cliente: {customerName}</p>
        </div>
        <Button onClick={onBack} className="mt-4 rounded-full px-8 py-5 w-full">
          Fazer novo pedido
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-foreground mb-4 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-semibold text-base">Voltar ao carrinho</span>
      </button>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Resumo */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Resumo do pedido</h3>
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            {items.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-foreground font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">
            {formatPrice(totalPrice)}
          </span>
        </div>

        {/* Campos */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Como podemos te chamar?
            </label>
            <input
              type="text"
              placeholder="Seu nome"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Número da mesa
            </label>
            {tableFromToken ? (
              // Mesa vinda do QR code — só exibe, não edita
              <div className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground flex items-center justify-between">
                <span>Mesa {tableFromToken}</span>
                <span className="text-xs text-muted-foreground">via QR Code</span>
              </div>
            ) : (
              <input
                type="number"
                min="1"
                value={tableNumber}
                onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            )}
          </div>
        </div>

        {submitError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{submitError}</p>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4 mt-4">
        <Button
          onClick={sendOrder}
          disabled={submitting || items.length === 0}
          className="w-full gap-2 rounded-full py-6 text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" /> Fazer pedido
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
