import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntakeActionPayload {
  actionToken: string;
  dosePlanId: string;
  snoozeMinutes?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract action from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1]; // 'taken', 'snooze', or 'skip'

    if (!['taken', 'snooze', 'skip'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: IntakeActionPayload = await req.json();
    const { actionToken, dosePlanId, snoozeMinutes } = payload;

    console.log(`Processing ${action} for dosePlanId: ${dosePlanId}`);

    // Step 1: Validate the action token
    const { data: token, error: tokenError } = await supabase
      .from('action_tokens')
      .select('*')
      .eq('token', actionToken)
      .eq('entity_id', dosePlanId)
      .eq('type', 'confirm_intake')
      .is('used_at', null)
      .single();

    if (tokenError || !token) {
      console.error('Invalid or expired token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired action token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (new Date(token.expires_at) < new Date()) {
      console.error('Token expired');
      return new Response(
        JSON.stringify({ error: 'Action token has expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Get the dose plan
    const { data: dosePlan, error: dosePlanError } = await supabase
      .from('dose_plans')
      .select('*')
      .eq('id', dosePlanId)
      .single();

    if (dosePlanError || !dosePlan) {
      console.error('Dose plan not found:', dosePlanError);
      return new Response(
        JSON.stringify({ error: 'Dose plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Record the intake action
    const intakeStatus = action === 'taken' ? 'on_time' : 
                        action === 'skip' ? 'skipped' : 'late';
    
    const { error: intakeError } = await supabase
      .from('dose_intakes')
      .insert({
        dose_plan_id: dosePlanId,
        status: intakeStatus,
        taken_at_utc: action !== 'skip' ? new Date().toISOString() : null,
        source: 'web_push',
        notes: action === 'snooze' ? `Snoozed for ${snoozeMinutes} minutes` : null,
      });

    if (intakeError) {
      console.error('Failed to record intake:', intakeError);
      return new Response(
        JSON.stringify({ error: 'Failed to record intake' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Update dose plan status
    let newDosePlanStatus = action === 'taken' ? 'taken' :
                           action === 'skip' ? 'skipped' : 'pending';

    const { error: updateError } = await supabase
      .from('dose_plans')
      .update({ status: newDosePlanStatus })
      .eq('id', dosePlanId);

    if (updateError) {
      console.error('Failed to update dose plan:', updateError);
    }

    // Step 5: Mark token as used
    const { error: markUsedError } = await supabase
      .from('action_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', token.id);

    if (markUsedError) {
      console.error('Failed to mark token as used:', markUsedError);
    }

    // Step 6: Handle snooze - create new notification (placeholder for future implementation)
    if (action === 'snooze' && snoozeMinutes) {
      console.log(`TODO: Schedule new notification in ${snoozeMinutes} minutes`);
      // Future: Implement snooze logic with notification scheduling
    }

    console.log(`Successfully processed ${action} for dosePlanId: ${dosePlanId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        action,
        dosePlanId,
        message: `Medication ${action} recorded successfully` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
