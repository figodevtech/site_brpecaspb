import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ error: "Use a área autenticada do cliente ou a gestão de pedidos no ERP." }, { status: 410 });
}
export const PATCH = GET;
