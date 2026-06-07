"use client";

import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  PasswordInput,
  ReferenceInput,
  SelectInput,
  required,
  email
} from 'react-admin';

export const UserCreate = () => (
  <Create title="Crear Nuevo Usuario">
    <SimpleForm>
      <TextInput 
        source="firstName" 
        label="Nombre" 
        validate={[required()]} 
      />
      <TextInput 
        source="lastName" 
        label="Apellido" 
        validate={[required()]} 
      />
      <TextInput
        source="email"
        label="Email"
        type="email"
        validate={[required(), email()]}
        fullWidth
      />
      <PasswordInput 
        source="password" 
        label="Contraseña" 
        validate={[required()]} 
      />
      <SelectInput 
        source="role" 
        label="Rol" 
        choices={[
          { id: 'admin', name: 'Administrador' },
          { id: 'superAdmin', name: 'Super Administrador' },
          { id: 'bank', name: 'Banco' },
          { id: 'company_owner', name: 'Propietario de Empresa' },
          { id: 'company_collaborator', name: 'Colaborador de Empresa' },
        ]}
        validate={[required()]}
        defaultValue="admin"
      />
      <TextInput 
        source="position" 
        label="Posición/Cargo" 
      />
      <ReferenceInput 
        source="CompanyId" 
        reference="companies" 
        label="Empresa (opcional)"
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);
