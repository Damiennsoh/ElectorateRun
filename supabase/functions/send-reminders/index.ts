import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { electionId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch Voters who have been invited but haven't voted yet
    const { data: voters, error: votersError } = await supabase
      .from('voters')
      .select('*')
      .eq('election_id', electionId)
      .eq('has_voted', false)
      .not('invitation_sent_at', 'is', null)

    if (votersError) throw votersError

    if (!voters || voters.length === 0) {
      return new Response(JSON.stringify({ message: "No voters need reminders." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Mark as reminder sent
    const { error: updateError } = await supabase
      .from('voters')
      .update({ reminder_sent_at: new Date().toISOString() })
      .in('id', voters.map(v => v.id))

    if (updateError) throw updateError

    return new Response(JSON.stringify({ 
      message: "Reminders successfully processed", 
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
