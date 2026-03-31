import { CircleX } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ErrorBox({ children }: Props) {
  return (
    <div className="flex gap-2 rounded-lg mt-6 bg-red-400 border-red-800 border-2 p-4">
      <CircleX className="text-red-900" /> {children}
    </div>
  );
}
