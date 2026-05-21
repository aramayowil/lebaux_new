import { addToast } from "@heroui/react";
import { CircleAlert } from "lucide-react";

type ToastError = {
  title: string;
  description: string;
};

export function toastError({ title, description }: ToastError) {
  addToast({
    icon: <CircleAlert className="w-6 h-6" />,
    title: `${title}`,
    description: `${description}`,
    color: "danger",
    variant: "flat",
  });
}
