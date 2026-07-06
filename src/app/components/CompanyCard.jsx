'use client'
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function CompanyCard(props) {
  const router = useRouter()
  return (
    <>
      <div
        className={`relative w-full h-[320px] flex flex-col rounded-md bg-white shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden ${
          props.isOwn ? "ring-2 ring-secondary-500" : ""
        }`}
      >
        {props.isOwn && (
          <span className="absolute top-2 right-2 z-[60] bg-secondary-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            Tu empresa
          </span>
        )}
        <div className="relative w-full h-1/2 -mb-[45px] rounded-tr-md rounded-tl-md overflow-hidden">
          {props.compBanner ? (
            <Image
              className="rounded-tr-md rounded-tl-md object-cover"
              src={props.compBanner}
              fill
              alt={`Banner de ${props.compName}`}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-tr-md rounded-tl-md"></div>
          )}
        </div>
        <div className=" flex bg-white mx-auto my-0 z-50 rounded-md min-w-[90px] min-h-[90px]">
          {props.compLogo ? (
            <Image
              width={90}
              height={90}
              className="p-2 shadow rounded-md"
              src={props.compLogo}
              alt={`Logo de ${props.compName}`}
            />
          ) : (
            <div className="w-[90px] h-[90px] bg-gray-300 rounded-md p-2 shadow flex items-center justify-center text-gray-500 text-xs">
              Sin logo
            </div>
          )}
        </div>
        <div className="w-full h-1/2 rounded-br-md rounded-bl-md flex flex-col">
          <div
            className="w-full mt-2 pt-2 flex justify-center"
            onClick={() => {
              router.refresh(), router.push(`/directory/${props.compId}`);
            }}
          >
            <h3 className="text-lg cursor-pointer hover:text-secondary-500 truncate max-w-full px-2 text-center">
              {props.compName}
            </h3>
          </div>
          <div className="w-full flex justify-around p-2">
            {/* <Link
              href="/"
              className="border-transparent no-underline  text-gray-800  hover:text-secondary-500 inline-flex items-center px-1 border-b-2 text-sm font-medium "
            >
              Ver Licitaciones
            </Link> */}
            <Link
              href={`/directory/${props.compId}`}
              className="border-transparent no-underline  text-gray-800  hover:text-secondary-500 inline-flex items-center px-1  border-b-2 text-sm font-medium "
            >
              Ver Perfil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyCard