import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the election ID from the request
    const { electionId } = await req.json();
    if (!electionId) {
      return new Response(JSON.stringify({ error: 'electionId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Get all questions for this election to filter vote_choices correctly
    const { data: questions, error: qError } = await supabaseClient
      .from('ballot_questions')
      .select('id')
      .eq('election_id', electionId);

    if (qError) throw qError;
    
    const questionIds = questions.map((q: any) => q.id);

    // 2. Fetch all vote choices for these questions
    // We order by ID to ensure the hash is completely deterministic
    const { data: voteChoices, error: vError } = await supabaseClient
      .from('vote_choices')
      .select('id, candidate_option_id, ballot_question_id, vote_id, created_at')
      .in('ballot_question_id', questionIds)
      .order('id', { ascending: true });

    if (vError) throw vError;

    // 3. Stringify the deterministic payload
    const payloadString = JSON.stringify(voteChoices);

    // 4. Generate SHA-256 Hash using Web Crypto API
    const messageBuffer = new TextEncoder().encode(payloadString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', messageBuffer);
    
    // Convert ArrayBuffer to Hex String
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 5. Save the hash back to the election record
    const { error: updateError } = await supabaseClient
      .from('elections')
      .update({ results_hash: hashHex })
      .eq('id', electionId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      success: true, 
      hash: hashHex,
      votesCount: voteChoices.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
