'use client'
import { useEffect } from "react";

function SelectInput({options}) {
    useEffect(() => {
      const init = async () => {
        try {
          // tw-elements v2.0.0 se inicializa automáticamente con data-te-select-init
          await import("tw-elements");
        } catch (error) {
          console.log('tw-elements initialization skipped');
        }
      };
      init();
    },[]);
  return (
    <div>
      <select
        data-te-select-init
        data-te-select-placeholder="Example placeholder"
        multiple
      >
        {options.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectInput