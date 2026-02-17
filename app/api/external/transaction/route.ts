import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

const VALID_API_KEY = "TRANS_KEY_V1";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3001";

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

export async function POST(req: NextRequest) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
        const body = await req.json();
        const { amount, orderInfo, returnUrl, apiKey } = body;

        // Validate required fields
        if (!amount || !orderInfo || !returnUrl || !apiKey) {
            return NextResponse.json(
                { error: "Missing required fields: amount, orderInfo, returnUrl, apiKey" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Validate API key
        if (apiKey !== VALID_API_KEY) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401, headers: corsHeaders }
            );
        }

        // Validate amount
        if (typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { error: "Amount must be a positive number" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Create transaction document in Firestore
        const adminDb = getAdminDb();
        const transactionRef = adminDb.collection("transactions").doc();
        const transactionData = {
            amount,
            orderInfo,
            returnUrl,
            status: "PENDING",
            createdAt: new Date().toISOString(),
        };

        await transactionRef.set(transactionData);

        const paymentUrl = `${BASE_URL}/pay/${transactionRef.id}`;

        return NextResponse.json(
            {
                success: true,
                paymentUrl,
                transactionId: transactionRef.id,
            },
            { status: 201, headers: corsHeaders }
        );
    } catch (error) {
        console.error("Transaction creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
