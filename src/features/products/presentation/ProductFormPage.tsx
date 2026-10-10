import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ApiError, getErrorMessage } from '../data/api-error';
import {
  createProduct,
  getProduct,
  updateProduct,
} from '../data/products-api';
import { CATEGORIES, validateProduct } from '../domain/product';
import type {
  ProductInput,
  ValidationResult,
} from '../domain/product';
import EmptyState from './EmptyState';

type LoadStatus = 'loading' | 'ready' | 'error' | 'not-found';

/** Shared form for creating and editing products. */
const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const isEditing = id !== undefined;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [saveError, setSaveError] = useState('');
  const [serverDetails, setServerDetails] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const requestVersion = useRef(0);
  const saveInProgress = useRef(false);

  const prepareForm = useCallback(async () => {
    const version = ++requestVersion.current;

    setErrors({});
    setSaveError('');
    setServerDetails([]);
    setLoadError('');
    setName('');
    setPrice('');
    setCategory('');
    setStock('');

    if (id === undefined) {
      setStatus('ready');
      return;
    }

    setStatus('loading');
    const productId = Number(id);

    if (!/^\d+$/.test(id) || !Number.isSafeInteger(productId)) {
      setLoadError('The product id must be a valid integer.');
      setStatus('error');
      return;
    }

    try {
      const product = await getProduct(productId);
      if (version !== requestVersion.current) return;

      setName(product.name);
      setPrice(String(product.price));
      setCategory(product.category);
      setStock(String(product.stock));
      setStatus('ready');
    } catch (error) {
      if (version !== requestVersion.current) return;

      setLoadError(getErrorMessage(error));
      setStatus(
        error instanceof ApiError && error.status === 404
          ? 'not-found'
          : 'error',
      );
    }
  }, [id]);

  useEffect(() => {
    void prepareForm();

    return () => {
      requestVersion.current += 1;
    };
  }, [prepareForm]);

  // Reset cached forms and reload the product on each entry.
  useIonViewWillEnter(() => {
    void prepareForm();
  }, [prepareForm]);

  const handleSave = async () => {
    if (saveInProgress.current || status !== 'ready') return;

    const input: ProductInput = {
      name,
      price: price.trim() === '' ? Number.NaN : Number(price),
      category,
      stock: stock.trim() === '' ? Number.NaN : Number(stock),
    };

    const validation = validateProduct(input);
    setErrors(validation.errors);
    setSaveError('');
    setServerDetails([]);

    if (!validation.isValid) return;

    saveInProgress.current = true;
    setIsSaving(true);

    try {
      if (id !== undefined) {
        await updateProduct(Number(id), input);
      } else {
        await createProduct(input);
      }

      history.replace('/productos');
    } catch (error) {
      // Keep all entered values when a save fails.
      setSaveError(getErrorMessage(error));

      if (error instanceof ApiError) {
        setServerDetails(error.details);
      }
    } finally {
      saveInProgress.current = false;
      setIsSaving(false);
    }
  };

  const cancelPath = isEditing
    ? `/productos/${id}`
    : '/productos';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {!isSaving && (
              <IonBackButton defaultHref={cancelPath} text="Back" />
            )}
          </IonButtons>
          <IonTitle>
            {isEditing ? 'Edit product' : 'New product'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {status === 'loading' && (
          <div role="status" className="ion-text-center ion-padding">
            <IonSpinner aria-hidden="true" />
            <p>Loading product…</p>
          </div>
        )}

        {status === 'not-found' && (
          <EmptyState
            title="Product not found"
            message={loadError}
            actionLabel="Back to catalog"
            onAction={() => history.replace('/productos')}
          />
        )}

        {status === 'error' && (
          <div role="alert">
            <EmptyState
              title="Unable to load form"
              message={loadError}
              actionLabel="Retry"
              onAction={() => void prepareForm()}
            />
          </div>
        )}

        {status === 'ready' && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
          >
            <IonInput
              label="Name"
              labelPlacement="stacked"
              fill="outline"
              value={name}
              disabled={isSaving}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              onIonInput={(event) =>
                setName(String(event.detail.value ?? ''))
              }
            />
            {errors.name && (
              <p id="name-error" role="alert">{errors.name}</p>
            )}

            <IonInput
              className="ion-margin-top"
              label="Price (COP)"
              labelPlacement="stacked"
              fill="outline"
              type="number"
              inputmode="decimal"
              step="any"
              value={price}
              disabled={isSaving}
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? 'price-error' : undefined}
              onIonInput={(event) =>
                setPrice(String(event.detail.value ?? ''))
              }
            />
            {errors.price && (
              <p id="price-error" role="alert">{errors.price}</p>
            )}

            <fieldset
              disabled={isSaving}
              className="ion-margin-top"
              aria-describedby={
                errors.category ? 'category-error' : undefined
              }
            >
              <legend>Category</legend>
              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
              >
                {CATEGORIES.map((item) => (
                  <IonButton
                    key={item}
                    type="button"
                    disabled={isSaving}
                    fill={category === item ? 'solid' : 'outline'}
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </IonButton>
                ))}
              </div>
            </fieldset>
            {errors.category && (
              <p id="category-error" role="alert">{errors.category}</p>
            )}

            <IonInput
              className="ion-margin-top"
              label="Stock"
              labelPlacement="stacked"
              fill="outline"
              type="number"
              inputmode="numeric"
              step="1"
              value={stock}
              disabled={isSaving}
              aria-invalid={Boolean(errors.stock)}
              aria-describedby={errors.stock ? 'stock-error' : undefined}
              onIonInput={(event) =>
                setStock(String(event.detail.value ?? ''))
              }
            />
            {errors.stock && (
              <p id="stock-error" role="alert">{errors.stock}</p>
            )}

            {saveError && (
              <div role="alert" className="ion-margin-top">
                <p>{saveError}</p>
                {serverDetails.length > 0 && (
                  <ul>
                    {serverDetails.map((detail, index) => (
                      <li key={`${index}-${detail}`}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="ion-margin-top">
              <IonButton type="submit" disabled={isSaving}>
                {isSaving
                  ? 'Saving…'
                  : isEditing
                    ? 'Save changes'
                    : 'Create product'}
              </IonButton>

              <IonButton
                type="button"
                fill="outline"
                disabled={isSaving}
                onClick={() => history.replace(cancelPath)}
              >
                Cancel
              </IonButton>
            </div>
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductFormPage;