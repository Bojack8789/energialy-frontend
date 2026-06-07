import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Avatar,
  Button,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";
import Link from "next/link";
import { MdSpaceDashboard } from "react-icons/md";
import {MdOutlineLogout} from "react-icons/md";
import getLocalStorage from "../Func/localStorage";


 
export default function Example() {
  const userData = getLocalStorage();
  
  const defaultAvatar = `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=c7d2fe&color=3730a3&bold=true`

  const handleLogout = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const accessToken = sessionStorage.getItem('accessToken');

    try {
      // Llamar al endpoint de logout del backend (invalida el refreshToken en DB)
      await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      // Si falla el backend, igual limpiamos el lado del cliente
      console.error('Error al cerrar sesión en el servidor:', err);
    }

    // Limpiar sessionStorage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('companyId');
    sessionStorage.removeItem('companyName');

    // Eliminar la cookie del middleware
    document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict; Secure';

    // Redirigir al login
    window.location.href = '/login';
  };

  return (
    <Popover placement="bottom">
      <PopoverHandler>
        <div className="flex items-center justify-center cursor-pointer ml-4 sm:ml-2 sm:min-w-max">
          <div className="w-[50px] h-[50px] m-2">
            <img
              className="rounded-full w-full h-full object-cover"
              src={userData?.company?.profilePicture || defaultAvatar}
              alt={userData?.company?.name || "Default Image"}
              onError={(e) => {
                console.error('Error cargando imagen:', e.target.src);
                e.target.src = defaultAvatar;
              }}
            />
          </div>
          <div className="hidden m-2 sm:block">
            <h4 className="text-sm font-medium">
              {userData?.company?.name || "Sin empresa asociada"}
            </h4>
            <h4 className="text-xs text-gray-600">
              {userData?.firstName + " " + userData?.lastName}
            </h4>
          </div>
        </div>
      </PopoverHandler>
      <PopoverContent className="w-60 p-1">
        <List className="p-0">
          <Link
            href="/dashboard"
            //className="text-sm hover:text-primary-600 hover:font-semibold"
          >
            <ListItem className="m-0 text-sm hover:text-primary-600 hover:font-semibold cursor-pointer">
              <ListItemPrefix>
                <MdSpaceDashboard />
              </ListItemPrefix>
              Dashboard
            </ListItem>
          </Link>
          <ListItem
            className="text-sm hover:text-primary-600 hover:font-semibold cursor-pointer"
            onClick={handleLogout}
          >
            <ListItemPrefix>
              <MdOutlineLogout />
            </ListItemPrefix>
            Log Out
          </ListItem>
        </List>
      </PopoverContent>
    </Popover>
  );
}