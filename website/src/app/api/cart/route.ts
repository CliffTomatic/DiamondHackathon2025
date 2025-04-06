// src/app/api/cart/route.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yourDatabaseName"); // Replace with your database name
    const collection = db.collection("yourCollectionName"); // Replace with your collection name

    // Fetch documents; modify the query as needed
    const cartData = await collection.find({ userId: "chrome-extension-user" }).toArray();

    return NextResponse.json({ data: cartData });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return NextResponse.error();
  }
}
