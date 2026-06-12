"use client";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { setUserData } from "@/app/redux/actions";
import getLocalStorage from "@/app/Func/localStorage";
import { urlProduction } from "@/app/data/dataGeneric";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";

// ---------------------- Toastify -------------------------//
const displaySuccessMessage = (mensaje) => {
  toast.success(mensaje, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};

const displayFailedMessage = (mensaje) => {
  toast.error(mensaje, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};
//---------------------------------------------------------------//

export default function EditProfile({ option }) {
  const [user, setUser] = useState(null);
  console.log("user:", user);

  // Estados locales para los campos editables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setIsEdited(true);
    switch (field) {
      case "firstName": setFirstName(value); break;
      case "lastName":  setLastName(value);  break;
      case "password":  setPassword(value);  break;
      default: break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!isEdited && !password) {
      setSubmitError("Debes realizar alguna modificacion.");
      return;
    }

    const updatedData = {};
    if (firstName !== user.firstName) updatedData.firstName = firstName;
    if (lastName !== user.lastName)   updatedData.lastName  = lastName;
    if (password)                     updatedData.hashedPassword = password;

    if (Object.keys(updatedData).length === 0) {
      setSubmitError("Debes realizar alguna modificacion.");
      return;
    }

    try {
      await axios.put(`${urlProduction}/users/${user.id}`, updatedData);
      displaySuccessMessage("Cambios guardados con éxito");
      setPassword("");
      setIsEdited(false);
    } catch (error) {
      console.log("Error al actualizar datos: ", error);
      displayFailedMessage("Error al guardar los cambios");
    }
  };

  useEffect(() => {
    const user = getLocalStorage();
    setUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
  }, []);

  return (
    <div className="flex flex-col justify-start">
      <div className="w-full">
        <div>
          {(!option || option === 0 || typeof option === "undefined") && (
            <form
              className="w-full max-w-xl mx-auto px-4 py-6 sm:px-8"
              onSubmit={handleSubmit}
            >
              <div className="p-4">
                <label className="block mb-2 bg-[#fcfcfc] p-2 border-l-4 border-primary-500">
                  Email Registrado
                </label>
                <div className="w-full px-3 py-2 text-lg rounded border bg-gray-100">
                  {user?.email}
                </div>
              </div>

              <div className="p-4">
                <label className="block mb-2 bg-[#fcfcfc] p-2 border-l-4 border-primary-500">
                  Nombre:
                </label>
                <input
                  type="text"
                  value={firstName}
                  placeholder={firstName}
                  onChange={(e) => handleInputChange(e, "firstName")}
                  className="w-full px-3 py-2 text-lg rounded border"
                />
              </div>
              <div className="p-4">
                <label className="block mb-2 bg-[#fcfcfc] p-2 border-l-4 border-primary-500">
                  Apellido:
                </label>
                <input
                  type="text"
                  value={lastName}
                  placeholder={lastName}
                  onChange={(e) => handleInputChange(e, "lastName")}
                  className="w-full px-3 py-2 text-lg rounded border"
                />
              </div>
              <div className="p-4">
                <label className="block mb-2 bg-[#fcfcfc] p-2 border-l-4 border-primary-500">
                  Contraseña:
                </label>
                <div className="flex">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handleInputChange(e, "password")}
                    className="w-full px-3 py-2 text-lg rounded border"
                  />
                  <button
                    type="button"
                    className="focus:outline-none ml-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
                  </button>
                </div>
              </div>
              <div className="p-4 flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-white bg-[#191654] rounded hover:bg-secondary-600 transition duration-300"
                >
                  Guardar Cambios
                </button>
              </div>
              {submitError && (
                <div className="flex justify-center text-danger mt-2 mb-2">
                  {submitError}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      <ToastContainer style={{ marginTop: "100px" }} />
    </div>
  );
}
