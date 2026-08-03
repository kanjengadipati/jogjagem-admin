"use client";

import { useState } from "react";
import Script from "next/script";
import { Loader2, CreditCard, X, Mail } from "lucide-react";
import { useToast } from "@/components/Toast";

const SNAP_JS_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

// ─── Modal untuk input email partner (Opsi A) ────────────────────────────────

interface InvoiceEmailModalProps {
  isOpen: boolean;
  itemName: string;
  customerName: string;
  defaultEmail?: string;
  onConfirm: (email: string) => void;
  onClose: () => void;
}

export function InvoiceEmailModal({
  isOpen,
  itemName,
  customerName,
  defaultEmail = "",
  onConfirm,
  onClose,
}: InvoiceEmailModalProps) {
  const [email, setEmail] = useState(defaultEmail);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display">Generate Invoice</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[220px]">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Partner <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`email@${customerName.toLowerCase().replace(/\s/g, "")}.com`}
                className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Email ini dipakai Midtrans untuk mengirim notifikasi pembayaran ke partner.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={() => {
                if (!email.trim() || !email.includes("@")) return;
                onConfirm(email.trim());
              }}
              disabled={!email.trim() || !email.includes("@")}
              className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 transition cursor-pointer"
            >
              Buat Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tombol utama Generate Invoice ───────────────────────────────────────────

interface SnapCheckoutButtonProps {
  subjectType: "ad_campaign" | "partner_sponsorship" | "subscription";
  subjectExternalId: string;
  amount: number;
  itemName: string;
  customerName: string;
  /** Kalau sudah tersedia (misal dari field owner_email), langsung dipakai tanpa modal */
  customerEmail?: string;
  /** Ganti endpoint invoice (subscription upgrade pakai proxy business sendiri) */
  apiEndpoint?: string;
  /** Label tombol (default "Generate Invoice") */
  label?: string;
  /** Tampilkan tombol full-width (untuk kartu paket upgrade) */
  fullWidth?: boolean;
  onPaid: () => void;
}

export function SnapCheckoutButton({
  subjectType,
  subjectExternalId,
  amount,
  itemName,
  customerName,
  customerEmail,
  apiEndpoint = "/api/payments",
  label = "Generate Invoice",
  fullWidth = false,
  onPaid,
}: SnapCheckoutButtonProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  async function generateInvoice(email: string) {
    setModalOpen(false);
    setLoading(true);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_type: subjectType,
          subject_external_id: subjectExternalId,
          amount,
          item_name: itemName,
          customer_name: customerName,
          customer_email: email,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.snap_token) {
        showToast("Error", json?.message || "Gagal membuat invoice", "error");
        return;
      }
      if (!window.snap) {
        showToast("Error", "Snap.js belum termuat, tunggu sebentar lalu coba lagi", "error");
        return;
      }
      window.snap.pay(json.data.snap_token, {
        onSuccess: () => {
          onPaid();
          showToast("Pembayaran berhasil", "Status akan diperbarui setelah webhook dikonfirmasi", "success");
        },
        onPending: () =>
          showToast("Menunggu", "Pembayaran tertunda — status akan update otomatis", "info"),
        onError: () => showToast("Gagal", "Pembayaran tidak berhasil diproses", "error"),
        onClose: () =>
          showToast("Dibatalkan", "Checkout ditutup tanpa pembayaran", "warning"),
      });
    } catch {
      showToast("Error", "Terjadi kesalahan saat membuat invoice", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (customerEmail) {
      // Email sudah tersedia (misal dari owner_email backend) — langsung proses
      void generateInvoice(customerEmail);
    } else {
      // Tampilkan modal input email (Opsi A)
      setModalOpen(true);
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* Checkbox Persetujuan */}
      <label className="flex items-start gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mt-0.5 rounded border-stone-300 text-[#B8912A] focus:ring-[#B8912A]"
        />
        <span className="text-[10px] text-stone-500 leading-tight">
          Saya setuju dengan{" "}
          <a href="/syarat-ketentuan" target="_blank" className="text-[#B8912A] hover:underline">
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a href="/kebijakan-privasi" target="_blank" className="text-[#B8912A] hover:underline">
            Kebijakan Privasi
          </a>{" "}
          Jogjagem.
        </span>
      </label>

      {/* Snap.js dimuat sekali — strategy afterInteractive agar tidak block render */}
      <Script
        src={SNAP_JS_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <InvoiceEmailModal
        isOpen={modalOpen}
        itemName={itemName}
        customerName={customerName}
        onConfirm={(email) => void generateInvoice(email)}
        onClose={() => setModalOpen(false)}
      />

      <button
        onClick={handleClick}
        disabled={loading || !agreeTerms}
        className={
          fullWidth
            ? "inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            : "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
        }
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CreditCard className="w-3.5 h-3.5" />
        )}
        {label}
      </button>
    </div>
  );
}
