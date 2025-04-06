// app/api/save-item/route.ts
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

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the data
    const validatedItem = itemSchema.parse(body);
    
    // Read the current data from data.json
    const filePath = path.join(process.cwd(), 'data.json');
    let currentData = [];
    
    try {
      // Check if file exists
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        currentData = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Error reading data.json:', error);
      // If file doesn't exist or is corrupted, we'll create a new one
    }
    
    // Find and update the item in the data array, or add it if it doesn't exist
    const itemIndex = currentData.findIndex((item: any) => item.id === validatedItem.id);
    
    if (itemIndex >= 0) {
      currentData[itemIndex] = validatedItem;
    } else {
      currentData.push(validatedItem);
    }
    
    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: 'Item saved successfully' });
  } catch (error) {
    console.error('Error saving item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save item' },
      { status: 500 }
    );
  }
}