"use client";

import React from 'react';
import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  DateInput,
  BooleanInput,
  required
} from 'react-admin';

export const CompanySubscriptionCreate = () => (
  <Create title="Asignar Suscripción a Empresa">
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
        defaultValue={new Date().toISOString().split('T')[0]}
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
        defaultValue="active"
        validate={[required()]}
      />
      <BooleanInput 
        source="isActive" 
        label="Activar Inmediatamente" 
        defaultValue={true} 
      />
      <BooleanInput 
        source="autoRenew" 
        label="Renovación Automática" 
        defaultValue={false} 
      />
    </SimpleForm>
  </Create>
);
