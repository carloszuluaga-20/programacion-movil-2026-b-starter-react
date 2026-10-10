import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ApiError, getErrorMessage } from '../data/api-error';
import { deleteProduct, getProduct } from '../data/products-api';
import { toProductView } from '../domain/product';
import type { Product } from '../domain/product';
import EmptyState from './EmptyState';

type LoadStatus = 'loading' | 'ready' | 'error' | 'not-found';

/** Displays a product and supports editing and confirmed deletion. */
const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const requestVersion = useRef(0);
  const deleteInProgress = useRef(false);

  const loadProduct = useCallback(async () => {
    const version = ++requestVersion.current;

    setStatus('loading');
    setProduct(null);
    setErrorMessage('');
    setDeleteError('');
    setShowDeleteConfirmation(false);

    const productId = Number(id);

    if (!/^\d+$/.test(id) || !Number.isSafeInteger(productId)) {
      setErrorMessage('The product id must be a valid integer.');
      setStatus('error');
      return;
    }

    try {
      const result = await getProduct(productId);

      // Ignore a response if another load has already started.
      if (version !== requestVersion.current) return;

      setProduct(result);
      setStatus('ready');
    } catch (error) {
      if (version !== requestVersion.current) return;

      setErrorMessage(getErrorMessage(error));
      setStatus(
        error instanceof ApiError && error.status === 404
          ? 'not-found'
          : 'error',
      );
    }
  }, [id]);

  useEffect(() => {
    void loadProduct();

    return () => {
      requestVersion.current += 1;
    };
  }, [loadProduct]);

  // Refresh cached Ionic pages when returning from the edit form.
  useIonViewWillEnter(() => {
    void loadProduct();
  }, [loadProduct]);

  const handleDelete = async () => {
    if (!product || deleteInProgress.current) return;

    deleteInProgress.current = true;
    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteProduct(product.id);
      history.replace('/productos');
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      deleteInProgress.current = false;
      setIsDeleting(false);
    }
  };

  const view = product ? toProductView(product) : null;
  const stockColor = view?.isOutOfStock
    ? 'danger'
    : view?.isLowStock
      ? 'warning'
      : 'success';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" text="Back" />
          </IonButtons>
          <IonTitle>Product details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {status === 'loading' && (
          <div
            role="status"
            aria-live="polite"
            className="ion-text-center ion-padding"
          >
            <IonSpinner aria-hidden="true" />
            <p>Loading product…</p>
          </div>
        )}

        {status === 'not-found' && (
          <EmptyState
            title="Product not found"
            message={errorMessage}
            actionLabel="Back to catalog"
            onAction={() => history.replace('/productos')}
          />
        )}

        {status === 'error' && (
          <div role="alert">
            <EmptyState
              title="Unable to load product"
              message={errorMessage}
              actionLabel="Retry"
              onAction={() => void loadProduct()}
            />
          </div>
        )}

        {status === 'ready' && view && (
          <>
            <h1>{view.name}</h1>

            <dl>
              <dt>Product ID</dt>
              <dd>{view.id}</dd>

              <dt>Category</dt>
              <dd>{view.category}</dd>

              <dt>Price</dt>
              <dd>{view.priceLabel}</dd>

              <dt>Stock</dt>
              <dd>{view.stock}</dd>
            </dl>

            <IonBadge color={stockColor}>{view.stockLabel}</IonBadge>

            <div className="ion-margin-top">
              <IonButton
                routerLink={`/productos/${view.id}/editar`}
                disabled={isDeleting || showDeleteConfirmation}
              >
                Edit product
              </IonButton>

              <IonButton
                color="danger"
                disabled={isDeleting || showDeleteConfirmation}
                onClick={() => {
                  setDeleteError('');
                  setShowDeleteConfirmation(true);
                }}
              >
                Delete product
              </IonButton>
            </div>

            {showDeleteConfirmation && (
              <section
                aria-labelledby="delete-confirmation-title"
                className="ion-margin-top ion-padding"
              >
                <h2 id="delete-confirmation-title">
                  Delete this product?
                </h2>
                <p>
                  You are about to delete {view.name}. This action cannot
                  be undone.
                </p>

                {deleteError && <p role="alert">{deleteError}</p>}

                <IonButton
                  color="danger"
                  disabled={isDeleting}
                  onClick={() => void handleDelete()}
                >
                  {isDeleting ? 'Deleting…' : 'Confirm deletion'}
                </IonButton>

                <IonButton
                  fill="outline"
                  disabled={isDeleting}
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteError('');
                  }}
                >
                  Cancel
                </IonButton>
              </section>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductDetailPage;