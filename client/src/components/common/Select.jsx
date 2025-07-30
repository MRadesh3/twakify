import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 350,
      backgroundColor: "#2b3942",
      color: "#ffffff",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
  },
};

export default function BasicSelect({
  label = false,
  labelName,
  formik,
  fieldName,
}) {
  const theme = useTheme();

  const handleChange = (event) => {
    formik.setFieldValue(fieldName, event.target.value);
    // formik.setFieldTouched(fieldName, true);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={fieldName} className="text-teal-light text-lg px-1">
          {labelName}
        </label>
      )}
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth variant="outlined">
          {!formik.values[fieldName] && (
            <InputLabel
              id={`${fieldName}-label`}
              sx={{
                color: "white",
                fontSize: "14px",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                "&.Mui-focused": { color: "#18a346" },
              }}
              shrink={false}
            >
              Group Type
            </InputLabel>
          )}
          <Select
            labelId={`${fieldName}-label`}
            id={fieldName}
            value={formik.values[fieldName] || ""}
            onChange={handleChange}
            sx={{
              backgroundColor: "#2b3942",
              padding: "0",
              color: "white",
              borderRadius: "8px",
              fontSize: "16px",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              padding: "0", // Removes any default padding
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#146a2b",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#146a2b",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#146a2b !important",
              },
            }}
            MenuProps={MenuProps}
          >
            <MenuItem
              value="PUBLIC"
              sx={{
                backgroundColor: "#2b3942",
                color: "white",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                padding: "8px 16px", // Adjust padding for the individual MenuItem
                "&.Mui-selected": {
                  backgroundColor: "#18a346 !important", // Green for selected item
                },
                "&:hover": {
                  backgroundColor: "#146a2b !important", // Green on hover
                },
                "&.Mui-focusVisible": {
                  backgroundColor: "#146a2b !important", // Green for focused state
                },
              }}
            >
              Public
            </MenuItem>
            <MenuItem
              value="PRIVATE"
              sx={{
                backgroundColor: "#2b3942",
                color: "white",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                padding: "8px 16px", // Adjust padding for the individual MenuItem
                "&.Mui-selected": {
                  backgroundColor: "#18a346 !important", // Green for selected item
                },
                "&:hover": {
                  backgroundColor: "#146a2b !important", // Green on hover
                },
                "&.Mui-focusVisible": {
                  backgroundColor: "#146a2b !important", // Green for focused state
                },
              }}
            >
              Private
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      {formik.touched[fieldName] && formik.errors[fieldName] && (
        <p className="text-red-500 text-sm mt-1">{formik.errors[fieldName]}</p>
      )}
    </div>
  );
}
