import { IonBadge, IonItem, IonLabel } from '@ionic/react';
import type { ProductView } from '../domain/product';

export interface ProductCardProps {
  product: ProductView;
  /** Called with the product id when the card is selected. */
  onSelect?: (id: number) => void;
}

/** Displays product information and its stock status. */
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const stockColor = product.isOutOfStock
    ? 'danger'
    : product.isLowStock
      ? 'warning'
      : 'success';

  return (
    <IonItem
      button={Boolean(onSelect)}
      detail={Boolean(onSelect)}
      onClick={() => onSelect?.(product.id)}
      aria-label={`View ${product.name}, ${product.priceLabel}, ${product.stockLabel}`}
    >
      <IonLabel className="ion-text-wrap">
        <h2>{product.name}</h2>
        <p>{product.category}</p>
        <p>{product.priceLabel}</p>
        <p>Stock: {product.stock}</p>
        <IonBadge color={stockColor}>{product.stockLabel}</IonBadge>
      </IonLabel>
    </IonItem>
  );
};

export default ProductCard;