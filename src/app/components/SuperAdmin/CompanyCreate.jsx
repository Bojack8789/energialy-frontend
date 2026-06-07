"use client";

import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput,
  BooleanInput,
  required,
  email
} from 'react-admin';

export const CompanyCreate = () => (
  <Create title="Crear Nueva Empresa">
    <SimpleForm>
      <TextInput 
        source="name" 
        label="Nombre de la Empresa" 
        validate={[required()]} 
        fullWidth 
      />
      <TextInput 
        source="rut" 
        label="RUT/NIT" 
        validate={[required()]} 
      />
      <TextInput
        source="email"
        label="Email Corporativo"
        type="email"
        validate={[required(), email()]}
        fullWidth
      />
      <TextInput 
        source="phone" 
        label="Teléfono" 
        validate={[required()]} 
      />
      <TextInput 
        source="address" 
        label="Dirección" 
        validate={[required()]} 
        fullWidth 
      />
      <TextInput 
        source="city" 
        label="Ciudad" 
        validate={[required()]} 
      />
      <TextInput 
        source="country" 
        label="País" 
        validate={[required()]} 
      />
      <TextInput 
        source="zipCode" 
        label="Código Postal" 
      />
      <SelectInput 
        source="organizationType" 
        label="Tipo de Organización" 
        choices={[
          { id: 'empresa_privada', name: 'Empresa Privada' },
          { id: 'empresa_publica', name: 'Empresa Pública' },
          { id: 'ong', name: 'ONG' },
          { id: 'cooperativa', name: 'Cooperativa' },
          { id: 'fundacion', name: 'Fundación' },
          { id: 'otro', name: 'Otro' },
        ]}
        validate={[required()]}
      />
      <TextInput 
        source="website" 
        label="Sitio Web" 
      />
      <TextInput 
        source="description" 
        label="Descripción" 
        multiline 
        rows={3} 
        fullWidth 
      />
      <BooleanInput 
        source="isVerified" 
        label="Empresa Verificada" 
        defaultValue={false} 
      />
      <BooleanInput 
        source="isActive" 
        label="Empresa Activa" 
        defaultValue={true} 
      />
    </SimpleForm>
  </Create>
);
