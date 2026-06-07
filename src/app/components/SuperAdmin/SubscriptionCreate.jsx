"use client";

// SubscriptionCreate.jsx — ACTUALIZADO
// Incluye todos los campos nuevos del modelo actualizado.
// maxTenders y maxProposals: dejar vacío = ilimitado (se guarda como NULL).

import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
  FormDataConsumer,
} from 'react-admin';

export const SubscriptionCreate = () => (
  <Create title="Crear nuevo plan de suscripción">
    <SimpleForm>

      {/* Datos básicos */}
      <TextInput source="name" label="Nombre del plan (ej: PLUS)" validate={[required()]} fullWidth />
      <TextInput source="description" label="Descripción visible para el usuario" multiline rows={3} fullWidth validate={[required()]} />
      <NumberInput source="price" label="Precio mensual (USD)" validate={[required()]} defaultValue={0} />
      <TextInput source="currency" label="Moneda" defaultValue="USD" validate={[required()]} />
      <NumberInput source="duration" label="Duración (días)" defaultValue={30} validate={[required()]} />

      {/* Límites — dejar en 0 = usa NULL = ilimitado */}
      <NumberInput
        source="maxTenders"
        label="Máx. Licitaciones activas (0 = ilimitado)"
        defaultValue={0}
        helperText="Dejá en 0 para ilimitado"
        min={0}
        format={v => v === null ? 0 : v}
        parse={v => v === 0 || v === '' ? null : v}
      />
      <NumberInput
        source="maxProposals"
        label="Máx. Propuestas enviadas en total (0 = ilimitado)"
        defaultValue={0}
        helperText="Dejá en 0 para ilimitado"
        min={0}
        format={v => v === null ? 0 : v}
        parse={v => v === 0 || v === '' ? null : v}
      />

      {/* Permisos por plan */}
      <BooleanInput source="canCreatePrivate"    label="Permite crear licitaciones privadas"       defaultValue={false} />
      <BooleanInput source="canHideBudget"       label="Permite ocultar el presupuesto"            defaultValue={false} />
      <BooleanInput source="featuredInDirectory" label="Aparece destacado en el Directorio (PLUS)" defaultValue={false} />

      {/* Features adicionales */}
      <BooleanInput source="hasDocumentManagement" label="Gestión de Documentos"  defaultValue={true}  />
      <BooleanInput source="hasAdvancedReporting"  label="Reportes Avanzados"     defaultValue={false} />
      <BooleanInput source="hasPrioritySupport"    label="Soporte Prioritario"    defaultValue={false} />

      {/* Estado */}
      <BooleanInput source="isActive" label="Plan activo (visible para nuevas suscripciones)" defaultValue={true} />
      <BooleanInput source="isPaused" label="Plan pausado (oculto pero no eliminado)"         defaultValue={false} />

      {/* Features para la UI (texto) */}
      <TextInput
        source="features"
        label="Características (separadas por coma, para mostrar en la página de planes)"
        multiline rows={3} fullWidth
        helperText="Ej: Licitaciones ilimitadas, Propuestas ilimitadas, Soporte 24/7"
      />
    </SimpleForm>
  </Create>
);
