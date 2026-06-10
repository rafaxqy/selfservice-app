import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const OrderConfirmed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customerName, tableNumber, total, items } = location.state || {};

  if (!customerName) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Obrigado!</h1>
          <p className="text-gray-600 mt-2 text-lg">Seu pedido foi enviado com sucesso</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">R$ {total?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-red-600">R$ {total?.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3 text-lg">Informações do pedido</h3>
          <div className="space-y-2 text-gray-700">
            <p>🕐 Horário: {new Date().toLocaleTimeString('pt-BR')}</p>
            <p>📍 Mesa: {tableNumber}</p>
            <p>👤 Cliente: {customerName}</p>
            <p>🍽️ Itens: {items?.length} produtos</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition text-lg"
        >
          Fazer novo pedido
        </button>
      </div>
    </div>
  );
};