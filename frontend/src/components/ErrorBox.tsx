import { CircleX } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ErrorBox({ children }: Props) {
  return (
    <div className="flex gap-2 rounded-lg mt-6 border border-destructive/40 bg-destructive/10 text-destructive p-4">
      <CircleX className="shrink-0" /> {children}
    </div>
  );
}
