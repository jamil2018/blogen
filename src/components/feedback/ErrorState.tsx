import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Alert } from "@heroui/react";
import { cn } from "../../lib/cn";

type ErrorStateProps = {
  message?: string;
  className?: string;
};

export default function ErrorState({
  message = "Error occurred while fetching data",
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("py-8", className)}>
      <Alert status="danger">
        <Alert.Indicator>
          <WarningCircle className="size-4" weight="fill" />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>Something went wrong</Alert.Title>
          <Alert.Description>{message}</Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
}
