import React from 'react';
import {
  Box, 
  Typography, 
  Button, 
  TextField, 
  IconButton, 
  Paper, 
  Grid, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Pricing } from '@/data/VisaService';

interface PricingFormProps {
  initialData: Pricing[];
  onChange: (data: Pricing[]) => void;
}

const PricingForm: React.FC<PricingFormProps> = ({ initialData: pricing, onChange }) => {

  const handleAddPackage = () => {
    const newPricing = [
      ...(pricing || []),
      {
        type: `new-package-${Date.now()}`,
        name: '',
        description: '',
        validity: '',
        stayDuration: '',
        processingTime: '',
        prices: [{
          adult: '',
          child_6_12: '',
          child_under_6: '',
          consularFee: '',
          serviceFee: '',
          note: '',
        }],
      },
    ];
    onChange(newPricing);
  };

  const handleDeletePackage = (index: number) => {
    const newPricing = (pricing || []).filter((_, i) => i !== index);
    onChange(newPricing);
  };

  const handlePackageChange = (index: number, field: keyof Pricing, value: any) => {
    const newPricing = (pricing || []).map((pkg, i) => i === index ? { ...pkg, [field]: value } : pkg);
    onChange(newPricing);
  };

  const handlePriceChange = (pkgIndex: number, priceIndex: number, field: string, value: string) => {
    const newPricing = [...(pricing || [])];
    if (newPricing[pkgIndex] && newPricing[pkgIndex].prices[priceIndex]) {
      (newPricing[pkgIndex].prices[priceIndex] as any)[field] = value;
      onChange(newPricing);
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Bảng giá</Typography>
      {(pricing || []).map((pkg, pkgIndex) => (
        <Accordion key={pkg.type || pkgIndex} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
             <TextField
                label="Tên Gói"
                value={pkg.name}
                onChange={(e) => handlePackageChange(pkgIndex, 'name', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                variant="standard"
                sx={{ flexGrow: 1, mr: 2 }}
              />
            <IconButton onClick={(e) => { e.stopPropagation(); handleDeletePackage(pkgIndex); }}><DeleteIcon /></IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField label="Mô tả gói" value={pkg.description} onChange={(e) => handlePackageChange(pkgIndex, 'description', e.target.value)} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Thời gian xử lý" value={pkg.processingTime} onChange={(e) => handlePackageChange(pkgIndex, 'processingTime', e.target.value)} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Hiệu lực Visa" value={pkg.validity} onChange={(e) => handlePackageChange(pkgIndex, 'validity', e.target.value)} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Thời gian lưu trú" value={pkg.stayDuration} onChange={(e) => handlePackageChange(pkgIndex, 'stayDuration', e.target.value)} fullWidth /></Grid>
                
                {/* Assuming one price detail per package for simplicity */}
                {pkg.prices.map((price, priceIndex) => (
                    <React.Fragment key={priceIndex}>
                        <Grid item xs={12}><Typography variant="subtitle2" sx={{mt: 2}}>Chi tiết giá</Typography></Grid>
                        <Grid item xs={6} sm={4}><TextField label="Giá người lớn" value={price.adult} onChange={(e) => handlePriceChange(pkgIndex, priceIndex, 'adult', e.target.value)} fullWidth /></Grid>
                        <Grid item xs={6} sm={4}><TextField label="Trẻ em (6-12)" value={price.child_6_12} onChange={(e) => handlePriceChange(pkgIndex, priceIndex, 'child_6_12', e.target.value)} fullWidth /></Grid>
                        <Grid item xs={6} sm={4}><TextField label="Trẻ em (dưới 6)" value={price.child_under_6} onChange={(e) => handlePriceChange(pkgIndex, priceIndex, 'child_under_6', e.target.value)} fullWidth /></Grid>
                        <Grid item xs={6} sm={4}><TextField label="Phí lãnh sự" value={price.consularFee} onChange={(e) => handlePriceChange(pkgIndex, priceIndex, 'consularFee', e.target.value)} fullWidth /></Grid>
                        <Grid item xs={6} sm={4}><TextField label="Phí dịch vụ" value={price.serviceFee} onChange={(e) => handlePriceChange(pkgIndex, priceIndex, 'serviceFee', e.target.value)} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label="Ghi chú giá" value={price.note} onChange={(e) => handlePriceChange(pkgIndex, priceIndex, 'note', e.target.value)} fullWidth /></Grid>
                    </React.Fragment>
                ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      <Button startIcon={<AddIcon />} onClick={handleAddPackage}>Thêm Gói Giá</Button>
    </Paper>
  );
};

export default PricingForm;
