import { useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

export default function ProductGrid({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Product Catalog</h2>
          <span className="text-sm text-gray-400">
            {products.length} products
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No products available</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

