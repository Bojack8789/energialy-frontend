"use client";

import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  DateInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  BooleanInput,
  required
} from 'react-admin';

export const TenderCreate = () => (
  <Create title="Crear Nueva Licitación">
    <SimpleForm>
      <TextInput 
        source="title" 
        label="Título" 
        validate={[required()]} 
        fullWidth 
      />
      <TextInput 
        source="description" 
        label="Descripción" 
        multiline 
        rows={4} 
        fullWidth 
        validate={[required()]} 
      />
      <ReferenceInput 
        source="CompanyId" 
        reference="companies" 
        label="Empresa"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput 
        source="CategoryId" 
        reference="categories" 
        label="Categoría"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput 
        source="SubcategoryId" 
        reference="subcategories" 
        label="Subcategoría"
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput 
        source="LocationId" 
        reference="locations" 
        label="Ubicación"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <DateInput 
        source="publicationDate" 
        label="Fecha de Publicación" 
        validate={[required()]} 
      />
      <DateInput 
        source="closingDate" 
        label="Fecha de Cierre" 
        validate={[required()]} 
      />
      <NumberInput 
        source="budget" 
        label="Presupuesto" 
        validate={[required()]} 
      />
      <TextInput 
        source="currency" 
        label="Moneda" 
        defaultValue="USD" 
      />
      <BooleanInput 
        source="isActive" 
        label="Activa" 
        defaultValue={true} 
      />
      <TextInput 
        source="requirements" 
        label="Requisitos" 
        multiline 
        rows={3} 
        fullWidth 
      />
      <TextInput 
        source="deliveryTerms" 
        label="Términos de Entrega" 
        multiline 
        rows={2} 
        fullWidth 
      />
    </SimpleForm>
  </Create>
);
