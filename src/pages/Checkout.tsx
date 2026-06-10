import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { submitOrder } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) { setError('Digite seu nome'); return; }
    if (!tableNumber || tableNumber <= 0) { setError('Número da mesa inválido'); return; }
    if (items.length === 0) { setError('Carrinho vazio'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      await submitOrder({
        customerName: customerName.trim(),
        tableNumber,
        items: items.map(item => ({
          id: item.id ?? 0,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          observations: item.observations
        }))
      });
      clearCart();
      navigate('/pedido-confirmado', { state: { customerName, tableNumber, total: totalPrice, items } });
    } catch (err) {
      setError('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <button onClick={() => navigate('/carrinho')} className="flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar
        </button>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Seu nome *</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 bg-card text-foreground" placeholder="Digite seu nome" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Número da mesa *</label>
            <input type="number" min="1" value={tableNumber} onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
              className="w-full border border-border rounded-lg px-3 py-2 bg-card text-foreground" required />
          </div>
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">{error}</div>}
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-50">
            {isSubmitting ? 'Enviando...' : `Confirmar Pedido - R$ ${totalPrice.toFixed(2)}`}
          </button>
        </form>
      </main>
    </div>
  );
};
