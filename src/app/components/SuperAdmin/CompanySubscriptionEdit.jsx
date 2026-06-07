"use client";

// CompanySubscriptionEdit.jsx — NUEVO: componente faltante para editar suscripciones de empresas

import React from 'react';
import {
  Edit,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  DateInput,
  BooleanInput,
  TextInput,
  required
} from 'react-admin';

export const CompanySubscriptionEdit = () => (
  <Edit title="Editar Suscripción de Empresa">
    <SimpleForm>
      <ReferenceInput
        source="companyId"
        reference="companies"
        label="Empresa"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput
        source="subscriptionId"
        reference="subscriptions"
        label="Plan de Suscripción"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <DateInput
        source="startDate"
        label="Fecha de Inicio"
        validate={[required()]}
      />
      <DateInput
        source="endDate"
        label="Fecha de Fin"
        validate={[required()]}
      />
      <SelectInput
        source="status"
        label="Estado"
        choices={[
          { id: 'active', name: 'Activa' },
          { id: 'pending', name: 'Pendiente' },
          { id: 'expired', name: 'Expirada' },
          { id: 'cancelled', name: 'Cancelada' },
        ]}
        validate={[required()]}
      />
      <BooleanInput
        source="isActive"
        label="Suscripción Activa"
      />
      <BooleanInput
        source="autoRenew"
        label="Renovación Automática"
      />
      <SelectInput
        source="paymentMethod"
        label="Método de Pago"
        choices={[
          { id: 'mercadopago', name: 'MercadoPago' },
          { id: 'transferencia', name: 'Transferencia Bancaria' },
          { id: 'manual', name: 'Asignación Manual (Admin)' },
        ]}
      />
      <TextInput
        source="transactionId"
        label="ID de Transacción"
        fullWidth
        helperText="ID de pago de MercadoPago u otro procesador"
      />
      <TextInput
        source="notes"
        label="Notas internas"
        multiline
        rows={2}
        fullWidth
      />
    </SimpleForm>
  </Edit>
);
