import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Admin-only migration utility: it reads public values through Google Sheets API
// and upserts resources. Keep the service-role key server-only.
export async function POST(request: Request) {
  const secret=request.headers.get("x-import-secret");
  if (!secret || secret !== process.env.SHEETS_IMPORT_SECRET) return NextResponse.json({error:"Unauthorized"},{status:401});
  const key=process.env.GOOGLE_SHEETS_API_KEY, sheetId=process.env.GOOGLE_SHEETS_ID, url=process.env.NEXT_PUBLIC_SUPABASE_URL, role=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key||!sheetId||!url||!role) return NextResponse.json({error:"Missing Google Sheets or Supabase server configuration"},{status:500});
  const sheet=String((await request.json()).sheet || "RoadMap_Content");
  const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheet)}?key=${key}`,{cache:"no-store"});
  if(!response.ok) return NextResponse.json({error:"Could not read the worksheet"},{status:response.status});
  const values=(await response.json()).values as string[][] || []; if(values.length<2)return NextResponse.json({inserted:0});
  const [headers,...rows]=values; const records=rows.map(row=>Object.fromEntries(headers.map((h,i)=>[h.trim(),row[i]??null])));
  const supabase=createClient(url,role); const table=sheet==='Wellness'?'wellness_resources':'roadmap_resources';
  const mapped=records.map((r,index)=>table==='wellness_resources'?({risk_level:r['Wellness Risk Level'],title:r['Resource Title'],resource_type:r['Resource Type'],description:r.Description,url:r.Link}):({career_track:r['Career Track'],title:r['Resource Title'],resource_type:r['Resource Type'],description:r.Description,url:r.Link,sort_order:index+1}));
  const conflictTarget=table==='wellness_resources'?'risk_level,title':'career_track,url';
  const {error}=await supabase.from(table).upsert(mapped,{onConflict:conflictTarget}); if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({inserted:mapped.length,table});
}
