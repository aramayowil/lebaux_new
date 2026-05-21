import { addToast } from "@heroui/react";

type ToastSuccess = {
  title: string;
  description: string;
};

export function toastSuccess({ title, description }: ToastSuccess) {
  addToast({
    title: `${title}`,
    description: `${description}`,
    color: "success",
    variant: "flat",
  });
}
