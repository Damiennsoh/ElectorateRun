import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { electionId } = await req.json()
    
    // Create Supabase client with Service Role Key (needed to bypass RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch Election details for the email template
    const { data: election, error: electionError } = await supabase
      .from('elections')
      .select('*, settings')
      .eq('id', electionId)
      .single()

    if (electionError) throw electionError

    // 2. Fetch Voters who haven't been invited yet
    const { data: voters, error: votersError } = await supabase
      .from('voters')
      .select('*')
      .eq('election_id', electionId)
      .is('invitation_sent_at', null)

    if (votersError) throw votersError

    if (!voters || voters.length === 0) {
      return new Response(JSON.stringify({ message: "No pending invitations found." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Mark voters as invited
    // Note: In a real production scenario, you would loop through 'voters' 
    // and call your SMTP provider's API (e.g., Resend, SendGrid) here.
    const { error: updateError } = await supabase
      .from('voters')
      .update({ invitation_sent_at: new Date().toISOString() })
      .in('id', voters.map(v => v.id))

    if (updateError) throw updateError

    return new Response(JSON.stringify({ 
      message: "Invitations successfully processed", 
      count: voters.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
