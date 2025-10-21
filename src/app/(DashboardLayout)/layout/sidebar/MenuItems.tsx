import {
  IconArticle,
  IconCategory,
  IconCategoryFilled,
  IconEye,
  IconLayoutDashboard,
  IconNews,
  IconTablePlus,
  IconPhoto,
  IconPlane,
} from "@tabler/icons-react";

let counter = 0;
const uniqueId = () => `id-${counter++}`;

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
  // {
  //   id: uniqueId(),
  //   title: "Lượt Xem Sản Phẩm",
  //   icon: IconEye,
  //   href: "/san-pham",
  // },
  {
    id: uniqueId(),
    title: "Quản lý danh mục",
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
    subheader: "Quản lý đơn hàng",
  },
  {
    id: uniqueId(),
    title: "Đơn hàng",
    icon: IconArticle,
    href: "/don-hang",
  },
  {
    navlabel: true,
    subheader: "Quản lý dịch vụ Visa",
  },
  {
    id: uniqueId(),
    title: "Dịch vụ Visa",
    icon: IconNews,
    href: "/dich-vu-visa",
  },
  {
    navlabel: true,
    subheader: "Tin tức",
  },
  {
    id: uniqueId(),
    title: "Quản lý tin tức",
    icon: IconArticle,
    href: "/tin-tuc",
  },
  {
    navlabel: true,
    subheader: "Tour du lịch",
  },
  {
    id: uniqueId(),
    title: "Quản lý tour",
    icon: IconPlane,
    href: "/tour-du-lich",
  },
  {
    navlabel: true,
    subheader: "Media",
  },
  {
    id: uniqueId(),
    title: "Quản lý media",
    icon: IconPhoto,
    href: "/media",
  },
  {
    navlabel: true,
    subheader: "Quản lý thẻ Meta",
  },
  {
    id: uniqueId(),
    title: "Meta",
    icon: IconArticle,
    href: "/meta",
  },
  {
    id: uniqueId(),
    title: "MetaJson",
    icon: IconArticle,
    href: "/meta-json",
  },
];

export default Menuitems;
