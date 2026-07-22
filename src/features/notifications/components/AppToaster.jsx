import { CheckCircle2, Info, Loader2, TriangleAlert, XCircle } from "lucide-react"

import { Toaster } from "@/components/ui/sonner"

function AppToaster() {
  return (
    <Toaster
      closeButton={false}
      position="top-right"
      offset={24}
      icons={{
        success: <CheckCircle2 className="size-5 text-success" />,
        error: <XCircle className="size-5 text-destructive" />,
        warning: <TriangleAlert className="size-5 text-warning" />,
        info: <Info className="size-5 text-primary" />,
        loading: <Loader2 className="size-5 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "woodspec-toast group relative flex min-h-[72px] w-[min(360px,calc(100vw-32px))] items-start gap-3 overflow-hidden rounded-lg border border-border bg-card px-4 py-3 text-foreground shadow-gallery-lg",
          title: "!text-sm !font-semibold !leading-5 !text-foreground",
          description: "!mt-0.5 !text-xs !leading-5 !text-muted-foreground",
          icon: "!mt-0.5",
        },
      }}
    />
  )
}

export default AppToaster
