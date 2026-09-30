"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function DialogDemo() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {t("styleguide.openDialog")}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("styleguide.dialogTitle")}
        description={t("styleguide.dialogBody")}
        closeLabel={t("common.close")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              {t("styleguide.dialogConfirm")}
            </Button>
          </>
        }
      />
    </>
  );
}
