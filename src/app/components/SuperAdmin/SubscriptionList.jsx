"use client";

// SubscriptionList.jsx — ACTUALIZADO
// Muestra todos los campos nuevos del modelo: canCreatePrivate, canHideBudget,
// featuredInDirectory, isPaused. Agrega botón de Pausar/Activar sin eliminar.

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  DateField,
  EditButton,
  DeleteButton,
  CreateButton,
  TopToolbar,
  useRecordContext,
  useUpdate,
  useRefresh,
  useNotify,
  FunctionField,
} from 'react-admin';

const SubscriptionListActions = () => (
  <TopToolbar>
    <CreateButton label="Nuevo plan" />
  </TopToolbar>
);

// Badge de nombre de plan con color
const PlanBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  const colors = {
    GRATIS: { bg: '#F1EFE8', color: '#5F5E5A' },
    BASE:   { bg: '#E6F1FB', color: '#185FA5' },
    PLUS:   { bg: '#E1F5EE', color: '#0F6E56' },
  };
  const style = colors[record.name] || { bg: '#F1EFE8', color: '#5F5E5A' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 10px',
      borderRadius: 99, background: style.bg, color: style.color,
    }}>
      {record.name}
    </span>
  );
};

// Botón de pausar / reactivar plan (sin eliminar)
const PauseButton = () => {
  const record = useRecordContext();
  const [update, { isLoading }] = useUpdate();
  const refresh = useRefresh();
  const notify = useNotify();

  if (!record) return null;

  const handleToggle = () => {
    update(
      'subscriptions',
      { id: record.id, data: { isPaused: !record.isPaused }, previousData: record },
      {
        onSuccess: () => {
          notify(record.isPaused ? 'Plan reactivado' : 'Plan pausado', { type: 'info' });
          refresh();
        },
        onError: () => notify('Error al actualizar el plan', { type: 'error' }),
      }
    );
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      style={{
        fontSize: 12, padding: '4px 10px', borderRadius: 6,
        border: '0.5px solid',
        borderColor: record.isPaused ? '#1D9E75' : '#EF9F27',
        color: record.isPaused ? '#0F6E56' : '#854F0B',
        background: record.isPaused ? '#E1F5EE' : '#FAEEDA',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {record.isPaused ? 'Reactivar' : 'Pausar'}
    </button>
  );
};

const RowActions = () => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    <PauseButton />
    <EditButton label="" />
    <DeleteButton
      label=""
      confirmTitle="Eliminar plan"
      confirmContent="¿Eliminar este plan? Las empresas con este plan activo no se verán afectadas hasta que venza su período."
    />
  </div>
);

// Muestra NULL como "Ilimitado" en la tabla
const LimitField = ({ source, label }) => {
  const record = useRecordContext();
  if (!record) return null;
  const val = record[source];
  return (
    <span style={{ fontSize: 13, color: val === null ? '#1D9E75' : 'inherit' }}>
      {val === null ? '∞ ilimitado' : val}
    </span>
  );
};

export const SubscriptionList = () => (
  <List
    actions={<SubscriptionListActions />}
    title="Planes de Suscripción"
    sort={{ field: 'price', order: 'ASC' }}
  >
    <Datagrid bulkActionButtons={false}>
      <FunctionField label="Plan" render={() => <PlanBadge />} />
      <NumberField source="price" label="Precio (USD)" options={{ style: 'currency', currency: 'USD' }} />
      <FunctionField source="maxTenders"   label="Máx. Licitaciones" render={() => <LimitField source="maxTenders" />} />
      <FunctionField source="maxProposals" label="Máx. Propuestas"   render={() => <LimitField source="maxProposals" />} />
      <BooleanField source="canCreatePrivate"    label="Privadas"    />
      <BooleanField source="canHideBudget"       label="Ocultar presup." />
      <BooleanField source="featuredInDirectory" label="Destacado dir." />
      <BooleanField source="isPaused"   label="Pausado"  />
      <BooleanField source="isActive"   label="Activo"   />
      <DateField    source="createdAt"  label="Creado"   />
      <RowActions />
    </Datagrid>
  </List>
);
