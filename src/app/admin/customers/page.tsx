'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerProfile } from '@/lib/supabase/services/userService';
import { toast } from 'react-hot-toast';

interface CustomerWithEmail extends CustomerProfile {
  email?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithEmail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<CustomerWithEmail | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de chargement des clients');

      setCustomers((data.customers || []).map((profile: CustomerWithEmail) => ({
        ...profile,
        email: undefined,
      })));
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCustomerName = (customer: CustomerWithEmail) => {
    if (customer.first_name || customer.last_name) {
      return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    }
    return 'Non renseigné';
  };

  const getCustomerAddress = (customer: CustomerWithEmail) => {
    const { address_line1, city, postal_code } = customer;
    if (!address_line1 && !city && !postal_code) return 'Non renseignée';
    
    return [
      address_line1,
      city && postal_code ? `${postal_code} ${city}` : (city || postal_code)
    ].filter(Boolean).join(', ');
  };

  const filteredCustomers = customers.filter(customer => {
    const searchTermLower = searchTerm.toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const name = getCustomerName(customer).toLowerCase();
    const address = getCustomerAddress(customer).toLowerCase();
    const phone = (customer.phone || '').toLowerCase();
    
    return email.includes(searchTermLower) || 
           name.includes(searchTermLower) || 
           address.includes(searchTermLower) ||
           phone.includes(searchTermLower);
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Inscrit le
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucun client trouvé
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedCustomer(selectedCustomer?.id === customer.id ? null : customer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getCustomerName(customer)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email || 'Non disponible'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getCustomerAddress(customer)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.phone || 'Non renseigné'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(customer.created_at || '')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(selectedCustomer?.id === customer.id ? null : customer);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal des détails du client */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Détails du client</h2>
              <div className="flex space-x-4">
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditedCustomer({...selectedCustomer});
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Modifier
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setIsEditing(false);
                    setEditedCustomer(null);
                  }}
                  className="text-gray-900 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Informations personnelles</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <span className="font-medium">Nom:</span>{' '}
                      {getCustomerName(selectedCustomer)}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Email:</span>{' '}
                      {selectedCustomer.email || 'Non disponible'}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Téléphone:</span>{' '}
                      {selectedCustomer.phone || 'Non renseigné'}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Inscrit le:</span>{' '}
                      {formatDate(selectedCustomer.created_at || '')}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Adresse</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <span className="font-medium">Adresse:</span>{' '}
                      {selectedCustomer.address_line1 || 'Non renseignée'}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Complément:</span>{' '}
                      {selectedCustomer.address_line2 || 'Non renseigné'}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Ville:</span>{' '}
                      {selectedCustomer.city || 'Non renseignée'}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Code postal:</span>{' '}
                      {selectedCustomer.postal_code || 'Non renseigné'}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Pays:</span>{' '}
                      {selectedCustomer.country || 'Non renseigné'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {editedCustomer && (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Informations personnelles</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <input
                              type="text"
                              value={editedCustomer.first_name || ''}
                              onChange={(e) => setEditedCustomer({...editedCustomer, first_name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                              type="text"
                              value={editedCustomer.last_name || ''}
                              onChange={(e) => setEditedCustomer({...editedCustomer, last_name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                          <input
                            type="text"
                            value={editedCustomer.phone || ''}
                            onChange={(e) => setEditedCustomer({...editedCustomer, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Adresse</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                          <input
                            type="text"
                            value={editedCustomer.address_line1 || ''}
                            onChange={(e) => setEditedCustomer({...editedCustomer, address_line1: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Complément d'adresse</label>
                          <input
                            type="text"
                            value={editedCustomer.address_line2 || ''}
                            onChange={(e) => setEditedCustomer({...editedCustomer, address_line2: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                            <input
                              type="text"
                              value={editedCustomer.postal_code || ''}
                              onChange={(e) => setEditedCustomer({...editedCustomer, postal_code: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                            <input
                              type="text"
                              value={editedCustomer.city || ''}
                              onChange={(e) => setEditedCustomer({...editedCustomer, city: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                          <input
                            type="text"
                            value={editedCustomer.country || ''}
                            onChange={(e) => setEditedCustomer({...editedCustomer, country: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-6">
              {isEditing ? (
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedCustomer(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={async () => {
                      if (!editedCustomer) return;
                      
                      try {
                        // Mise à jour via la route admin serveur (service_role).
                        const res = await fetch('/api/admin/customers', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: editedCustomer.id,
                            first_name: editedCustomer.first_name,
                            last_name: editedCustomer.last_name,
                            phone: editedCustomer.phone,
                            address_line1: editedCustomer.address_line1,
                            address_line2: editedCustomer.address_line2,
                            city: editedCustomer.city,
                            postal_code: editedCustomer.postal_code,
                            country: editedCustomer.country,
                          }),
                        });
                        if (!res.ok) throw new Error('Erreur de mise à jour');

                        // Mettre à jour l'état local
                        setCustomers(customers.map(c => 
                          c.id === editedCustomer.id ? editedCustomer : c
                        ));
                        setSelectedCustomer(editedCustomer);
                        setIsEditing(false);
                        setEditedCustomer(null);
                        
                        toast.success('Profil client mis à jour avec succès');
                      } catch (error) {
                        console.error('Erreur lors de la mise à jour du profil:', error);
                        toast.error('Erreur lors de la mise à jour du profil');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Enregistrer
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-lg mb-3">Commandes du client</h3>
                  <CustomerOrders customerId={selectedCustomer.id} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher les commandes d'un client
function CustomerOrders({ customerId }: { customerId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders();
  }, [customerId]);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders?userId=${encodeURIComponent(customerId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des commandes...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center py-4 text-gray-500">Aucune commande trouvée pour ce client</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              ID Commande
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{order.id.slice(0, 8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(order.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {order.total_amount.toFixed(2)}€
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link href={`/admin/orders?id=${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
