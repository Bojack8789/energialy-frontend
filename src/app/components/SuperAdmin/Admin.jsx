"use client"

// Admin.jsx — CORREGIDO: se agregan los componentes Edit faltantes

import { Admin, Resource, Layout } from "react-admin";
import dataProvider from "./ApiProviderUsers";
import UserRolesChart from "./RolesChart";
import TailAdminLayout from './TailAdminLayout';

import { UserList } from './UserListTailAdmin';
import { UserCreate } from './UserCreate';
import { CompanyList } from './CompanyListTailAdmin';
import { CompanyCreate } from './CompanyCreate';
import { TenderList } from './TenderListTailAdmin';
import { TenderCreate } from './TenderCreate';
import { TenderEdit } from './TenderEdit';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionCreate } from './SubscriptionCreate';
import { SubscriptionEdit } from './SubscriptionEdit';           // ✅ NUEVO
import { CompanySubscriptionList } from './CompanySubscriptionList';
import { CompanySubscriptionCreate } from './CompanySubscriptionCreate';
import { CompanySubscriptionEdit } from './CompanySubscriptionEdit'; // ✅ NUEVO
import { AdminChat } from './AdminChat';

import Register from '../Register';
import RegisterCompany from '../RegisterCompany';

const CustomReactAdminLayout = (props) => (
  <Layout
    {...props}
    sidebar={() => null}
    appBar={() => null}
  />
);

const AdminApp = () => {
  console.log("AdminApp renderizado");

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <TailAdminLayout>
      <Admin
        dataProvider={dataProvider}
        layout={CustomReactAdminLayout}
      >
        <Resource name="Dashboard" list={UserRolesChart} />

        {/* User Management */}
        <Resource
          name="users"
          list={UserList}
          create={UserCreate}
          edit={Register}
          recordRepresentation="name"
        />

        {/* Company Management */}
        <Resource
          name="companies"
          list={CompanyList}
          create={CompanyCreate}
          edit={RegisterCompany}
        />

        {/* Tender Management */}
        <Resource
          name="tenders"
          list={TenderList}
          create={TenderCreate}
          edit={TenderEdit}
        />

        {/* Subscription Plans Management */}
        {/* ✅ FIX: se agrega edit={SubscriptionEdit} */}
        <Resource
          name="subscriptions"
          list={SubscriptionList}
          create={SubscriptionCreate}
          edit={SubscriptionEdit}
        />

        {/* Company-Subscription Assignment */}
        {/* ✅ FIX: se agrega edit={CompanySubscriptionEdit} */}
        <Resource
          name="companySubscriptions"
          list={CompanySubscriptionList}
          create={CompanySubscriptionCreate}
          edit={CompanySubscriptionEdit}
        />

        {/* Admin Chat */}
        <Resource name="chat" list={AdminChat} />

        {/* Other Resources (referenced by ReferenceInput) */}
        <Resource name="financeProducts" />
        <Resource name="bankAccounts" />
        <Resource name="categories" />
        <Resource name="subcategories" />
        <Resource name="locations" />
        <Resource name="proposals" />
        <Resource name="documents" />
      </Admin>
    </TailAdminLayout>
  );
};

export default AdminApp;
