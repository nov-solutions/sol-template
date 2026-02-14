import { RiLoader4Line } from "@remixicon/react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type LoadingButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function LoadingButton({
  loading,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || props.disabled} {...props}>
      {loading ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}
