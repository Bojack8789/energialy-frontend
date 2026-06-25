import React from "react";
import { AiOutlineTwitter } from "react-icons/ai";
import { BsLinkedin } from "react-icons/bs";
import Logo from "@/app/assets/Energialy Logo-01.svg";
import Image from "next/image";

const oportunities = [
  { name: "Crear licitaciones", link: "https://energialy.ar/bid/crear-licitaciones/" },
  { name: "Participar en Licitaciones", link: "https://energialy.ar/bid/participar-en-licitaciones/" },
  { name: "Financiamiento", link: "https://energialy.ar/bid/financiamiento/" },
  { name: "Directorio Energetico", link: "https://energialy.ar/bid/directorio/" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#545353] bg-cover bg-center h-full">
      <div className="h-full flex items-center justify-center p-2 px-4 mb-4 mt-12 border-b border-[#3D3D3D]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 w-full max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-1 px-4 text-[#B4B4B4]">
            <a href="/">
              <Image
                src={Logo}
                alt="company logo here"
                width={200}
                height={50}
                style={{ width: 'auto', height: '50px', maxWidth: '100%' }}
              />
            </a>
            <div>
              <p className="text-base mt-4">
              Plataforma para integrar a la Cadena de Valor, gestionar contrataciones entre Pymes y acceder a financiamiento.
              </p>
            </div>
          </div>
          <div className="col-span-1 px-4 text-[#B4B4B4]">
            <h4 className="text-xl tracking-wider mb-4">OPORTUNIDADES</h4>
            <ul className="pl-0">
              {oportunities.map((option, index) => (
                <li key={index} className="pb-2">
                  <a
                    href={option.link}
                    className="no-underline text-current hover:text-primary-500 transition duration-300"
                  >
                    {option.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-1 px-4 text-[#B4B4B4]">
            <h4 className="text-xl tracking-wider mb-4">COMPAÑIA</h4>
            <ul className="pl-0">
              <li>
                <a
                  href="https://energialy.ar/bid/descubri-energialy/"
                  className="no-underline text-current hover:text-primary-500 transition duration-300"
                >
                  Descubri Energialy
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-1 px-4 text-[#B4B4B4]">
            <h4 className="text-xl tracking-wider mb-4">Seguinos</h4>
            <ul className="flex list-none p-0">
              <li className="p-2 mx-2">
                <a
                  href="https://twitter.com/energialy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AiOutlineTwitter
                    className="text-[#B4B4B4] hover:bg-primary-500 hover:text-white transition duration-300"
                    size="30px"
                  ></AiOutlineTwitter>
                </a>
              </li>
              <li className="p-2 mx-2">
                <a
                  href="https://www.linkedin.com/company/energialy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BsLinkedin
                    className="text-[#B4B4B4] hover:bg-primary-500 hover:text-white transition duration-300"
                    size="30px"
                  ></BsLinkedin>
                </a>
              </li>
            </ul>
              <p className="flex justify-end mt-12">

              consultas: hola@energialy.ar
              </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center p-4 m-4 text-base text-[#B4B4B4] tracking-wide">
        <span>2023 © | ENERGIALY SAS | Hecho en Neuquén</span>
      </div>
    </footer>
  );
}
