import React from 'react';

interface StatusSelectorProps {
  currentStatus: string;
  onChange: (newStatus: string) => void;
  onClick?: (e: React.MouseEvent) => void;
}

const statusOptions = [
  { value: 'pending_payment', label: 'En attente de paiement', color: 'bg-orange-100 text-orange-900 border-orange-200' },
  { value: 'paid', label: 'Payée', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  { value: 'processing', label: 'En préparation', color: 'bg-blue-100 text-blue-900 border-blue-200' },
  { value: 'shipped', label: 'Envoyée', color: 'bg-purple-100 text-purple-900 border-purple-200' },
  { value: 'completed', label: 'Terminée', color: 'bg-green-100 text-green-900 border-green-200' },
  { value: 'payment_failed', label: 'Paiement échoué', color: 'bg-red-100 text-red-900 border-red-200' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-900 border-red-200' },
];

export default function StatusSelector({ currentStatus, onChange, onClick }: StatusSelectorProps) {
  return (
    <select
      className={`rounded-md border px-3 py-1 text-sm font-medium ${
        statusOptions.find(option => option.value === currentStatus)?.color || 'bg-gray-100 text-gray-900 border-gray-200'
      }`}
      value={currentStatus}
      onChange={(e) => onChange(e.target.value)}
      onClick={onClick}
    >
      {statusOptions.map(option => (
        <option key={option.value} value={option.value} className="bg-white text-gray-900">
          {option.label}
        </option>
      ))}
    </select>
  );
}
