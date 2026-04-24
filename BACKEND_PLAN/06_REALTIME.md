# Phase 6 — Real-Time, Storage & Polish

## Overview
Add real-time notification updates, avatar storage, session persistence, and final testing.

---

## Step 6.1 — Real-Time Notifications

**Already set up in Phase 4** (`useNotifications.ts` has the subscription).

To enable it in Supabase:

1. Go to **Supabase Dashboard → Database → Replication**
2. Enable Realtime for the `notifications` table
3. Or run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

**How it works:**
- When a query triggers `addNotification()`, it inserts into the `notifications` table
- The Supabase Realtime channel detects the `INSERT` event
- The `useNotifications` hook's subscription callback fires
- The new notification is prepended to the local state
- The bell icon updates instantly — no page refresh needed

**Test:**
1. Open two browser tabs (same user)
2. Search in Tab 1
3. Bell icon in Tab 2 should update within ~1 second

---

## Step 6.2 — Supabase Storage (Avatar Uploads)

### Create Storage Bucket

In Supabase Dashboard → **Storage → New Bucket:**

| Setting | Value |
|---|---|
| Name | `avatars` |
| Public | ✅ Yes (public URLs for avatar display) |
| File size limit | 2 MB |
| Allowed MIME types | `image/jpeg, image/png, image/webp` |

Or via SQL:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

### Storage RLS Policies

```sql
-- Users can upload their own avatar
CREATE POLICY "avatar_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update (overwrite) their own avatar
CREATE POLICY "avatar_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view avatars (public bucket)
CREATE POLICY "avatar_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

### Upload Flow (already in `useProfile.ts`)

```
User selects image file
  → uploadAvatar(file) called
    → supabase.storage.from('avatars').upload(`${userId}/avatar.png`, file, { upsert: true })
    → Get public URL
    → Update profiles.avatar_url with the public URL
    → Avatar displays everywhere via the profile data
```

### Add Avatar Upload UI in MyProfile

```tsx
// In MyProfile.tsx:
<label className="cursor-pointer group">
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className="hidden"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (file) await handleAvatarUpload(file);
    }}
  />
  <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden relative group-hover:ring-2 ring-zinc-300 transition-all">
    {profile?.avatar_url ? (
      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-400">
        {profile?.full_name?.charAt(0) ?? 'U'}
      </div>
    )}
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <Camera className="w-5 h-5 text-white" />
    </div>
  </div>
