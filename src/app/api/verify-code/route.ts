import { NextRequest, NextResponse } from 'next/server';

// In a real app, store these in a database
const validCodes = {
  'BETA100': { uses: 0, maxUses: 250, discount: 100, active: true },
  'FRIEND50': { uses: 0, maxUses: 100, discount: 50, active: true },
  'FEEDBACK100': { uses: 0, maxUses: 50, discount: 100, active: true },
  'LAUNCH25': { uses: 0, maxUses: 500, discount: 25, active: false }, // For later
};

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    const codeData = validCodes[code.toUpperCase() as keyof typeof validCodes];
    
    if (!codeData) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid code' 
      });
    }
    
    if (!codeData.active) {
      return NextResponse.json({ 
        valid: false, 
        message: 'This code is not yet active' 
      });
    }
    
    if (codeData.uses >= codeData.maxUses) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Code has reached its usage limit' 
      });
    }
    
    // Increment usage (in real app, update database)
    codeData.uses++;
    
    return NextResponse.json({
      valid: true,
      discount: codeData.discount,
      usesRemaining: codeData.maxUses - codeData.uses,
      message: codeData.discount === 100 ? 'Free analysis unlocked!' : `${codeData.discount}% discount applied!`
    });
    
} catch (error) {
  return NextResponse.json({ 
    valid: false, 
    message: `Error validating code` 
  }, { status: 500 });
}
}
