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
  AccordionDetails,
  Chip,
  Autocomplete
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { VisaType, WorkRequirement } from '@/data/VisaService';

interface VisaTypesFormProps {
  initialData: VisaType[];
  onChange: (data: VisaType[]) => void;
}

const VisaTypesForm: React.FC<VisaTypesFormProps> = ({ initialData: visaTypes, onChange }) => {

  const handleAddVisaType = () => {
    const newTypes = [
      ...(visaTypes || []),
      {
        id: `new-type-${Date.now()}`,
        name: '',
        requirements: {
          personal: [],
          work: [],
          financial: [],
          travel: [],
        },
      },
    ];
    onChange(newTypes);
  };

  const handleDeleteVisaType = (index: number) => {
    const newTypes = (visaTypes || []).filter((_, i) => i !== index);
    onChange(newTypes);
  };

  const handleTypeChange = (index: number, field: keyof VisaType, value: any) => {
    const newTypes = (visaTypes || []).map((type, i) => i === index ? { ...type, [field]: value } : type);
    onChange(newTypes);
  };

  const handleRequirementChange = (typeIndex: number, category: keyof VisaType['requirements'], value: string[]) => {
      const newTypes = [...(visaTypes || [])];
      if (newTypes[typeIndex]) {
        (newTypes[typeIndex].requirements as any)[category] = value;
        onChange(newTypes);
      }
  }

  const handleWorkRequirementChange = (typeIndex: number, workIndex: number, field: keyof WorkRequirement, value: any) => {
    const newTypes = [...(visaTypes || [])];
    if (newTypes[typeIndex] && newTypes[typeIndex].requirements.work[workIndex]) {
        (newTypes[typeIndex].requirements.work[workIndex] as any)[field] = value;
        onChange(newTypes);
    }
  };

  const handleAddWorkType = (typeIndex: number) => {
      const newTypes = [...(visaTypes || [])];
      if (newTypes[typeIndex]) {
        newTypes[typeIndex].requirements.work.push({ type: '', docs: [] });
        onChange(newTypes);
      }
  }

  const handleDeleteWorkType = (typeIndex: number, workIndex: number) => {
      const newTypes = [...(visaTypes || [])];
      if (newTypes[typeIndex]) {
        newTypes[typeIndex].requirements.work.splice(workIndex, 1);
        onChange(newTypes);
      }
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Các loại Visa</Typography>
      {(visaTypes || []).map((type, typeIndex) => (
        <Accordion key={type.id || typeIndex} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
             <TextField
                label="Tên loại Visa"
                value={type.name}
                onChange={(e) => handleTypeChange(typeIndex, 'name', e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent Accordion from toggling
                variant="standard"
                sx={{ flexGrow: 1, mr: 2 }}
              />
            <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteVisaType(typeIndex); }}><DeleteIcon /></IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
                {Object.keys(type.requirements).map((category) => {
                    if (category === 'work') {
                        return (
                            <Grid item xs={12} key={category}>
                                <Typography variant="subtitle1" sx={{mt: 2}}>Yêu cầu Công việc</Typography>
                                {type.requirements.work.map((work, workIndex) => (
                                     <Paper key={workIndex} sx={{ p: 2, my: 1, border: '1px solid #ddd'}}>
                                        <TextField 
                                            label="Đối tượng" 
                                            value={work.type} 
                                            onChange={(e) => handleWorkRequirementChange(typeIndex, workIndex, 'type', e.target.value)} 
                                            fullWidth 
                                            sx={{mb: 2}}
                                        />
                                        <Autocomplete
                                            multiple freeSolo options={[]} value={work.docs || []}
                                            onChange={(e, v) => handleWorkRequirementChange(typeIndex, workIndex, 'docs', v)}
                                            renderTags={(value, getTagProps) => value.map((option, i) => (<Chip key={`${option}-${i}`} label={option} {...getTagProps({ index: i })} />))}
                                            renderInput={(params) => <TextField {...params} label="Hồ sơ yêu cầu" placeholder="Thêm yêu cầu"/>}
                                        />
                                         <Button size="small" color="error" onClick={() => handleDeleteWorkType(typeIndex, workIndex)} sx={{mt: 1}}>Xóa đối tượng</Button>
                                     </Paper>
                                ))}
                                <Button startIcon={<AddIcon />} onClick={() => handleAddWorkType(typeIndex)} sx={{mt: 1}}>Thêm đối tượng</Button>
                            </Grid>
                        )
                    }
                    return (
                        <Grid item xs={12} md={6} key={category}>
                            <Autocomplete
                                multiple freeSolo options={[]}
                                value={(type.requirements as any)[category] || []}
                                onChange={(e, v) => handleRequirementChange(typeIndex, category as any, v)}
                                renderTags={(value, getTagProps) => value.map((option, i) => (<Chip key={`${option}-${i}`} label={option} {...getTagProps({ index: i })} />))}
                                renderInput={(params) => <TextField {...params} label={`Yêu cầu ${category.charAt(0).toUpperCase() + category.slice(1)}`} placeholder="Thêm yêu cầu"/>}
                            />
                        </Grid>
                    )
                })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      <Button startIcon={<AddIcon />} onClick={handleAddVisaType}>Thêm loại Visa</Button>
    </Paper>
  );
};

export default VisaTypesForm;
