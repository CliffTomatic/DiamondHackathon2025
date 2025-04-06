// app/api/save-all-data/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Define the schema for validation
const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  quantity: z.string(),
  cost: z.string(),
  source: z.string(),
});

// Schema for the entire array
const dataArraySchema = z.array(itemSchema);

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the entire data array
    const validatedData = dataArraySchema.parse(body);
    
    // Write the data to data.json
    const filePath = path.join(process.cwd(), 'data.json');
    fs.writeFileSync(filePath, JSON.stringify(validatedData, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: 'All data saved successfully' });
  } catch (error) {
    console.error('Error saving all data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    );
  }
}