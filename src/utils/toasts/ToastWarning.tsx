import { addToast } from "@heroui/react";
import { TriangleAlert } from "lucide-react";

type ToastWarning = {
  title: string;
  description: string;
};

export function toastWarning({ title, description }: ToastWarning) {
  addToast({
    icon: <TriangleAlert className="w-6 h-6" />,
    title: `${title}`,
    description: `${description}`,
    color: "warning",
    variant: "flat",
  });
}
