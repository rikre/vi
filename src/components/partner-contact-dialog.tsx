"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";

const PARTNER_QR_SRC =
  process.env.NEXT_PUBLIC_PARTNER_WECHAT_QR_URL ?? "/images/partner-wechat-group-qr.png";

export function PartnerContactDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return <PartnerContactDialogContent key={open ? "open" : "closed"} open={open} onClose={onClose} />;
}

function PartnerContactDialogContent({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [qrAvailable, setQrAvailable] = useState(true);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="联系超创合伙人"
      className="w-[min(420px,calc(100vw-2rem))] bg-[#141414] p-6 sm:p-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white">微信扫码进群联系</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          扫码添加合作顾问，获取入群资格与合作资料
        </p>

        <div className="mx-auto mt-6 flex size-[220px] items-center justify-center rounded-2xl bg-white p-3 ring-1 ring-white/[0.12]">
          {qrAvailable ? (
            <Image
              src={PARTNER_QR_SRC}
              alt="超创合伙人微信群二维码"
              width={196}
              height={196}
              unoptimized
              onError={() => setQrAvailable(false)}
            />
          ) : (
            <div
              role="status"
              className="flex size-full flex-col items-center justify-center rounded-xl border border-dashed border-[#141414]/20 px-5 text-center text-[#141414]/65"
            >
              <span className="text-sm font-semibold">二维码资源未配置</span>
              <span className="mt-2 text-xs leading-5">
                请上传微信群二维码后即可扫码进群
              </span>
            </div>
          )}
        </div>

        <p className="mt-5 text-xs leading-5 text-white/45">
          请使用微信扫一扫，进群后备注“超创合伙人”
        </p>
      </div>
    </Modal>
  );
}
