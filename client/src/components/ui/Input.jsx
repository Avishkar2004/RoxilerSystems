import React from "react";

function Input({
  label,
  error,
  type = "text",
  className = "",
  labelClassName = "",
  ...rest
}) {
  return (
    <div className="mb-3">
      {label && (
        <label
          className={
            "block text-xs font-medium mb-1.5 " +
            (labelClassName || "text-slate-600")
          }
        >
          {label}
        </label>
      )}
      <input
        className={
          "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 " +
          className
        }
        type={type}
        {...rest}
      />
      {error && (
        <div className="mt-1 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

export default Input;

