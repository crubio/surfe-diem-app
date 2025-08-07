import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useState } from "react";

interface BasicSelectProps {
  items: any[]
  selectValueKey: string | number // object key to get a value from
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

  const subRegionInfo = (name: string) => {
    if (name) {
      return (<Typography variant="subtitle1" >&nbsp;{`- ${name}`}</Typography>)
    }
  }

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
              <MenuItem key={item.id} value={item[props.selectValueKey]}>{item.name}{subRegionInfo(item.subregion_name)}</MenuItem>
            )
          })}
        </Select>
      </FormControl>
    </Box>
  );
}