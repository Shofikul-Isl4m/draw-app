import { Input } from "@repo/ui/components/ui/input";

const FormInput = ({
  id,
  name,
  type,
  placeholder,
  required,
}: {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) => {
  return (
    <Input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="focus-visible:border-green-600/20 focus-visible:ring-green-600/10"
    />
  );
};

export default FormInput;
