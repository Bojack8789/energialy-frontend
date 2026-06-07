"use client";

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  EditButton,
  DeleteButton,
  CreateButton,
  TopToolbar,
  useRecordContext,
  ShowButton,
  ChipField,
  BooleanField
} from 'react-admin';

const CompanyListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

const CompanyRowActions = () => {
  const record = useRecordContext();
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ShowButton record={record} />
      <EditButton record={record} />
      <DeleteButton 
        record={record} 
        confirmTitle="Eliminar Empresa"
        confirmContent="¿Estás seguro de que quieres eliminar esta empresa? Esta acción eliminará también todos sus datos relacionados."
      />
    </div>
  );
};

export const CompanyList = () => (
  <List actions={<CompanyListActions />} title="Gestión de Empresas">
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Nombre" />
      <TextField source="rut" label="RUT/NIT" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Teléfono" />
      <TextField source="address" label="Dirección" />
      <ChipField source="organizationType" label="Tipo" />
      <BooleanField source="isVerified" label="Verificada" />
      <DateField source="createdAt" label="Creada" />
      <CompanyRowActions />
    </Datagrid>
  </List>
);
