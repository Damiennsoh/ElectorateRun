import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getReminderHtml = (orgName: string, electionTitle: string, endDate: string, timezone: string, vID: string, vKey: string, voteUrl: string, adminName: string, adminEmail: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f7f9; }
        .container { max-width: 600px; margin: 40px auto; background: white; padding: 40px; border: 1px solid #e1e8ed; border-radius: 4px; }
        .header { text-align: center; font-size: 22px; font-weight: bold; color: #1a1a1a; margin-bottom: 30px; }
        .body-text { font-size: 15px; color: #4a4a4a; margin-bottom: 25px; }
        .login-box { background: #333; color: white; border-radius: 4px; overflow: hidden; margin: 30px 0; }
        .login-header { background: #444; padding: 12px; font-size: 13px; font-weight: bold; text-transform: uppercase; text-align: center; }
        .login-content { padding: 0; }
        .login-label { width: 40%; background: #f9f9f9; color: #333; padding: 12px 20px; font-weight: bold; font-size: 14px; }
        .login-value { width: 60%; background: white; color: #333; padding: 12px 20px; font-family: monospace; font-size: 14px; }
        .button-container { text-align: center; margin: 35px 0; }
        .button { background-color: #00AEEF; color: white !important; padding: 14px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; }
        .footer-note { font-size: 12px; color: #888; text-align: center; margin-top: 15px; }
        .contact-info { font-size: 13px; color: #666; margin-top: 40px; }
        .contact-info a { color: #00AEEF; text-decoration: none; }
        .logo { text-align: center; margin-top: 40px; opacity: 0.8; }
        .logo-text { font-weight: bold; color: #00AEEF; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">${orgName}</div>
        
        <div class="body-text">
            <strong>REMINDER:</strong> You haven't voted yet! ${orgName} has invited you to vote in the election: <strong>${electionTitle}</strong>
        </div>
        
        <div class="body-text">
            You have until ${endDate} (${timezone}) to vote in this election.
        </div>

        <div class="login-box">
            <div class="login-header">Login Information:</div>
            <div class="login-content">
                <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <tr>
                        <td width="40%" style="background: #f9f9f9; color: #333; padding: 12px 20px; font-weight: bold; font-size: 14px; border-top: 1px solid #e1e8ed; border-right: 1px solid #e1e8ed;">Voter ID:</td>
                        <td width="60%" style="background: white; color: #333; padding: 12px 20px; font-family: monospace; font-size: 14px; border-top: 1px solid #e1e8ed;">${vID}</td>
                    </tr>
                    <tr>
                        <td width="40%" style="background: #f9f9f9; color: #333; padding: 12px 20px; font-weight: bold; font-size: 14px; border-top: 1px solid #e1e8ed; border-right: 1px solid #e1e8ed;">Voter Key:</td>
                        <td width="60%" style="background: white; color: #333; padding: 12px 20px; font-family: monospace; font-size: 14px; border-top: 1px solid #e1e8ed;">${vKey}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="button-container">
            <a href="${voteUrl}" class="button">Click Here to Vote</a>
        </div>

        <div class="footer-note">
            (Clicking the above link will automatically log you in to vote)
        </div>

        <div class="contact-info">
            If you have any questions, please contact your election administrator:<br>
            <strong>${adminName}</strong> (<a href="mailto:${adminEmail}">${adminEmail}</a>)
        </div>

        <div class="logo">
            <div class="logo-text">electionrunner</div>
        </div>
    </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { electionId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch Election and Organization
    const { data: election, error: electionError } = await supabase
      .from('elections')
      .select('*, user_id')
      .eq('id', electionId)
      .single()

    if (electionError) throw electionError

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', election.user_id)
      .single()

    const orgName = org?.name || 'Organization'
    const adminName = org?.name || 'Election Administrator'
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'support@electionrunner.com'
    const timezone = election.timezone || 'Africa/Abidjan'
    const endDate = new Date(election.end_date).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })

    // 2. Fetch Voters who have been invited but haven't voted yet
    const { data: voters, error: votersError } = await supabase
      .from('voters')
      .select('*')
      .eq('election_id', electionId)
      .eq('has_voted', false)
      .not('invitation_sent_at', 'is', null)

    if (votersError) throw votersError

    if (voters && voters.length > 0) {
        for (const voter of voters) {
            const voteUrl = `http://localhost:3000/vote/${electionId}?vID=${voter.voter_identifier}&vKey=${voter.voter_key}`
            const html = getReminderHtml(orgName, election.title, endDate, timezone, voter.voter_identifier, voter.voter_key, voteUrl, adminName, adminEmail)
            
            console.log(`[EMAIL] To: ${voter.email}, Subject: [REMINDER] Your Invitation to Vote in the Election: ${election.title}`)
            // await sendEmail(voter.email, `[REMINDER] Your Invitation to Vote in the Election: ${election.title}`, html)
        }

        // Mark as reminder sent
        await supabase
          .from('voters')
          .update({ reminder_sent_at: new Date().toISOString() })
          .in('id', voters.map(v => v.id))
    }

    return new Response(JSON.stringify({ message: "Reminders processed" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