</label>
```

---

## Step 6.3 — Session Persistence

**Supabase Auth handles this automatically:**

- On `signUp` or `signIn`, Supabase stores a JWT + refresh token in `localStorage`
- On app reload, `supabase.auth.getSession()` reads from `localStorage`
- The `useAuth` hook checks this on mount and sets `loading = false` once resolved
- Token refresh happens automatically via `autoRefreshToken: true`

**Result:** Users stay logged in across page refreshes and browser restarts.

### Handle Token Expiry

Supabase JWTs expire after 1 hour by default. The SDK auto-refreshes them. But if the refresh token also expires (after 1 week by default):

```typescript
// In useAuth.ts — handle SIGNED_OUT from expired session:
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    // Session expired — redirect to home
    setState({ user: null, profile: null, session: null, loading: false });
  }
});
```

---

## Step 6.4 — Error Handling & Loading States

### Global Error Handler

```typescript
// src/lib/supabase-helpers.ts
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error('Supabase error:', error.message);
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Network error:', msg);
    return { data: null, error: msg };
  }
}
```

### Loading States

Add loading spinners where data is being fetched:

```tsx
// Example in MyProfile:
{loading ? (
  <div className="flex items-center justify-center py-12">
    <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
  </div>
) : (
  <ProfileContent profile={profile} stats={stats} />
)}
```

---

## Step 6.5 — Final Testing Checklist

### Auth Tests
- [ ] Register new user → profile auto-created → settings + gamification auto-created
- [ ] Login with email + password → session established
- [ ] Refresh page → still logged in
- [ ] Logout → cannot access protected pages
- [ ] Wrong password → clear error message
- [ ] Duplicate email → clear error message

### Data Persistence Tests
- [ ] Search a query → row appears in `query_history` table
- [ ] Search triggers notification → row in `notifications` table
- [ ] Bell icon shows correct unread count
- [ ] Mark all read → all notifications updated
- [ ] Gamification: search 5 times → "Explorer" badge appears
- [ ] Save an analysis → appears in saved list
- [ ] Toggle favorite on saved analysis → persists
- [ ] Delete saved analysis → removed from DB

### Chat Tests
- [ ] Open AI chat → send message → session created
- [ ] Send multiple messages → all persisted
- [ ] Close modal → reopen → messages reload from DB
- [ ] Multiple sessions appear in sidebar
- [ ] Click session → loads its messages

### Profile Tests
- [ ] View profile → shows real data from DB
- [ ] Edit name → persists after refresh
- [ ] Upload avatar → displays correctly
- [ ] Settings changes persist → theme, notifications

### Security Tests (RLS)
- [ ] Open Supabase Dashboard → Authentication → create 2 test users
- [ ] User A's queries are NOT visible to User B
- [ ] User A cannot update User B's profile
- [ ] User A cannot read User B's notifications
- [ ] User A cannot access User B's chat sessions

---

## Step 6.6 — Supabase Dashboard Monitoring

After everything is live, monitor:

| Dashboard Section | What to Check |
|---|---|
| **Auth → Users** | New registrations, active users |
| **Table Editor** | Data in all 8 tables |
| **Database → Logs** | SQL query performance |
| **Storage** | Avatar uploads and sizes |
| **Realtime → Inspector** | Active subscriptions |
| **API → Usage** | Request counts (free tier: 500K/month) |

---

## Complete File Tree After All 6 Phases

```
src/
├── lib/
│   ├── supabase.ts              ← Phase 1 (new)
│   ├── supabase-helpers.ts      ← Phase 6 (new)
│   └── database.types.ts        ← Phase 1 (new)
├── hooks/
│   ├── useAuth.ts               ← Phase 3 (new)
│   ├── useQueryHistory.ts       ← Phase 4 (new)
│   ├── useNotifications.ts      ← Phase 4 (new)
│   ├── useGamification.ts       ← Phase 4 (new)
│   ├── useSavedAnalyses.ts      ← Phase 4 (new)
│   ├── useChatSessions.ts       ← Phase 4 (new)
│   └── useProfile.ts            ← Phase 4 (new)
├── app/
│   ├── App.tsx                  ← Phase 3 (modified: loading state)
│   ├── AppContext.tsx            ← Phase 3 (modified: Supabase auth)
│   ├── components/
│   │   ├── SmartSuggestions.tsx  ← Phase 5 (modified: persist queries)
│   │   ├── Navigation.tsx       ← Phase 5 (modified: real notifications)
│   │   ├── SearchAuthModal.tsx  ← Phase 3 (modified: email auth)
│   │   └── AIAssistantModal.tsx ← Phase 5 (modified: persist chat)
│   └── pages/
│       ├── Dashboard.tsx        ← Phase 5 (modified: real stats)
│       ├── MyProfile.tsx        ← Phase 5 (modified: real data + avatar)
│       └── SettingsPanel.tsx    ← Phase 5 (modified: persist settings)
├── styles/ (unchanged)
.env.local                       ← Phase 1 (new)
package.json                     ← Phase 1 (modified: add supabase-js)
```

---

## ✅ Phase 6 Complete — Full Migration Done!

After all 6 phases:
- ✅ Real authentication (email + password)
- ✅ Session persistence across refreshes
- ✅ 8 PostgreSQL tables with RLS
- ✅ All queries, notifications, chat, settings persist
- ✅ Gamification persists (score, badges, streak)
- ✅ Avatar uploads via Supabase Storage
- ✅ Real-time notification updates
- ✅ Secure — each user can only access their own data
