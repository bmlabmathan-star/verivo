
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking 'profiles' table...");
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .limit(5);

    if (pError) {
        console.log("Error querying 'profiles':", pError.message);
    } else {
        console.log("'profiles' data found (" + profiles.length + "):", profiles);
    }

    console.log("\nChecking 'experts' table...");
    const { data: experts, error: eError } = await supabase
        .from('experts')
        .select('id, username, name')
        .limit(5);

    if (eError) {
        console.log("Error querying 'experts':", eError.message);
    } else {
        console.log("'experts' data found (" + experts.length + "):", experts);
    }
}

check();
