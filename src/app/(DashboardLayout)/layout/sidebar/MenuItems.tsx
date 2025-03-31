import {
  IconAperture,
  IconCopy,
  IconEye,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTablePlus,
  IconTypography,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "Sản Phẩm",
  },
  {
    id: uniqueId(),
    title: "Quản lý Sản Phẩm",
    icon: IconTablePlus,
    href: "/products",
  },
  {
    id: uniqueId(),
    title: "Lượt Xem Sản Phẩm",
    icon: IconEye,
    href: "/utilities/shadow",
  },
  {
    navlabel: true,
    subheader: "Mẫu mã",
  },
  {
    id: uniqueId(),
    title: "Quản lý mẫu mã",
    icon: IconTablePlus,
    href: "/product-category",
  },
  {
    navlabel: true,
    subheader: "Bài viết",
  },
  {
    id: uniqueId(),
    title: "Quản lý blog",
    icon: IconTablePlus,
    href: "/blog",
  },
  {
    navlabel: true,
    subheader: "Auth",
  },
  {
    id: uniqueId(),
    title: "Login",
    icon: IconLogin,
    href: "/authentication/login",
  },
  {
    id: uniqueId(),
    title: "Register",
    icon: IconUserPlus,
    href: "/authentication/register",
  },
];

export default Menuitems;
