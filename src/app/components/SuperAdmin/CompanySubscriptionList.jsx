"use client";

// CompanySubscriptionList.jsx — ACTUALIZADO
// Muestra estado con badges de color, fechas de vencimiento y acciones claras.

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  EditButton,
  DeleteButton,
  CreateButton,
  TopToolbar,
  ReferenceField,
  useRecordContext,
  FunctionField,
  FilterButton,
  SelectInput,
} from 'react-admin';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton label="Asignar plan a empresa" />
  </TopToolbar>
);

const filters = [
  <SelectInput
    key="status"
    source="status"
    label="Estado"
    choices={[
      { id: 'active',    name: 'Activa'    },
      { id: 'pending',   name: 'Pendiente' },
      { id: 'expired',   name: 'Expirada'  },
      { id: 'cancelled', name: 'Cancelada' },
    ]}
    alwaysOn
  />,
];

// Badge de estado con color semántico
const StatusBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  const styles = {
    active:    { bg: '#E1F5EE', color: '#0F6E56' },
    pending:   { bg: '#FAEEDA', color: '#854F0B' },
    expired:   { bg: '#F1EFE8', color: '#5F5E5A' },
    cancelled: { bg: '#FAECE7', color: '#993C1D' },
  };
  const s = styles[record.status] || styles.expired;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 10px',
      borderRadius: 99, background: s.bg, color: s.color,
    }}>
      {record.status}
    </span>
  );
};

// Indica si el plan está próximo a vencer (≤ 7 días)
const ExpiryWarning = () => {
  const record = useRecordContext();
  if (!record?.endDate) return null;
  const daysLeft = Math.ceil((new Date(record.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysLeft > 7 || daysLeft < 0) return null;
  return (
    <span style={{ fontSize: 10, color: '#993C1D', marginLeft: 6 }}>
      ⚠ vence en {daysLeft}d
    </span>
  );
};

const RowActions = () => (
  <div style={{ display: 'flex', gap: 6 }}>
    <EditButton label="" />
    <DeleteButton
      label=""
      confirmTitle="Remover suscripción"
      confirmContent="¿Remover esta suscripción de la empresa? La empresa volverá al plan Gratuito."
    />
  </div>
);

export const CompanySubscriptionList = () => (
  <List
    actions={<Actions />}
    filters={filters}
    title="Suscripciones de Empresas"
    sort={{ field: 'createdAt', order: 'DESC' }}
  >
    <Datagrid bulkActionButtons={false}>
      <ReferenceField source="companyId" reference="companies" label="Empresa">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="subscriptionId" reference="subscriptions" label="Plan">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="startDate" label="Inicio" />
      <FunctionField
        label="Vencimiento"
        render={(record) => (
          <>
            <span>{record.endDate ? new Date(record.endDate).toLocaleDateString('es-AR') : '—'}</span>
            <ExpiryWarning />
          </>
        )}
      />
      <FunctionField label="Estado" render={() => <StatusBadge />} />
      <BooleanField source="isActive"   label="Activa"    />
      <BooleanField source="autoRenew"  label="Auto-renov." />
      <TextField    source="paymentMethod" label="Pago" emptyText="—" />
      <RowActions />
    </Datagrid>
  </List>
);
