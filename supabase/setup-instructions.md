# 67 Hub - Supabase Setup Instructions

## 1. Crea il Database Schema

Vai su: **Supabase Dashboard → SQL Editor → New Query**

Esegui in ordine:

### Step 1: Schema & Tabelle
```sql
-- Copia e incolla il contenuto di: migrations/001_initial_schema.sql
```

### Step 2: RLS Policies
```sql
-- Copia e incolla il contenuto di: migrations/002_rls_policies.sql
```

---

## 2. Crea gli Utenti Test

Vai su: **Supabase Dashboard → Authentication → Users**

Clicca **Add User** e crea questi 4 utenti:

| Email | Password | Note |
|-------|----------|------|
| admin@67hub.test | testpassword123 | Admin |
| manager@67hub.test | testpassword123 | Manager |
| artist1@67hub.test | testpassword123 | Artist 1 |
| artist2@67hub.test | testpassword123 | Artist 2 |

**IMPORTANTE**: Dopo aver creato gli utenti nell'UI di Supabase, devi copiare i loro UUID.

---

## 3. Inserisci i Profili Utente

Vai di nuovo su: **SQL Editor → New Query**

### PRIMA: Ottieni gli UUID degli utenti

```sql
SELECT id, email FROM auth.users ORDER BY email;
```

Copia gli UUID, poi modifica e esegui questo script sostituendo gli UUID:

```sql
-- Sostituisci questi UUID con quelli REALI dal SELECT sopra
-- IMPORTANTE: Devi sostituire TUTTI gli UUID con quelli veri!

INSERT INTO users (id, email, display_name, role) VALUES
  ('UUID_DI_admin@67hub.test', 'admin@67hub.test', 'Test Admin', 'admin'),
  ('UUID_DI_manager@67hub.test', 'manager@67hub.test', 'Test Manager', 'manager'),
  ('UUID_DI_artist1@67hub.test', 'artist1@67hub.test', 'Test Artist 1', 'artist'),
  ('UUID_DI_artist2@67hub.test', 'artist2@67hub.test', 'Test Artist 2', 'artist');

-- Crea gli artisti
INSERT INTO artists (id, user_id, name, bio, color, is_label) VALUES
  ('11111111-1111-1111-1111-111111111111', 'UUID_DI_artist1@67hub.test', 'MC Test', 'Test rapper', '#FF5500', false),
  ('22222222-2222-2222-2222-222222222222', 'UUID_DI_artist2@67hub.test', 'DJ Sample', 'Test DJ', '#00AAFF', false),
  ('67676767-6767-6767-6767-676767676767', NULL, '67 Label', 'The label', '#FFD700', true);

-- Crea le conversazioni per gli artisti
INSERT INTO conversations (artist_id) VALUES
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');
```

---

## 4. (Opzionale) Seed Data Completo

Se vuoi dati di test completi (post, commenti, chat, notifiche), esegui anche:

```sql
-- Modifica il seed.sql sostituendo gli UUID degli utenti
-- Poi eseguilo
```

---

## 5. Verifica

Esegui queste query per verificare:

```sql
-- Verifica utenti
SELECT u.email, u.role, a.name as artist_name
FROM users u
LEFT JOIN artists a ON a.user_id = u.id
ORDER BY u.email;

-- Verifica artisti
SELECT id, name, is_label, user_id FROM artists ORDER BY name;

-- Verifica conversazioni
SELECT c.id, a.name
FROM conversations c
JOIN artists a ON a.id = c.artist_id;
```

Dovrebbe mostrare:
- ✅ 4 utenti (admin, manager, artist1, artist2)
- ✅ 3 artisti (MC Test, DJ Sample, 67 Label)
- ✅ 2 conversazioni (una per ogni artista, non per la label)

---

## 6. Test Login

Ora torna all'app e prova:

```
Email: admin@67hub.test
Password: testpassword123
```

Dovrebbe funzionare! 🎉

---

## Troubleshooting

### Errore: "Database error querying schema"
- Verifica che le policy RLS siano state eseguite
- Verifica che gli UUID nella tabella `users` matchino con `auth.users`
- Controlla i log in **Supabase Dashboard → Logs**

### Errore: "User not found"
- Verifica che l'utente esista in **Authentication → Users**
- Verifica che il profilo esista in `users` table con lo stesso UUID

### Errore: "Permission denied"
- Le policy RLS non sono configurate correttamente
- Riesegui `002_rls_policies.sql`
