"use client";

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  CreateButton,
  TopToolbar,
  NumberField,
  ReferenceField,
  useRecordContext,
  BooleanField,
  ShowButton
} from 'react-admin';

const TenderListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

const TenderRowActions = () => {
  const record = useRecordContext();
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ShowButton record={record} />
      <EditButton record={record} />
      <DeleteButton 
        record={record} 
        confirmTitle="Eliminar Licitación"
        confirmContent="¿Estás seguro de que quieres eliminar esta licitación? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export const TenderList = () => (
  <List actions={<TenderListActions />} title="Gestión de Licitaciones">
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="title" label="Título" />
      <TextField source="description" label="Descripción" />
      <ReferenceField source="CompanyId" reference="companies" label="Empresa">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="CategoryId" reference="categories" label="Categoría">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="publicationDate" label="Fecha Publicación" />
      <DateField source="closingDate" label="Fecha Cierre" />
      <NumberField source="budget" label="Presupuesto" />
      <BooleanField source="isActive" label="Activa" />
      <TenderRowActions />
    </Datagrid>
  </List>
);
