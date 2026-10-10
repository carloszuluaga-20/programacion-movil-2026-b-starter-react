import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonList,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getErrorMessage } from '../data/api-error';
import { getProducts } from '../data/products-api';
import {
  CATEGORIES,
  filterProducts,
  toProductView,
} from '../domain/product';
import type { Product } from '../domain/product';
import EmptyState from './EmptyState';
import ProductCard from './ProductCard';

type LoadStatus = 'loading' | 'ready' | 'error';

/** Loads the catalog and applies local search and category filters. */
const ProductListPage: React.FC = () => {
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const isLoadingRef = useRef(false);

  const loadProducts = useCallback(async () => {
    // Prevent overlapping requests from React and Ionic lifecycle events.
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await getProducts();
      setProducts(result);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  // Ionic keeps pages mounted: refresh when returning after a mutation.
  useIonViewWillEnter(() => {
    void loadProducts();
  });

  const filteredProducts = filterProducts(products, { search, category });

  const clearFilters = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Product catalog</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonButton routerLink="/productos/nuevo">
          New product
        </IonButton>

        <IonInput
          label="Search by name"
          labelPlacement="stacked"
          placeholder="Enter a product name"
          value={search}
          clearInput
          onIonInput={(event) => setSearch(event.detail.value ?? '')}
        />

        <div
          role="group"
          aria-label="Filter products by category"
          className="ion-margin-top ion-margin-bottom"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
        >
          <IonButton
            fill={category === '' ? 'solid' : 'outline'}
            aria-pressed={category === ''}
            onClick={() => setCategory('')}
          >
            Todas
          </IonButton>

          {CATEGORIES.map((item) => (
            <IonButton
              key={item}
              fill={category === item ? 'solid' : 'outline'}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </IonButton>
          ))}
        </div>

        {status === 'loading' && (
          <div
            role="status"
            aria-live="polite"
            className="ion-text-center ion-padding"
          >
            <IonSpinner aria-hidden="true" />
            <p>Loading products…</p>
          </div>
        )}

        {status === 'error' && (
          <div role="alert">
            <EmptyState
              title="Unable to load products"
              message={errorMessage}
              actionLabel="Retry"
              onAction={() => void loadProducts()}
            />
          </div>
        )}

        {status === 'ready' && products.length === 0 && (
          <EmptyState
            title="No products yet"
            message="Create your first product to start the catalog."
            actionLabel="Create product"
            onAction={() => history.push('/productos/nuevo')}
          />
        )}

        {status === 'ready' &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <EmptyState
              title="No results"
              message="Try another name or category."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )}

        {status === 'ready' && filteredProducts.length > 0 && (
          <>
            <p role="status" aria-live="polite">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>

            <IonList>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={toProductView(product)}
                  onSelect={(id) => history.push(`/productos/${id}`)}
                />
              ))}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;