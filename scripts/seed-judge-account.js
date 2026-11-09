/**
 * Provisioning script for AI Builders Congress Hackathon Judge account.
 * Run with: node scripts/seed-judge-account.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try loading environment variables from frontend/.env.local or process.env
const envPath = path.resolve(__dirname, '../frontend/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...val] = trimmed.split('=');
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('\x1b[31m[Error]\x1b[0m Missing Supabase credentials in frontend/.env.local.');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TARGET_USERS = [
  {
    email: 'aibuilderscongress@aibc.com',
    password: '!A1i9n7k1',
    role: 'AI Builders Congress',
    fullName: 'AI Builders Congress Judge',
  },
  // Alias with dot before @ in case entered verbatim
  {
    email: 'aibuilderscongress.@aibc.com',
    password: '!A1i9n7k1',
    role: 'AI Builders Congress',
    fullName: 'AI Builders Congress Judge',
  },
];

async function seed() {
  console.log('\x1b[36m[Lungent Provisioning]\x1b[0m Seeding AI Builders Congress judge accounts...');

  for (const user of TARGET_USERS) {
    try {
      // 1. Create or update user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          role: user.role,
          full_name: user.fullName,
          is_verified: true,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          console.log(`\x1b[33m[Notice]\x1b[0m ${user.email} already exists. Updating metadata and password...`);
          // Find existing user id
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existing = listData?.users?.find((u) => u.email === user.email);
          if (existing) {
            await supabase.auth.admin.updateUserById(existing.id, {
              password: user.password,
              email_confirm: true,
              user_metadata: {
                role: user.role,
                full_name: user.fullName,
                is_verified: true,
              },
            });
            console.log(`\x1b[32m[Success]\x1b[0m Account ${user.email} updated successfully!`);
          }
        } else {
          console.error(`\x1b[31m[Failed]\x1b[0m Could not create ${user.email}:`, error.message);
        }
      } else if (data?.user) {
        console.log(`\x1b[32m[Success]\x1b[0m Account ${user.email} created with Role: ${user.role}`);

        // 2. Ensure profile exists in user_profiles table
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', data.user.id)
          .maybeSingle();

        let profileId = profile?.id;
        if (!profileId) {
          const { data: newProfile } = await supabase
            .from('user_profiles')
            .insert({
              auth_user_id: data.user.id,
              full_name: user.fullName,
              email: user.email,
              status: 'active',
              preferred_language: 'en',
            })
            .select('id')
            .single();
          profileId = newProfile?.id;
        }

        // 3. Ensure role mapping exists
        if (profileId) {
          await supabase.from('user_roles').upsert({
            user_id: profileId,
            role_id: 'administrator',
          });
        }
      }
    } catch (err) {
      console.error(`\x1b[31m[Error]\x1b[0m Failed processing ${user.email}:`, err.message);
    }
  }

  console.log('\n\x1b[32m[Provisioning Complete]\x1b[0m');
  console.log('Credentials for Judges:');
  console.log('Email:    aibuilderscongress@aibc.com');
  console.log('Password: !A1i9n7k1');
  console.log('Role:     AI Builders Congress');
}

seed();

