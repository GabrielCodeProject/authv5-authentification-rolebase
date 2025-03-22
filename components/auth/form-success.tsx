import { BsCheckCircleFill } from "react-icons/bs";

interface FormSuccessProps {
  message?: string | null;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;
  return (
    <div className="flex space-x-4 items-center p-2 rounded-lg text-green-500 bg-green-500/30">
      <BsCheckCircleFill className="w-4 h-4" />
      <p>{message}</p>
    </div>
  );
};

export default FormSuccess;
