import React from 'react';
import { Clock, Truck, CheckCircle, Package } from 'lucide-react';

const OrderCard = ({ order, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return <Clock className="w-4 h-4" />;
      case 'Shipped': return <Truck className="w-4 h-4" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-lg">{order.productName}</h4>
          <p className="text-gray-600">Order #{order.id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span>{order.status}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Phone:</strong> {order.customerPhone}</p>
        </div>
        <div>
          <p><strong>Amount:</strong> ₹{order.amount}</p>
          <p><strong>Date:</strong> {order.orderDate}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="text-sm font-medium">Update Status:</label>
        <select
          value={order.status}
          onChange={(e) => onStatusUpdate(order.id, e.target.value)}
          className="ml-2 p-2 border rounded"
        >
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>
    </div>
  );
};

export default OrderCard;
