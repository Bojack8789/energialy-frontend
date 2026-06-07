"use client";

// SubscriptionEdit.jsx — ACTUALIZADO
// Reemplaza el generado anteriormente. Incluye todos los campos nuevos.

import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
} from 'react-admin';

export const SubscriptionEdit = () => (
  <Edit title="Editar plan de suscripción">
    <SimpleForm>

      <TextInput source="name"        label="Nombre del plan"                validate={[required()]} fullWidth />
      <TextInput source="description" label="Descripción"   multiline rows={3} fullWidth validate={[required()]} />
      <NumberInput source="price"    label="Precio (USD)"   validate={[required()]} />
      <TextInput   source="currency" label="Moneda"         validate={[required()]} />
      <NumberInput source="duration" label="Duración (días)" validate={[required()]} />

      <NumberInput
        source="maxTenders"
        label="Máx. Licitaciones activas (0 = ilimitado)"
        helperText="Dejá en 0 para ilimitado"
        min={0}
        format={v => v === null ? 0 : v}
        parse={v => v === 0 || v === '' ? null : v}
      />
      <NumberInput
        source="maxProposals"
        label="Máx. Propuestas enviadas en total (0 = ilimitado)"
        helperText="Dejá en 0 para ilimitado"
        min={0}
        format={v => v === null ? 0 : v}
        parse={v => v === 0 || v === '' ? null : v}
      />

      <BooleanInput source="canCreatePrivate"    label="Permite crear licitaciones privadas"       />
      <BooleanInput source="canHideBudget"       label="Permite ocultar el presupuesto"            />
      <BooleanInput source="featuredInDirectory" label="Aparece destacado en el Directorio (PLUS)" />

      <BooleanInput source="hasDocumentManagement" label="Gestión de Documentos" />
      <BooleanInput source="hasAdvancedReporting"  label="Reportes Avanzados"    />
      <BooleanInput source="hasPrioritySupport"    label="Soporte Prioritario"   />

      <BooleanInput source="isActive" label="Plan activo"  />
      <BooleanInput source="isPaused" label="Plan pausado (oculto pero no eliminado)" />

      <TextInput
        source="features"
        label="Características (separadas por coma)"
        multiline rows={3} fullWidth
      />
    </SimpleForm>
  </Edit>
);
