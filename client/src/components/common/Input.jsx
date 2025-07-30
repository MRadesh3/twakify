import React from "react";

function Input({
  name,
  formik,
  label = false,
  labelName,
  type = "text",
  isTextarea = false,
  rows,
}) {
  return (
    <div className="flex gap-1 flex-col">
      {label && (
        <label htmlFor={name} className="text-teal-light text-lg px-1">
          {labelName}
        </label>
      )}
      <div>
        {isTextarea ? (
          <textarea
            name={name}
            value={formik.values[name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={rows}
            className={`custom-scrollbar bg-input-background text-sm focus:outline-none text-white rounded-lg px-5 py-4 w-full h-32 resize-none ${
              formik.touched[name] && formik.errors[name]
                ? "border border-red-500"
                : ""
            }`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formik.values[name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full ${
              formik.touched[name] && formik.errors[name]
                ? "border border-red-500"
                : ""
            }`}
          />
        )}
        {formik.touched[name] && formik.errors[name] && (
          <p className="text-red-500 text-sm mt-1">{formik.errors[name]}</p>
        )}
      </div>
    </div>
  );
}

export default Input;
