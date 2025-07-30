import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { IoIosCloseCircle } from "react-icons/io";

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

export default function MultipleSelectChip({
  label = false,
  labelName,
  contacts,
  formik,
  fieldName,
}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleChange = (event) => {
    const { value } = event.target;
    const selectedIds = value.map((selectedName) => {
      const contact = contacts.find((c) => c.name === selectedName);
      return contact?.id;
    });

    formik.setFieldValue(fieldName, selectedIds);
    // formik.setFieldTouched(fieldName, true);
  };

  const handleClearAll = (event) => {
    event.stopPropagation();
    event.preventDefault();
    formik.setFieldValue(fieldName, []);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor="demo-multiple-chip"
          className="text-teal-light text-lg px-1"
        >
          {labelName}
        </label>
      )}

      <FormControl sx={{ width: "100%" }} variant="outlined">
        {formik.values[fieldName]?.length === 0 && (
          <InputLabel
            id="demo-multiple-chip-label"
            sx={{
              color: "white",
              fontSize: "14px",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              "&.Mui-focused": { color: "#18a346" },
            }}
            shrink={formik.values[fieldName]?.length > 0 || open}
          >
            Search Contacts
          </InputLabel>
        )}

        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={formik.values[fieldName].map(
            (id) => contacts.find((c) => c.id === id)?.name
          )}
          onChange={handleChange}
          displayEmpty
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          input={
            <OutlinedInput
              id="select-multiple-chip"
              notched={false}
              sx={{
                backgroundColor: "#2b3942",
                color: "white",
                borderRadius: "8px",
                fontSize: "16px",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#18a346",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#18a346 !important",
                },
                display: "flex",
                alignItems: "center",
                paddingRight: "35px",
              }}
            />
          }
          renderValue={(selected) => (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                backgroundColor: "#2b3942",
                padding: "5px",
                borderRadius: "8px",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                alignItems: "center",
              }}
            >
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  sx={{
                    backgroundColor: "#18a346",
                    color: "white",
                    fontSize: "14px",
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  }}
                />
              ))}
              {selected.length > 0 && (
                <IoIosCloseCircle
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Clear All"
                  onClick={handleClearAll}
                  sx={{ marginLeft: "5px" }}
                />
              )}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {contacts.map((contact) => (
            <MenuItem
              key={contact.id}
              value={contact.name}
              sx={{
                backgroundColor: "#2b3942",
                color: "white",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                "&.Mui-selected": {
                  backgroundColor: "#18a346 !important",
                },
                "&:hover": {
                  backgroundColor: "#146a2b !important",
                },
              }}
            >
              {contact.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {formik.touched[fieldName] && formik.errors[fieldName] && (
        <p className="text-red-500 text-sm mt-1">{formik.errors[fieldName]}</p>
      )}
    </div>
  );
}
