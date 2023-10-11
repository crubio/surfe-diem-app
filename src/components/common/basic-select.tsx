/* eslint-disable */
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useState } from "react";

interface BasicSelectProps {
  items: any[]
  label?: string
  doOnSelect: (thing: any) => void
}

export default function BasicSelect(props: BasicSelectProps) {
  const label = props.label || "select"
  const [value, setValue] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
    props.doOnSelect(event.target.value as string)
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          label={label}
          onChange={handleChange}
        >
          {props.items && props.items.map((item: any) => {
            return (
              <MenuItem key={item.id} value={item.location_id}>{item.name}</MenuItem>
            )
          })}
        </Select>
      </FormControl>
    </Box>
  );
}