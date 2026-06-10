import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-primary text-primary-foreground p-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft size={20} /> Voltar
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground mb-4">Seu carrinho está vazio</p>
            <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
              Ver cardápio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar ao cardápio
        </button>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Seu Pedido</h1>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.name} className="bg-card rounded-lg p-4 border border-border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-primary font-bold">R$ {item.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.name, item.quantity - 1)} className="bg-secondary p-1 rounded">
                      <Minus size={16} />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.name, item.quantity + 1)} className="bg-secondary p-1 rounded">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.name)} className="text-destructive hover:text-destructive/80">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-card rounded-lg p-4 border border-border">
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-muted-foreground text-sm mt-2">Total de {totalItems} itens</p>
        </div>
      </main>
    </div>
  );
};
