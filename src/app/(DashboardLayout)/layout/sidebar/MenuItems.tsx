import {
  IconAperture,
  IconCategory,
  IconCategoryFilled,
  IconCopy,
  IconEye,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconNews,
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
    title: "Trang chủ",
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
    href: "/san-pham",
  },
  {
    id: uniqueId(),
    title: "Lượt Xem Sản Phẩm",
    icon: IconEye,
    href: "/san-pham",
  },
  {
    id: uniqueId(),
    title: "Quản lý mẫu mã",
    icon: IconCategory,
    href: "/danh-muc-san-pham",
  },
  {
    navlabel: true,
    subheader: "Bài viết",
  },
  {
    id: uniqueId(),
    title: "Quản lý blog",
    icon: IconNews,
    href: "/bai-viet",
  },
  {
    id: uniqueId(),
    title: "Danh mục bài viết",
    icon: IconCategoryFilled,
    href: "/danh-muc-bai-viet",
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
