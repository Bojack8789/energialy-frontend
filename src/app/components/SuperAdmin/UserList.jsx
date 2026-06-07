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
  ReferenceField,
  useRecordContext,
  ShowButton,
  ChipField
} from 'react-admin';

const UserListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

const UserRowActions = () => {
  const record = useRecordContext();
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ShowButton record={record} />
      <EditButton record={record} />
      <DeleteButton 
        record={record} 
        confirmTitle="Eliminar Usuario"
        confirmContent="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export const UserList = () => (
  <List actions={<UserListActions />} title="Gestión de Usuarios">
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="firstName" label="Nombre" />
      <TextField source="lastName" label="Apellido" />
      <EmailField source="email" label="Email" />
      <ChipField source="role" label="Rol" />
      <TextField source="position" label="Posición" />
      <ReferenceField source="CompanyId" reference="companies" label="Empresa">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" label="Creado" />
      <UserRowActions />
    </Datagrid>
  </List>
);
