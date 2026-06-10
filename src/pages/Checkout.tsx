import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { submitOrder } from '../services/gdoorApi';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      setError('Digite seu nome');
      return;
    }
    if (!tableNumber || tableNumber <= 0) {
      setError('Número da mesa inválido');
      return;
    }
    if (items.length === 0) {
      setError('Carrinho vazio');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitOrder({
        customerName: customerName.trim(),
        tableNumber,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          observations: item.observations
        }))
      });
      
      clearCart();
      navigate('/pedido-confirmado', { 
        state: { customerName, tableNumber, total, items }
      });
    } catch (err) {
      setError('Erro ao enviar pedido. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 text-white p-4">
        <button onClick={() => navigate('/carrinho')} className="flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar
        </button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Seu nome *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Digite seu nome"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Número da mesa *</label>
                <input
                  type="number"
                  min="1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-red-700 transition"
              >
                {isSubmitting ? 'Enviando...' : `Confirmar Pedido - R$ ${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Resumo do pedido</h2>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between border-b py-2">
                    <div>
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                      {item.observations && (
                        <div className="text-xs text-gray-500">Obs: {item.observations}</div>
                      )}
                    </div>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 mt-4 border-t">
                <span>Total</span>
                <span className="text-red-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};