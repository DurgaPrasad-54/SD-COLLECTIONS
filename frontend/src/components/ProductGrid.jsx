import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return <EmptyState message="No products found." />;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

export default ProductGrid;
