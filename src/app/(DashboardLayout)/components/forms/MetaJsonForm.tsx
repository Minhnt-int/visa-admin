import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@/config/mui';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { FormControlLabel, Switch } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import TabIcon from '@mui/icons-material/Tab';

let zaloIcon = "/images/logos/zalo_icon.png"
// Interface cho Slide
interface Slide {
  imgSrc?: string; // Đường dẫn đến hình ảnh
  alt: string; // Mô tả thay thế cho hình ảnh
  subheading: string; // Tiêu đề phụ
  heading?: string; // Tiêu đề chính
  btnText?: string; // Nội dung hiển thị trên nút
  link?: string; // Đường dẫn khi nhấp vào nút
}

// Interface cho ContactInfo
interface ContactInfo {
  address: string; // Địa chỉ
  email: string; // Email liên hệ
  phone: string; // Số điện thoại
}

// Interfaces for FAQs
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isOpen?: string; // Theo JSON mẫu là string "true"/"false"
}

interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

// Interfaces for Store
interface TimeRange {
  start: string;
  end: string;
}

interface OpenTimes {
  weekend: TimeRange;
  weekdays: TimeRange;
}

interface SocialMediaLinks {
  youtube?: string;
  facebook?: string;
  instagram?: string;
}

interface StoreInfo {
  id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  address: string;
  openTimes: OpenTimes;
  socialMedia: SocialMediaLinks;
}
interface MetaJsonAttributes {
  id?: number;
  pageKey: string;
  metaData: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

interface MetaJsonFormProps {
  formData: MetaJsonAttributes;
  isView?: boolean;
  isEdit?: boolean;
  onSubmit: (data: MetaJsonAttributes) => void;
  onCancel: () => void;
}

// Mẫu cho slide - trực tiếp là mảng các slide
const slideTemplate = [
  {
    imgSrc: '',
    alt: '',
    subheading: '',
    heading: '',
    btnText: '',
    link: '',
  },
];

// Mẫu cho thông tin liên hệ - trực tiếp là đối tượng ContactInfo
const contactTemplate = {
  _type: "info",
  phone: "",
  email: "",
  address: "",
  mapIframeSrc: "",
  openTime: {
    weekdays: {
      days: "",
      hours: ""
    },
    weekend: {
      days: "",
      hours: ""
    }
  },
  socialMedia: {
    facebook: "",
    instagram: "",
    youtube: "",
    zalo: ""
  }
};

// Mẫu cho FAQs
const faqsTemplate = {
  _type: "faqs",
  categories: [
    {
      id: "product-info-new",
      title: "Thông Tin Sản Phẩm Mới",
      items: [
        { id: "accordion-new-1", question: "Câu hỏi mẫu?", answer: "Trả lời mẫu.", isOpen: "false" },
      ],
    },
  ],
};

// Mẫu cho Store
const storeTemplate = {
  _type: "store",
  mapIframeSrc: "",
  stores: [
    {
      id: "",
      name: "",
      email: "",
      image: "",
      phone: "",
      address: "",
      openTimes: {
        weekend: { start: "", end: "" },
        weekdays: { start: "", end: "" },
      },
      socialMedia: {
        youtube: "",
        facebook: "",
        instagram: "",
      },
    },
  ],
};

// Thêm mẫu cho About/Giới thiệu sau mẫu cho Store
const aboutTemplate = {
  _type: "about",
  title: "",
  image: {
    src: "",
    alt: "image-team",
    width: 930,
    height: 618
  },
  tabs: [
    {
      name: "Giới thiệu",
      content: "Chào mừng đến với Quà tặng Kim Quy, điểm đến hàng đầu của bạn để tìm kiếm quà tặng đẳng cấp, tinh tế. Chúng tôi tự hào mang đến một bộ sưu tập chọn lọc kỹ lưỡng những quà tặng độc đáo và ý nghĩa. Sứ mệnh của chúng tôi là mang đến cho bạn những sự lựa chọn sang trọng, đảm bảo mỗi sản phẩm đều toát lên vẻ đẹp tinh tế và chất lượng hoàn hảo. Hãy dành tặng cho người mình yêu quý những món quà ý nghĩa, đậm dấu ấn từ Quà tặng Kim Quy."
    },
    {
      name: "Tầm nhìn",
      content: "Chào mừng đến với Quà tặng Kim Quy, nơi hội tụ những món quà độc đáo và ý nghĩa nhất dành cho bạn. Chúng tôi tự hào mang đến một bộ sưu tập quà tặng được tuyển chọn tỉ mỉ, từ những sản phẩm thủ công tinh xảo mang đậm nét văn hóa Việt Nam đến những món đồ hiện đại, sang trọng từ khắp nơi trên thế giới. Sứ mệnh của chúng tôi là giúp bạn trao gửi trọn vẹn yêu thương và sự quan tâm qua từng món quà, làm cho mỗi khoảnh khắc trở nên đặc biệt và đáng nhớ. Hãy khám phá thế giới quà tặng phong phú và ý nghĩa tại Quà tặng Kim Quy, nơi cảm xúc được nâng niu và trân trọng."
    },
    {
      name: "Sự khác biệt",
      content: "Chào mừng bạn đến với Quà tặng Kim Quy, điểm đến lý tưởng cho những món quà độc đáo và đầy ý nghĩa. Chúng tôi tự hào giới thiệu một bộ sưu tập quà tặng được tuyển chọn cẩn thận, từ những sản phẩm thủ công tinh xảo mang đậm bản sắc Việt đến những thiết kế hiện đại, tinh tế từ khắp năm châu. Với sứ mệnh giúp bạn trao gửi những tình cảm chân thành nhất, chúng tôi luôn nỗ lực mang đến những món quà chất lượng, trang nhã, góp phần tạo nên những khoảnh khắc đáng nhớ. Hãy khám phá thế giới quà tặng phong phú và ý nghĩa tại Quà tặng Kim Quy, nơi mỗi món quà đều chứa đựng một câu chuyện riêng."
    },
    {
      name: "Cam kết",
      content: "Chào mừng đến với Quà tặng Kim Quy, điểm đến hàng đầu cho những món quà độc đáo và mang đậm dấu ấn cá nhân. Chúng tôi tự hào mang đến một bộ sưu tập quà tặng tinh tế, được lựa chọn cẩn thận từ những sản phẩm thủ công truyền thống đến những thiết kế hiện đại, sáng tạo từ khắp mọi miền. Sứ mệnh của chúng tôi là giúp bạn gửi gắm những tình cảm trân trọng nhất thông qua những món quà ý nghĩa, làm cho mỗi dịp đặc biệt trở nên đáng nhớ hơn bao giờ hết. Hãy khám phá thế giới quà tặng phong phú và độc đáo tại Quà tặng Kim Quy, nơi mỗi món quà đều kể một câu chuyện riêng."
    }
  ]
};


const MetaJsonForm: React.FC<MetaJsonFormProps> = ({
  formData,
  isView = false,
  isEdit = false,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<MetaJsonAttributes>(formData);
  const [jsonContent, setJsonContent] = useState<string>('{}');
  const [jsonError, setJsonError] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [mediaPopupOpen, setMediaPopupOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ type: 'banner' | 'store' | 'about', index: number, field?: string } | null>(null);


  // Thêm các state này vào component MetaJsonForm
const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

// Thêm các hàm này
const toggleCategoryExpand = (catIndex: number) => {
  setExpandedCategories(prev => ({
    ...prev,
    [catIndex]: !prev[catIndex]
  }));
};

const toggleItemExpand = (catIndex: number, itemIndex: number) => {
  const key = `${catIndex}-${itemIndex}`;
  setExpandedItems(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
};
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (isView) {
      setActiveTab(newValue);
      if (form.metaData) {
        setJsonContent(JSON.stringify(form.metaData, null, 2));
      }
      return;
    }

    if (isEdit) {
      const originalType = form.metaData?._type;
      let originalTypeTabIndex = -1;
      if (originalType === 'banner') originalTypeTabIndex = 0;
      else if (originalType === 'info') originalTypeTabIndex = 1;
      else if (originalType === 'faqs') originalTypeTabIndex = 2;
      else if (originalType === 'store') originalTypeTabIndex = 3;
      else if (originalType === 'about') originalTypeTabIndex = 4;
      // If originalType is 'custom' or undefined, originalTypeTabIndex remains -1.

      // Allow switching to JSON Editor tab (index 5)
      if (newValue === 5) {
        setActiveTab(newValue);
        if (form.metaData) {
          setJsonContent(JSON.stringify(form.metaData, null, 2));
        }
        return;
      }
      // Allow switching from JSON Editor (or from original tab itself)
      // back to the original specialized tab
      else if (newValue === originalTypeTabIndex && originalTypeTabIndex !== -1) {
        setActiveTab(newValue);
        if (form.metaData) {
          setJsonContent(JSON.stringify(form.metaData, null, 2));
        }
        return;
      }
      // Otherwise, do not allow switching to other specialized tabs
      return;
    }

    // Create mode - allow free switching and set up template data
    let newData: any;

    if (newValue === 0) {
      newData = { _type: "banner", slides: [...slideTemplate] };
    } else if (newValue === 1) {
      newData = { ...contactTemplate };
    } else if (newValue === 2) {
      newData = { ...faqsTemplate };
    } else if (newValue === 3) {
      newData = { ...storeTemplate };
    } else if (newValue === 4) {
      newData = { ...aboutTemplate };
    }
    else if (newValue === 5) { // JSON Editor
      // If switching to JSON editor from another tab in create mode,
      // preserve the data if it was already set, otherwise default.
      newData = form.metaData && Object.keys(form.metaData).length > 0 && form.metaData._type !== undefined
        ? form.metaData
        : { _type: "custom" };
    }

    setForm((prev) => ({
      ...prev,
      metaData: newData,
    }));
    setJsonContent(JSON.stringify(newData, null, 2));
    setActiveTab(newValue);
  };

  useEffect(() => {
    setForm(formData);

    if (formData.metaData) {
      setJsonContent(JSON.stringify(formData.metaData, null, 2));
      if (formData.metaData._type === "banner") {
        setActiveTab(0);
      } else if (formData.metaData._type === "info") {
        setActiveTab(1);
      } else if (formData.metaData._type === "faqs") {
        setActiveTab(2);
      } else if (formData.metaData._type === "store") {
        setActiveTab(3);
      } else if (formData.metaData._type === "about") {
        setActiveTab(4);  
      } else { // 'custom' or other/missing _type
        setActiveTab(5); // JSON Editor
      }
    } else {
      // New form: Initialize based on the default activeTab (0)
      let initialMetaData;
      if (activeTab === 0) {
        initialMetaData = { _type: "banner", slides: [...slideTemplate] };
      } else if (activeTab === 1) {
        initialMetaData = { ...contactTemplate };
      } else if (activeTab === 2) {
        initialMetaData = { ...faqsTemplate };
      } else if (activeTab === 3) {
        initialMetaData = { ...storeTemplate };
      } else { // activeTab === 2
        initialMetaData = { _type: "custom" };
      }

      if (!isEdit && !isView) { // Only initialize for new forms
        setForm(prev => ({ ...prev, metaData: initialMetaData }));
        setJsonContent(JSON.stringify(initialMetaData, null, 2));
      } else {
        setJsonContent('{}'); // Edit/View mode but no metaData (should ideally not happen)
      }
    }
  }, [formData, isEdit, isView]);

  // Mặc định mở tất cả danh mục khi component được khởi tạo hoặc khi data thay đổi
  useEffect(() => {
    // Mặc định mở tất cả danh mục khi component được khởi tạo hoặc khi data thay đổi
    if (formData.metaData?.categories?.length) {
      const initialExpandedCategories: Record<number, boolean> = {};
      const initialExpandedItems: Record<string, boolean> = {};
      
      formData.metaData.categories.forEach((cat: any, catIndex: number) => {
        initialExpandedCategories[catIndex] = true; // Mở rộng mặc định
        
        cat.items?.forEach((_: any, itemIndex: number) => {
          initialExpandedItems[`${catIndex}-${itemIndex}`] = false; // Mặc định thu gọn các câu hỏi
        });
      });
      
      setExpandedCategories(initialExpandedCategories);
      setExpandedItems(initialExpandedItems);
    }
  }, [formData]);

  const handleChange = (field: keyof MetaJsonAttributes, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleContactInfoChange = (field: string, value: any) => {
    setForm(prev => {
      const newMetaData = {
        ...prev.metaData,
        _type: "info", // Ensure type is "info" for this tab
        [field]: value,
      };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return {
        ...prev,
        metaData: newMetaData,
      };
    });
  };

  // Helper functions for FAQs
  const handleFaqCategoryChange = (catIndex: number, field: keyof FaqCategory, value: any) => {
    setForm(prev => {
      const newCategories = [...(prev.metaData?.categories || [])];
      if (newCategories[catIndex]) {
        (newCategories[catIndex] as any)[field] = value;
      }
      const newMetaData = { ...(prev.metaData || {}), _type: "faqs", categories: newCategories };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  const handleAddFaqCategory = () => {
    setForm(prev => {
      const currentCategories = Array.isArray(prev.metaData?.categories) ? prev.metaData.categories : [];
      const newCategory: FaqCategory = {
        id: `category-new-${Date.now()}`,
        title: "Danh mục câu hỏi mới",
        items: [{ id: `accordion-${Date.now()}`, question: "Câu hỏi mới?", answer: "New Answer." }]
      };
      const newMetaData = { ...(prev.metaData || {}), _type: "faqs", categories: [...currentCategories, newCategory] };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  const handleRemoveFaqCategory = (catIndex: number) => {
    setForm(prev => {
      const newCategories = [...(prev.metaData?.categories || [])];
      newCategories.splice(catIndex, 1);
      const newMetaData = { ...(prev.metaData || {}), _type: "faqs", categories: newCategories };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  const handleFaqItemChange = (catIndex: number, itemIndex: number, field: keyof FaqItem, value: any) => {
    setForm(prev => {
      const newCategories = [...(prev.metaData?.categories || [])];
      if (newCategories[catIndex] && newCategories[catIndex].items[itemIndex]) {
        (newCategories[catIndex].items[itemIndex] as any)[field] = value;
      }
      const newMetaData = { ...(prev.metaData || {}), _type: "faqs", categories: newCategories };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  const handleAddFaqItem = (catIndex: number) => {
    setForm(prev => {
      const newCategories = [...(prev.metaData?.categories || [])];
      if (newCategories[catIndex]) {
        const newItem: FaqItem = { id: `accordion-${Date.now()}`, question: "Câu hỏi mới?", answer: "New Answer." };
        newCategories[catIndex].items.push(newItem);
      }
      const newMetaData = { ...(prev.metaData || {}), _type: "faqs", categories: newCategories };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  const handleRemoveFaqItem = (catIndex: number, itemIndex: number) => {
    setForm(prev => {
      const newCategories = [...(prev.metaData?.categories || [])];
      if (newCategories[catIndex] && newCategories[catIndex].items) {
        newCategories[catIndex].items.splice(itemIndex, 1);
      }
      const newMetaData = { ...(prev.metaData || {}), _type: "faqs", categories: newCategories };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  // Helper for nested fields in Contact Info (e.g., socialMedia.facebook)
  const handleNestedContactInfoChange = (path: string[], value: any) => {
    setForm(prev => {
      const newMetaData = { ...(prev.metaData || {}), _type: "info" };
      let current = newMetaData as any;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  // Helper functions for Store
  const handleStoreDataChange = (field: keyof StoreInfo | 'mapIframeSrc', value: any, storeIndex?: number) => {
    setForm(prev => {
      let newMetaData = { ...(prev.metaData || {}), _type: "store" } as any;
      if (field === 'mapIframeSrc') {
        newMetaData.mapIframeSrc = value;
      } else if (storeIndex !== undefined && newMetaData.stores && newMetaData.stores[storeIndex]) {
        (newMetaData.stores[storeIndex] as any)[field] = value;
      }
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  const handleNestedStoreChange = (storeIndex: number, path: string[], value: any) => {
    setForm(prev => {
      const newStores = JSON.parse(JSON.stringify(prev.metaData?.stores || [])); // Deep copy
      let current = newStores[storeIndex];
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      const newMetaData = { ...(prev.metaData || {}), _type: "store", stores: newStores };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  const handleAddStore = () => {
    setForm(prev => {
      const currentStores = Array.isArray(prev.metaData?.stores) ? prev.metaData.stores : [];
      const newStore = JSON.parse(JSON.stringify(storeTemplate.stores[0])); // Deep copy template
      newStore.id = `store-new-${Date.now()}`;
      const newMetaData = { ...(prev.metaData || {}), _type: "store", stores: [...currentStores, newStore] };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  const handleRemoveStore = (storeIndex: number) => {
    setForm(prev => {
      const newStores = [...(prev.metaData?.stores || [])];
      newStores.splice(storeIndex, 1);
      const newMetaData = { ...(prev.metaData || {}), _type: "store", stores: newStores };
      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return { ...prev, metaData: newMetaData };
    });
  };

  // Note: handleMetaDataChange was removed as specific handlers like handleContactInfoChange
  // and inline updates for banner slides are used instead to manage _type correctly.
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonContent(value);
    setJsonError('');

    try {
      const parsedJson = JSON.parse(value);
      setForm((prev) => ({
        ...prev,
        metaData: parsedJson,
      }));
    } catch (error) {
      setJsonError('JSON không hợp lệ');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.pageKey.trim()) {
      newErrors.pageKey = 'Page Key không được để trống';
    }

    if (jsonError) {
      newErrors.json = jsonError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(form);
    }
  };

  const formatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      setJsonError('JSON không hợp lệ');
    }
  };

  const handleMediaSelect = (media: ProductMedia) => {
    if (!mediaTarget) return;

    setForm(prev => {
      let newMetaData = { ...(prev.metaData || {}) };

      if (mediaTarget.type === 'banner') {
        const slides = Array.isArray(newMetaData.slides) ? [...newMetaData.slides] : [];
        if (!slides[mediaTarget.index]) {
          slides[mediaTarget.index] = { alt: '', subheading: '' }; // Initialize if not present
        }
        slides[mediaTarget.index].imgSrc = media.url;
        // Cũng có thể cập nhật alt từ media.altText nếu muốn
        if (!slides[mediaTarget.index].alt && media.altText) {
          slides[mediaTarget.index].alt = media.altText;
        }
        newMetaData = {
          ...newMetaData,
          _type: "banner",
          slides: slides,
        };
      } else if (mediaTarget.type === 'store' && mediaTarget.field === 'image') {
        const stores = Array.isArray(newMetaData.stores) ? [...newMetaData.stores] : [];
        if (stores[mediaTarget.index]) {
          stores[mediaTarget.index].image = media.url;
          newMetaData = {
            ...newMetaData,
            _type: "store",
            stores: stores,
          };
        }
      } else if (mediaTarget.type === 'about' && mediaTarget.field === 'image') {
        
        newMetaData = {
          ...newMetaData,
          _type: "about",
          image: {
            ...(newMetaData.image || {}),
            src: media.url,
            // Tự động sử dụng altText từ MediaPopup cho trường alt
            alt: media.altText || newMetaData.image?.alt || "image-team"
          }
        };
      }

      setJsonContent(JSON.stringify(newMetaData, null, 2));
      return {
        ...prev,
        metaData: newMetaData,
      };
    });
    setMediaPopupOpen(false);
    setMediaTarget(null);
  };

  // Thêm các hàm xử lý cho tab About
const handleAboutChange = (field: string, value: any) => {
  setForm(prev => {
    const newMetaData = {
      ...prev.metaData,
      _type: "about",
      [field]: value,
    };
    setJsonContent(JSON.stringify(newMetaData, null, 2));
    return {
      ...prev,
      metaData: newMetaData,
    };
  });
};

const handleImageChange = (field: string, value: any) => {
  setForm(prev => {
    const newMetaData = {
      ...prev.metaData,
      _type: "about",
      image: {
        ...(prev.metaData?.image || {}),
        [field]: field === 'width' || field === 'height' ? Number(value) : value
      }
    };
    setJsonContent(JSON.stringify(newMetaData, null, 2));
    return {
      ...prev,
      metaData: newMetaData,
    };
  });
};

const handleTabContentChange = (tabIndex: number, field: string, value: any) => {
  setForm(prev => {
    const tabs = [...(prev.metaData?.tabs || [])];
    if (tabs[tabIndex]) {
      tabs[tabIndex] = {
        ...tabs[tabIndex],
        [field]: value
      };
    }
    
    const newMetaData = {
      ...prev.metaData,
      _type: "about",
      tabs: tabs
    };
    
    setJsonContent(JSON.stringify(newMetaData, null, 2));
    return {
      ...prev,
      metaData: newMetaData,
    };
  });
};

const handleAddAboutTab = () => {
  setForm(prev => {
    const tabs = [...(prev.metaData?.tabs || [])];
    tabs.push({
      name: `Tab mới ${tabs.length + 1}`,
      content: "Nội dung mới..."
    });
    
    const newMetaData = {
      ...prev.metaData,
      _type: "about",
      tabs: tabs
    };
    
    setJsonContent(JSON.stringify(newMetaData, null, 2));
    return {
      ...prev,
      metaData: newMetaData,
    };
  });
};

const handleRemoveAboutTab = (tabIndex: number) => {
  setForm(prev => {
    const tabs = [...(prev.metaData?.tabs || [])];
    tabs.splice(tabIndex, 1);
    
    const newMetaData = {
      ...prev.metaData,
      _type: "about",
      tabs: tabs
    };
    
    setJsonContent(JSON.stringify(newMetaData, null, 2));
    return {
      ...prev,
      metaData: newMetaData,
    };
  });
};
  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            {isView ? 'Chi tiết Meta JSON' : isEdit ? 'Cập nhật Meta JSON' : 'Thêm Meta JSON mới'}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Page Key *"
                  fullWidth
                  value={form.pageKey}
                  onChange={(e) => handleChange('pageKey', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  disabled={isView || isEdit}
                  error={!!errors.pageKey}
                  helperText={errors.pageKey || 'Ví dụ: trang-chu, gioi-thieu, lien-he'}
                  sx={{ mb: 3 }}
                  placeholder="trang-chu"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Dữ liệu trang
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab
                      label="Banner"
                      disabled={isEdit && form.metaData?._type !== 'banner'}
                    />
                    <Tab
                      label="Contact Info"
                      disabled={isEdit && form.metaData?._type !== 'info'}
                    />
                    <Tab
                      label="FAQs"
                      disabled={isEdit && form.metaData?._type !== 'faqs'}
                    />
                    <Tab
                      label="Store"
                      disabled={isEdit && form.metaData?._type !== 'store'}
                    />
                    <Tab
                      label="About" 
                      disabled={isEdit && form.metaData?._type !== 'about'}
                    />
                    <Tab label="JSON Editor" />
                  </Tabs>
                </Box>

                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Cấu hình Banner Slider
                      </Typography>

                      {/* Hiển thị form cho mỗi banner trong form.metaData.slides */}
                      {(Array.isArray(form.metaData?.slides) ? form.metaData.slides : []).map((slide, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            mb: 2,
                            position: 'relative'
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Banner #{index + 1}
                          </Typography>

                          {/* Nút xóa banner (chỉ hiển thị khi có nhiều hơn 1 banner) */}
                          {Array.isArray(form.metaData?.slides) && form.metaData.slides.length > 1 && !isView && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              sx={{ position: 'absolute', top: 8, right: 8 }}
                              onClick={() => {
                                const currentSlides = Array.isArray(form.metaData?.slides) ? [...form.metaData.slides] : [];
                                if (currentSlides.length > 0) {
                                  const newSlidesArray = [...currentSlides];
                                  newSlidesArray.splice(index, 1);
                                  setForm(prev => {
                                    const newMetaData = {
                                      ...(prev.metaData || {}),
                                      _type: "banner",
                                      slides: newSlidesArray
                                    };
                                    setJsonContent(JSON.stringify(newMetaData, null, 2));
                                    return { ...prev, metaData: newMetaData };
                                  });
                                }
                              }}
                              disabled={isView}
                            >
                              Xóa
                            </Button>
                          )}

                          {/* Các trường nhập liệu cũng cần cập nhật tương tự */}
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                              <TextField
                                label="URL Hình ảnh"
                                fullWidth
                                value={slide.imgSrc || ''}
                                onChange={(e) => {
                                  const newSlidesArray = Array.isArray(form.metaData?.slides) ? [...form.metaData.slides] : [];
                                  if (newSlidesArray[index]) {
                                    newSlidesArray[index].imgSrc = e.target.value;
                                    setForm(prev => {
                                      const newMetaData = {
                                        ...(prev.metaData || {}), _type: "banner", slides: newSlidesArray
                                      };
                                      setJsonContent(JSON.stringify(newMetaData, null, 2));
                                      return { ...prev, metaData: newMetaData };
                                    });
                                  }
                                }}
                                disabled={isView}
                                placeholder="/images/banner.jpg"
                                sx={{ mb: 2 }}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  setMediaTarget({ type: 'banner', index: index });
                                  setMediaPopupOpen(true);
                                }}
                                disabled={isView}
                                fullWidth
                              >
                                Chọn hình ảnh
                              </Button>
                            </Grid>
                          </Grid>

                          {/* Hiển thị xem trước hình ảnh */}
                          {slide.imgSrc && (
                            <Box sx={{ mt: 1, mb: 3, textAlign: 'center', border: '1px dashed #ccc', p: 2, borderRadius: '4px' }}>
                              <Typography variant="caption" display="block" gutterBottom>
                                Xem trước hình ảnh:
                              </Typography>
                              <img
                                src={slide.imgSrc.startsWith('http')
                                  ? slide.imgSrc
                                  : `${process.env.NEXT_PUBLIC_API_URL || ''}${slide.imgSrc}`}
                                alt="Banner preview"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: 200,
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/image-placeholder.png';
                                  (e.target as HTMLImageElement).style.opacity = '0.5';
                                }}
                              />
                            </Box>
                          )}

                          <TextField
                            label="Alt Text *"
                            fullWidth
                            value={slide.alt || ''}
                            onChange={(e) => {
                              const newSlidesArray = Array.isArray(form.metaData?.slides) ? [...form.metaData.slides] : [];
                              if (newSlidesArray[index]) {
                                newSlidesArray[index].alt = e.target.value;
                                setForm(prev => {
                                  const newMetaData = { ...(prev.metaData || {}), _type: "banner", slides: newSlidesArray };
                                  setJsonContent(JSON.stringify(newMetaData, null, 2));
                                  return { ...prev, metaData: newMetaData };
                                });
                              }
                            }}
                            disabled={isView}
                            required
                            placeholder="Mô tả hình ảnh"
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Tiêu đề phụ *"
                            fullWidth
                            value={slide.subheading || ''}
                            onChange={(e) => {
                              const newSlidesArray = Array.isArray(form.metaData?.slides) ? [...form.metaData.slides] : [];
                              if (newSlidesArray[index]) {
                                newSlidesArray[index].subheading = e.target.value;
                                setForm(prev => {
                                  const newMetaData = { ...(prev.metaData || {}), _type: "banner", slides: newSlidesArray };
                                  setJsonContent(JSON.stringify(newMetaData, null, 2));
                                  return { ...prev, metaData: newMetaData };
                                });
                              }
                            }}
                            disabled={isView}
                            placeholder="Tiêu đề phụ"
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Tiêu đề chính"
                            fullWidth
                            value={slide.heading || ''}
                            onChange={(e) => {
                              const newSlidesArray = Array.isArray(form.metaData?.slides) ? [...form.metaData.slides] : [];
                              if (newSlidesArray[index]) {
                                newSlidesArray[index].heading = e.target.value;
                                setForm(prev => {
                                  const newMetaData = { ...(prev.metaData || {}), _type: "banner", slides: newSlidesArray };
                                  setJsonContent(JSON.stringify(newMetaData, null, 2));
                                  return { ...prev, metaData: newMetaData };
                                });
                              }
                            }}
                            disabled={isView}
                            placeholder="Website của chúng tôi"
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Nút nhấn"
                            fullWidth
                            value={slide.btnText || ''}
                            onChange={(e) => {
                              const newSlidesArray = Array.isArray(form.metaData?.slides) ? [...form.metaData.slides] : [];
                              if (newSlidesArray[index]) {
                                newSlidesArray[index].btnText = e.target.value;
                                setForm(prev => {
                                  const newMetaData = { ...(prev.metaData || {}), _type: "banner", slides: newSlidesArray };
                                  setJsonContent(JSON.stringify(newMetaData, null, 2));
                                  return { ...prev, metaData: newMetaData };
                                });
                              }
                            }}
                            disabled={isView}
                            placeholder="Khám phá ngay"
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            label="Đường dẫn"
                            fullWidth
                            value={slide.link || ''}
                            onChange={(e) => {
                              const newSlidesArray = Array.isArray(form.metaData?.slides) ? [...form.metaData.slides] : [];
                              if (newSlidesArray[index]) {
                                newSlidesArray[index].link = e.target.value;
                                setForm(prev => {
                                  const newMetaData = { ...(prev.metaData || {}), _type: "banner", slides: newSlidesArray };
                                  setJsonContent(JSON.stringify(newMetaData, null, 2));
                                  return { ...prev, metaData: newMetaData };
                                });
                              }
                            }}
                            disabled={isView}
                            placeholder="/collections"
                            sx={{ mb: 2 }}
                          />
                        </Box>
                      ))}
                      {!isView && (
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            const currentSlides = Array.isArray(form.metaData?.slides) ? form.metaData.slides : [];
                            const newSlide = { imgSrc: '', alt: '', subheading: '', heading: '', btnText: '', link: '' };
                            const newSlidesArray = [...currentSlides, newSlide];

                            setForm(prev => {
                              const newMetaData = {
                                ...(prev.metaData || {}),
                                _type: "banner",
                                slides: newSlidesArray
                              };
                              setJsonContent(JSON.stringify(newMetaData, null, 2));
                              return { ...prev, metaData: newMetaData };
                            });
                            // setCurrentBannerIndex(newSlidesArray.length - 1); // Not needed if using mediaTarget
                          }}
                          sx={{ mt: 1 }}
                        >
                          Thêm Banner
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                )}

                {activeTab === 1 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        <ContactSupportIcon sx={{ mr: 1 }} /> Thông tin liên hệ
                      </Typography>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 4,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          background: 'linear-gradient(to right bottom, #fafafa, #ffffff)'
                        }}
                      >
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                              Địa chỉ và Bản đồ
                            </Typography>
                            <TextField
                              label="Địa chỉ cửa hàng *"
                              fullWidth
                              value={form.metaData?.address || ''}
                              onChange={(e) => handleContactInfoChange('address', e.target.value)}
                              disabled={isView}
                              placeholder="Chung Cư An Sinh, Ngõ 44 Nguyễn Cơ Thạch, Cầu Diễn, Nam Từ Liêm, Hà Nội"
                              sx={{ mb: 2 }}
                            />
                            <TextField
                              label="Mã nhúng Google Maps *"
                              fullWidth
                              multiline
                              rows={3}
                              value={form.metaData?.mapIframeSrc || ''}
                              onChange={(e) => handleContactInfoChange('mapIframeSrc', e.target.value)}
                              disabled={isView}
                              placeholder="https://www.google.com/maps/embed?pb=!1m18!..."
                              helperText="Mã nhúng iframe lấy từ Google Maps"
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <CallIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                              Thông tin liên lạc
                            </Typography>
                            <TextField
                              label="Email *"
                              fullWidth
                              value={form.metaData?.email || ''}
                              onChange={(e) => handleContactInfoChange('email', e.target.value)}
                              disabled={isView}
                              placeholder="goldenkimquy@gmail.com"
                              sx={{ mb: 2 }}
                              InputProps={{
                                startAdornment: <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              }}
                            />
                            <TextField
                              label="Số điện thoại *"
                              fullWidth
                              value={form.metaData?.phone || ''}
                              onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                              disabled={isView}
                              placeholder="0948556333"
                              InputProps={{
                                startAdornment: <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 4,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          background: 'linear-gradient(to right bottom, #fafafa, #ffffff)'
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          Giờ làm việc
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Ngày trong tuần"
                              fullWidth
                              value={form.metaData?.openTime?.weekdays?.days || 'Thứ 2 - Thứ 7'}
                              onChange={(e) => handleNestedContactInfoChange(['openTime', 'weekdays', 'days'], e.target.value)}
                              disabled={isView}
                              placeholder="Thứ 2 - Thứ 7"
                              sx={{ mb: 2 }}
                            />
                            <TextField
                              label="Giờ làm việc trong tuần"
                              fullWidth
                              value={form.metaData?.openTime?.weekdays?.hours || '8:00 - 20:00'}
                              onChange={(e) => handleNestedContactInfoChange(['openTime', 'weekdays', 'hours'], e.target.value)}
                              disabled={isView}
                              placeholder="8:00 - 20:00"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Ngày cuối tuần"
                              fullWidth
                              value={form.metaData?.openTime?.weekend?.days || 'Chủ nhật'}
                              onChange={(e) => handleNestedContactInfoChange(['openTime', 'weekend', 'days'], e.target.value)}
                              disabled={isView}
                              placeholder="Chủ nhật"
                              sx={{ mb: 2 }}
                            />
                            <TextField
                              label="Giờ làm việc cuối tuần"
                              fullWidth
                              value={form.metaData?.openTime?.weekend?.hours || '9:00 - 17:00'}
                              onChange={(e) => handleNestedContactInfoChange(['openTime', 'weekend', 'hours'], e.target.value)}
                              disabled={isView}
                              placeholder="9:00 - 17:00"
                            />
                          </Grid>

                          {form.metaData?.mapIframeSrc && !isView && (
                            <Grid item xs={12}>
                              <Alert severity="info" sx={{ mt: 1 }}>
                                <AlertTitle>Xem trước bản đồ</AlertTitle>
                                <Box sx={{ mt: 1, height: '200px', border: '1px solid #eee' }}>
                                  <iframe 
                                    src={form.metaData.mapIframeSrc} 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                  ></iframe>
                                </Box>
                              </Alert>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          background: 'linear-gradient(to right bottom, #fafafa, #ffffff)'
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                          <ShareIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          Mạng xã hội
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Facebook"
                              fullWidth
                              value={form.metaData?.socialMedia?.facebook || ''}
                              onChange={(e) => handleNestedContactInfoChange(['socialMedia', 'facebook'], e.target.value)}
                              disabled={isView}
                              placeholder="https://facebook.com/quatangkimquy"
                              sx={{ mb: 2 }}
                              InputProps={{
                                startAdornment: <FacebookIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              }}
                            />
                            <TextField
                              label="Instagram"
                              fullWidth
                              value={form.metaData?.socialMedia?.instagram || ''}
                              onChange={(e) => handleNestedContactInfoChange(['socialMedia', 'instagram'], e.target.value)}
                              disabled={isView}
                              placeholder="https://instagram.com/quatangkimquy"
                              InputProps={{
                                startAdornment: <InstagramIcon fontSize="small" sx={{ mr: 1, color: '#E1306C' }} />
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <TextField
                              label="YouTube"
                              fullWidth
                              value={form.metaData?.socialMedia?.youtube || ''}
                              onChange={(e) => handleNestedContactInfoChange(['socialMedia', 'youtube'], e.target.value)}
                              disabled={isView}
                              placeholder="https://youtube.com/c/quatangkimquy"
                              sx={{ mb: 2 }}
                              InputProps={{
                                startAdornment: <YouTubeIcon fontSize="small" sx={{ mr: 1, color: '#FF0000' }} />
                              }}
                            />
                            
                            {/* Thêm trường Zalo vào đây */}
                            <TextField
                              label="Zalo"
                              fullWidth
                              value={form.metaData?.socialMedia?.zalo || ''}
                              onChange={(e) => handleNestedContactInfoChange(['socialMedia', 'zalo'], e.target.value)}
                              disabled={isView}
                              placeholder="https://zalo.me/0948556333"
                              InputProps={{
                                startAdornment: (
                                  <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                    <img src={zaloIcon} alt="Zalo" style={{ width: 20, height: 20 }} />
                                  </Box>
                                )
                              }}
                            />
                          </Grid>
                        </Grid>

                        {!isView && (
                          <Alert severity="info" sx={{ mt: 2, borderRadius: 1 }}>
                            <AlertTitle>Mẹo</AlertTitle>
                            Nhập đường dẫn đầy đủ bao gồm https:// để liên kết hoạt động chính xác trên website
                          </Alert>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 2 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Cấu hình FAQs
                      </Typography>
                      {(form.metaData?.categories as FaqCategory[] || []).map((category, catIndex) => (
                        <Paper
                          key={category.id || catIndex}
                          elevation={1}
                          sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton 
                                size="small" 
                                onClick={() => toggleCategoryExpand(catIndex)}
                                sx={{ mr: 1 }}
                              >
                                {expandedCategories[catIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                              <Typography variant="h6">
                                Danh mục #{catIndex + 1}: {category.title || 'Chưa có tiêu đề'}
                              </Typography>
                            </Box>
                            
                            {!isView && (
                              <Button variant="outlined" color="error" size="small" onClick={() => handleRemoveFaqCategory(catIndex)}>
                                Xóa danh mục
                              </Button>
                            )}
                          </Stack>
                          
                          <Collapse in={expandedCategories[catIndex] !== false}>
                            <TextField
                              label="Category ID" 
                              fullWidth 
                              sx={{ mb: 1 }} 
                              disabled={isView}
                              value={category.id} 
                              onChange={(e) => handleFaqCategoryChange(catIndex, 'id', e.target.value)}
                            />
                            <TextField
                              label="Tiêu đề danh mục" 
                              fullWidth 
                              sx={{ mb: 2 }} 
                              disabled={isView}
                              value={category.title} 
                              onChange={(e) => handleFaqCategoryChange(catIndex, 'title', e.target.value)}
                            />

                            {/* Danh sách các câu hỏi */}
                            {category.items.map((item, itemIndex) => (
                              <Box 
                                key={item.id || itemIndex} 
                                sx={{ 
                                  pl: 2, 
                                  borderLeft: '3px solid #f0f0f0', 
                                  mb: 2, 
                                  pt: 1, 
                                  pb: 1,
                                  backgroundColor: '#fafafa',
                                  borderRadius: '4px'
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => toggleItemExpand(catIndex, itemIndex)}
                                      sx={{ mr: 1 }}
                                    >
                                      {expandedItems[`${catIndex}-${itemIndex}`] !== false ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                    <Typography variant="subtitle2">
                                      Câu hỏi #{itemIndex + 1}: {item.question.substring(0, 30)}{item.question.length > 30 ? '...' : ''}
                                    </Typography>
                                  </Box>
                                  {!isView && (
                                    <Button 
                                      variant="outlined" 
                                      color="error" 
                                      size="small" 
                                      onClick={() => handleRemoveFaqItem(catIndex, itemIndex)}
                                    >
                                      Xóa
                                    </Button>
                                  )}
                                </Stack>
                                
                                <Collapse in={expandedItems[`${catIndex}-${itemIndex}`] !== false}>
                                  <TextField
                                    label="Mã câu hỏi" 
                                    fullWidth 
                                    sx={{ mb: 1 }} 
                                    disabled={isView}
                                    value={item.id} 
                                    onChange={(e) => handleFaqItemChange(catIndex, itemIndex, 'id', e.target.value)}
                                  />
                                  <TextField
                                    label="Câu hỏi" 
                                    fullWidth 
                                    sx={{ mb: 1 }} 
                                    disabled={isView}
                                    value={item.question} 
                                    onChange={(e) => handleFaqItemChange(catIndex, itemIndex, 'question', e.target.value)}
                                  />
                                  <TextField
                                    label="Câu trả lời" 
                                    fullWidth 
                                    multiline 
                                    rows={3} 
                                    sx={{ mb: 1 }} 
                                    disabled={isView}
                                    value={item.answer} 
                                    onChange={(e) => handleFaqItemChange(catIndex, itemIndex, 'answer', e.target.value)}
                                  />
                                  <FormControl fullWidth sx={{ mb: 1 }}>
                                    <InputLabel id={`isopen-label-${catIndex}-${itemIndex}`}>Được mở sẵn</InputLabel>
                                    <Select
                                      labelId={`isopen-label-${catIndex}-${itemIndex}`}
                                      value={item.isOpen || 'false'}
                                      label="isOpen"
                                      disabled={isView}
                                      onChange={(e) => handleFaqItemChange(catIndex, itemIndex, 'isOpen', e.target.value)}
                                    >
                                      <MenuItem value="true">Có</MenuItem>
                                      <MenuItem value="false">Không</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Collapse>
                              </Box>
                            ))}
                            
                            {!isView && (
                              <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<AddIcon />} 
                                onClick={() => handleAddFaqItem(catIndex)}
                              >
                                Thêm câu hỏi
                              </Button>
                            )}
                          </Collapse>
                        </Paper>
                      ))}
                      
                      {!isView && (
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />} 
                          onClick={handleAddFaqCategory} 
                          sx={{ mt: 1 }}
                        >
                          Thêm danh mục câu hỏi
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                )}

                {activeTab === 3 && ( // Store Tab
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Cấu hình Cửa hàng
                      </Typography>
                      <TextField
                        label="Map Iframe Src" fullWidth sx={{ mb: 2 }} disabled={isView}
                        value={form.metaData?.mapIframeSrc || ''}
                        onChange={(e) => handleStoreDataChange('mapIframeSrc', e.target.value)}
                        multiline rows={3}
                      />

                      {(form.metaData?.stores as StoreInfo[] || []).map((store, storeIndex) => (
                        <Box key={store.id || storeIndex} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="h6">Cửa hàng #{storeIndex + 1}</Typography>
                            {!isView && (
                              <Button variant="outlined" color="error" size="small" onClick={() => handleRemoveStore(storeIndex)}>
                                Xóa Cửa hàng
                              </Button>
                            )}
                          </Stack>
                          <TextField label="ID Cửa hàng" fullWidth sx={{ mb: 1 }} disabled={isView} value={store.id} onChange={(e) => handleStoreDataChange('id', e.target.value, storeIndex)} />
                          <TextField label="Tên Cửa hàng" fullWidth sx={{ mb: 1 }} disabled={isView} value={store.name} onChange={(e) => handleStoreDataChange('name', e.target.value, storeIndex)} />
                          <TextField label="Email" fullWidth sx={{ mb: 1 }} disabled={isView} value={store.email} onChange={(e) => handleStoreDataChange('email', e.target.value, storeIndex)} />
                          <TextField label="Số điện thoại" fullWidth sx={{ mb: 1 }} disabled={isView} value={store.phone} onChange={(e) => handleStoreDataChange('phone', e.target.value, storeIndex)} />
                          <TextField label="Địa chỉ" fullWidth sx={{ mb: 1 }} disabled={isView} value={store.address} onChange={(e) => handleStoreDataChange('address', e.target.value, storeIndex)} />

                          <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Grid item xs={12} md={8}>
                              <TextField label="URL Hình ảnh Cửa hàng" fullWidth disabled={isView} value={store.image} onChange={(e) => handleStoreDataChange('image', e.target.value, storeIndex)} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  setMediaTarget({ type: 'store', index: storeIndex, field: 'image' });
                                  setMediaPopupOpen(true);
                                }}
                                disabled={isView}
                                fullWidth
                              >
                                Chọn ảnh
                              </Button>
                            </Grid>
                          </Grid>
                          {store.image && (
                            <Box sx={{ mt: 1, mb: 2, textAlign: 'center', border: '1px dashed #ccc', p: 1, borderRadius: '4px' }}>
                              <img
                                src={store.image.startsWith('http') ? store.image : `${process.env.NEXT_PUBLIC_API_URL || ''}${store.image}`}
                                alt="Store preview"
                                style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/image-placeholder.png'; }}
                              />
                            </Box>
                          )}

                          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Giờ mở cửa</Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6} sm={3}>
                              <TextField label="Weekdays Start" fullWidth size="small" disabled={isView} value={store.openTimes.weekdays.start} onChange={(e) => handleNestedStoreChange(storeIndex, ['openTimes', 'weekdays', 'start'], e.target.value)} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField label="Weekdays End" fullWidth size="small" disabled={isView} value={store.openTimes.weekdays.end} onChange={(e) => handleNestedStoreChange(storeIndex, ['openTimes', 'weekdays', 'end'], e.target.value)} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField label="Weekend Start" fullWidth size="small" disabled={isView} value={store.openTimes.weekend.start} onChange={(e) => handleNestedStoreChange(storeIndex, ['openTimes', 'weekend', 'start'], e.target.value)} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField label="Weekend End" fullWidth size="small" disabled={isView} value={store.openTimes.weekend.end} onChange={(e) => handleNestedStoreChange(storeIndex, ['openTimes', 'weekend', 'end'], e.target.value)} />
                            </Grid>
                          </Grid>

                          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Mạng xã hội</Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={4}>
                              <TextField label="Facebook URL" fullWidth size="small" disabled={isView} value={store.socialMedia.facebook || ''} onChange={(e) => handleNestedStoreChange(storeIndex, ['socialMedia', 'facebook'], e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField label="Instagram URL" fullWidth size="small" disabled={isView} value={store.socialMedia.instagram || ''} onChange={(e) => handleNestedStoreChange(storeIndex, ['socialMedia', 'instagram'], e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField label="Youtube URL" fullWidth size="small" disabled={isView} value={store.socialMedia.youtube || ''} onChange={(e) => handleNestedStoreChange(storeIndex, ['socialMedia', 'youtube'], e.target.value)} />
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                      {!isView && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStore} sx={{ mt: 1 }}>
                          Thêm Cửa hàng
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                )}

                {activeTab === 4 && ( // About Tab
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        <InfoIcon sx={{ mr: 1 }} /> Thông tin Giới thiệu
                      </Typography>

                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3, 
                          mb: 4, 
                          borderRadius: 2, 
                          border: '1px solid #e0e0e0',
                          background: 'linear-gradient(to right bottom, #fafafa, #ffffff)' 
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                          Thông tin chung
                        </Typography>
                        
                        <TextField
                          label="Tiêu đề trang"
                          fullWidth
                          value={form.metaData?.title || ''}
                          onChange={(e) => handleAboutChange('title', e.target.value)}
                          disabled={isView}
                          placeholder="Quà tặng Kim Quy – Quà tặng cao cấp, trang trọng và ý nghĩa"
                          sx={{ mb: 3 }}
                        />
                        
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Hình ảnh trang giới thiệu
                        </Typography>
                        
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={8}>
                            <TextField
                              label="Đường dẫn hình ảnh"
                              fullWidth
                              value={form.metaData?.image?.src}
                              onChange={(e) => handleImageChange('src', e.target.value)}
                              disabled={isView}
                              placeholder="/images/image-placeholder.png"
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => {
                                setMediaTarget({ type: 'about', index: 0, field: 'image' });
                                setMediaPopupOpen(true);
                              }}
                              disabled={isView}
                              fullWidth
                              sx={{ mb: 2 }}
                            >
                              Chọn hình ảnh
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3, 
                          borderRadius: 2, 
                          border: '1px solid #e0e0e0',
                          background: 'linear-gradient(to right bottom, #fafafa, #ffffff)' 
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                          <TabIcon sx={{ mr: 1 }} /> Nội dung các tab
                        </Typography>
                        
                        {(form.metaData?.tabs || []).map((tab : any , tabIndex : number) => (
                          <Box
                            key={tabIndex}
                            sx={{ 
                              p: 2, 
                              mb: 3, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 1,
                              position: 'relative',
                              backgroundColor: '#f9f9f9'
                            }}
                          >
                            <Typography variant="subtitle2" gutterBottom>
                              Tab #{tabIndex + 1}
                            </Typography>
                            
                            {form.metaData?.tabs && form.metaData.tabs.length > 1 && !isView && (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={() => handleRemoveAboutTab(tabIndex)}
                              >
                                Xóa Tab
                              </Button>
                            )}
                            
                            <TextField
                              label="Tên tab"
                              fullWidth
                              value={tab.name || ''}
                              onChange={(e) => handleTabContentChange(tabIndex, 'name', e.target.value)}
                              disabled={isView}
                              placeholder="Tên tab"
                              sx={{ mb: 2 }}
                            />
                            
                            <TextField
                              label="Nội dung"
                              fullWidth
                              multiline
                              rows={6}
                              value={tab.content || ''}
                              onChange={(e) => handleTabContentChange(tabIndex, 'content', e.target.value)}
                              disabled={isView}
                              placeholder="Nội dung tab..."
                              helperText={`${tab.content?.length || 0} ký tự`}
                            />
                          </Box>
                        ))}
                        
                        {!isView && (
                          <Button 
                            variant="outlined" 
                            startIcon={<AddIcon />} 
                            onClick={handleAddAboutTab}
                            sx={{ mt: 1 }}
                          >
                            Thêm Tab mới
                          </Button>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 5 && ( // JSON Editor Tab
                  <Box>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                      <Button size="small" variant="outlined" onClick={formatJson} disabled={isView}>
                        Format JSON
                      </Button>
                    </Stack>
                    <TextField
                      label="JSON Data"
                      fullWidth
                      multiline
                      rows={12}
                      value={jsonContent}
                      onChange={handleJsonChange}
                      disabled={isView}
                      error={!!jsonError}
                      helperText={jsonError || 'Nhập JSON data hợp lệ'}
                      sx={{
                        mb: 2,
                        fontFamily: 'monospace',
                        '& .MuiInputBase-input': {
                          fontFamily: 'monospace'
                        }
                      }}
                    />
                  </Box>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Xem trước JSON:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(form.metaData, null, 2)}
                  </Box>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Button variant="outlined" color="secondary" onClick={onCancel}>
                    {isView ? 'Quay lại' : 'Hủy'}
                  </Button>

                  {!isView && (
                    <Button type="submit" variant="contained" color="primary" disabled={!!jsonError}>
                      {isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <MediaPopup
        open={mediaPopupOpen}
        onClose={() => setMediaPopupOpen(false)}
        onSelect={handleMediaSelect}
        onSubmit={() => { }}
        listMedia={[]}
      />
    </form>
  );
};

export default MetaJsonForm;