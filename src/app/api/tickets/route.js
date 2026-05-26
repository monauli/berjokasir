import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/auth";
import { jakartaNow, jakartaToday } from "@/lib/datetime";

export async function GET(req) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const today = jakartaToday();
  const query = { tanggal: today };
  if (user.role === "kasir") {
    query.kasirId = user.id;
    // Kasir hanya lihat tiket lokasinya
    if (user.lokasi) query.lokasi = user.lokasi;
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const skip = (page - 1) * limit;

  const tickets = await db.collection("tickets").find(query).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
  const totalTickets = await db.collection("tickets").countDocuments(query);
  const totalPages = Math.ceil(totalTickets / limit);

  const aggregation = await db.collection("tickets").aggregate([
    { $match: query },
    { $group: { _id: null, totalPemasukan: { $sum: "$total" } } }
  ]).toArray();
  const totalPemasukan = aggregation.length > 0 ? aggregation[0].totalPemasukan : 0;

  return NextResponse.json({
    tickets,
    pagination: { page, limit, totalTickets, totalPages },
    summary: { totalPemasukan }
  });
}

export async function POST(req) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { jenis, nama, noHp, qty = 1 } = await req.json();
  const db = await getDb();
  const config = await db.collection("config").findOne({ key: "harga" });
  const harga = config?.value || { satuan: 25000, mancanegara: 75000, diskonRombongan: 10, minRombongan: 5 };
  const { tanggal, waktu } = jakartaNow();

  let total, hargaSatuan, subtotal, diskon, diskonAmt;
  if (jenis === "satuan") {
    total = harga.satuan;
  } else if (jenis === "mancanegara") {
    total = harga.mancanegara;
  } else {
    hargaSatuan = harga.satuan;
    subtotal = qty * hargaSatuan;
    const berlakuDiskon = qty >= harga.minRombongan;
    diskon = berlakuDiskon ? harga.diskonRombongan : 0;
    diskonAmt = (subtotal * diskon) / 100;
    total = subtotal - diskonAmt;
  }

  const count = await db.collection("tickets").countDocuments();
  const ticketId = `TKT-${String(count + 1).padStart(4, "0")}`;

  const ticket = {
    id: ticketId,
    jenis,
    nama: nama || null,
    noHp: noHp || null,
    qty: jenis === "rombongan" ? Number(qty) : 1,
    total,
    hargaSatuan: jenis === "satuan" ? harga.satuan : jenis === "mancanegara" ? harga.mancanegara : hargaSatuan,
    subtotal: subtotal || null,
    diskon: diskon || null,
    diskonAmt: diskonAmt || null,
    tanggal,
    waktu,
    kasirId: user.id,
    kasirNama: user.name,
    lokasi: user.lokasi || null,  // <-- field lokasi
    createdAt: new Date(),
  };
  await db.collection("tickets").insertOne(ticket);
  return NextResponse.json({ ticket });
}

export async function DELETE(req) {
  const user = await getUserFromToken(req);
  if (!user || user.role !== "supervisor")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  const db = await getDb();
  await db.collection("tickets").deleteOne({ id });
  return NextResponse.json({ success: true });
}
