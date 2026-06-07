import { MdSpaceDashboard } from "react-icons/md";
import { MdAccountBox } from "react-icons/md";
import {BiSolidMessageRounded} from 'react-icons/bi'
import {BiSolidBank} from 'react-icons/bi'
import {FaBriefcase} from 'react-icons/fa'
import { BiSolidImage } from "react-icons/bi";
export const menuBar = [
  {
    title: "Dashboard",
    url: "/dashboard",
    auth: ["admin", "superAdmin", "bank", "company_collaborator", "company_owner"],
    icon: <MdSpaceDashboard />,
  },
  {
    title: "Inbox",
    auth: ["admin", "superAdmin", "bank", "company_collaborator", "company_owner"],
    url: "/dashboard/inbox",
    icon: <BiSolidMessageRounded />,
  },
  {
    title: "Perfiles",
    auth: ["admin", "superAdmin", "bank", "company_collaborator", "company_owner"],
    url: "",
    icon: <MdAccountBox />,
    submenu: true,
    //spacing: true,
    submenuItems: [
      { title: "Ajustes de Usuario", url: "/dashboard/ajustesProfile" },
      { title: "Ajustes de Empresa", url: "/dashboard/ajustesEmpresa" },
    ],
  },
  {
    title: "Licitaciones",
    // url: "/dashboard/licitaciones",
    auth: ["admin", "superAdmin", "company_collaborator", "company_owner"],
    spacing: true,
    icon: <FaBriefcase />,
    submenu: true,
    submenuItems: [
      {
        title: "Mis Licitaciones",
        url: "/dashboard/tenders",
        //auth: ['admin', 'superAdmin'],
      },
      { title: "Mis Propuestas", url: "/dashboard/proposals" },
    ],
  },
  {
    title: "Financiamiento",
    url: "/dashboard/finanzas",
    auth: ["admin", "superAdmin", "company_collaborator", "company_owner"],
    icon: <BiSolidBank />,
    submenu: true,
    submenuItems: [
      {
        title: "Mis Solicitudes",
        url: "/dashboard/finanzas/solicitudes",
      },
      {
        title: "Apertura de cuenta",
        url: "/dashboard/finanzas/aperturaCuenta",
      },
      {
        title: "Solicitar producto",
        url: "/dashboard/finanzas/solicitarProducto",
      },
    ],
  },
  {
    title: "Banco",
    //url: "/dashboard/bank",
    auth: ["bank"],
    icon: <BiSolidBank />,
    submenu: true,
    submenuItems: [
      {
        title: "Cuentas Bancarias",
        url: "/dashboard/bank/accounts",
      },
      {
        title: "Productos Financieros",
        url: "/dashboard/bank/financialProducts",
      },
    ],
  },
  {
    title: "Administrador",
    auth: ["superAdmin"],
    url: "",
    icon: <MdSpaceDashboard />,
    submenu: true,
    submenuItems: [
      { title: "Administrar Empresas", url: "/dashboard/admin/empresas" },
      { title: "Administrar Usuarios", url: "/dashboard/admin/usuarios" },
      { title: "Administrar Licitaciones", url: "/dashboard/admin/licitaciones" },
      { title: "Panel Administrador", url: "/administrador" },
    ],
  },

  {
    title: "Galerias",
    auth: ["admin", "superAdmin", "company_collaborator", "company_owner"],
    url: "",
    icon: <BiSolidImage />,
    submenu: true,
    //spacing: true,
    submenuItems: [
      { title: "Productos/Servicios", url: "/dashboard/ajustesGallery" },
      { title: "Homologaciones/Certificaciones", url: "/dashboard/ajustesCertification" },
    ],
  },
];
