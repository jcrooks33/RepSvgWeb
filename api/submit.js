// api/submit.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { email, state, rep_name } = req.body || {};

  if (!email || !state || !rep_name) {
    return res.status(400).json({ error: "Missing email, state, or option." });
  }

  // Initialize Supabase client with environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Insert data
  try {
    const { data, error } = await supabase
      .from("Signups")
      .insert([{ email, state, rep_name }]);

    if (error) throw error;
    
    return res.status(200).json({ message: "Signup successful!", data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
