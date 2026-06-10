import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, updateObservations, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-red-600 text-white p-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft size={20} /> Voltar
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Seu carrinho está vazio</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              Ver cardápio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar ao cardápio
        </button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Seu Pedido</h1>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-red-600 font-bold">R$ {item.price.toFixed(2)}</p>
                  
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 p-1 rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 p-1 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Observações (ex: sem cebola)"
                      value={item.observations || ''}
                      onChange={(e) => updateObservations(item.id, e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-lg p-4 shadow">
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-red-600">R$ {total.toFixed(2)}</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Total de {itemCount} itens</p>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold mt-6 hover:bg-red-700 transition"
        >
          Continuar
        </button>
      </main>
    </div>
  );
};