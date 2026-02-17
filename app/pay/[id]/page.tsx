"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, ShieldCheck, CreditCard, AlertCircle } from "lucide-react";

interface TransactionData {
    amount: number;
    orderInfo: string;
    returnUrl: string;
    status: string;
    createdAt: string;
}

export default function PaymentPage({ params }: { params: { id: string } }) {
    const [transaction, setTransaction] = useState<TransactionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [redirecting, setRedirecting] = useState(false);

    const transactionId = params.id;

    useEffect(() => {
        if (!transactionId) return;

        const unsubscribe = onSnapshot(
            doc(db, "transactions", transactionId),
            (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data() as TransactionData;
                    setTransaction(data);
                    setLoading(false);

                    // Auto-redirect on SUCCESS
                    if (data.status === "SUCCESS") {
                        setRedirecting(true);
                        setTimeout(() => {
                            window.location.href = data.returnUrl;
                        }, 2000);
                    }
                } else {
                    setError("Transaction not found");
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Snapshot error:", err);
                setError("Failed to load transaction");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [transactionId]);

    const qrContent = transaction
        ? JSON.stringify({
            type: "PAYMENT",
            trxId: transactionId,
            amount: transaction.amount,
        })
        : "";

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                    <p className="text-slate-300 text-lg">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
                    <p className="text-red-200">{error}</p>
                </div>
            </div>
        );
    }

    if (redirecting) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 flex items-center justify-center">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 max-w-md text-center">
                    <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-emerald-300 mb-2">
                        Payment Successful!
                    </h2>
                    <p className="text-emerald-200">Redirecting you back to merchant...</p>
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mt-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-4">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 text-sm font-medium">
                            Secure Payment
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        TransCredit
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">v0.1.0 — Payment Gateway</p>
                </div>

                {/* Payment Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Amount Section */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-slate-700/50 p-6 text-center">
                        <p className="text-slate-400 text-sm mb-1">Amount to Pay</p>
                        <p className="text-4xl font-bold text-white">
                            {formatCurrency(transaction!.amount)}
                        </p>
                    </div>

                    {/* Order Info */}
                    <div className="p-6 border-b border-slate-700/30">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">
                                    Order Info
                                </p>
                                <p className="text-white font-medium">
                                    {transaction!.orderInfo}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-8 flex flex-col items-center">
                        <p className="text-slate-400 text-sm mb-4">
                            Scan with HotWave Wallet to pay
                        </p>
                        <div className="bg-white rounded-2xl p-4 shadow-lg shadow-blue-500/10">
                            <QRCodeSVG
                                value={qrContent}
                                size={220}
                                bgColor="#ffffff"
                                fgColor="#0f172a"
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <p className="text-amber-300 text-sm">
                                Waiting for payment...
                            </p>
                        </div>
                    </div>

                    {/* Transaction ID */}
                    <div className="bg-slate-900/50 px-6 py-3 border-t border-slate-700/30">
                        <p className="text-xs text-slate-500 text-center font-mono truncate">
                            TRX: {transactionId}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    Protected by TransCredit Secure Payment Gateway
                </p>
            </div>
        </div>
    );
}
