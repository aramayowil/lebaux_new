import lebaux_logo from "@/assets/images/logo/lebaux.png";
import { Navbar } from "@heroui/react";
import { NavbarBrand } from "@heroui/react";
import { NavbarContent } from "@heroui/react";
import { NavbarItem } from "@heroui/react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <Navbar
      maxWidth="full"
      className="bg-black/50 border-b border-zinc-900 backdrop-blur-md"
    >
      <NavbarBrand>
        <Link
          to="/login"
          className="transition-opacity hover:opacity-80 active:scale-95"
        >
          <img
            src={lebaux_logo}
            alt="Lebaux"
            className="h-8 w-auto object-contain"
          />
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <Link
            className="text-zinc-400 hover:text-white transition-colors text-sm"
            to="/ayuda"
          >
            Soporte Técnico
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default NavBar;
