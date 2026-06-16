# EUGENIA.visual — Instrucciones de instalación

## Lo que vas a hacer (sin código, paso a paso)

---

## PASO 1 — Crear las tablas en Supabase

1. Entrá a https://supabase.com y abrí tu proyecto `eugenia-visual`
2. En el menú izquierdo, hacé clic en **SQL Editor**
3. Hacé clic en **New query**
4. Abrí el archivo `SUPABASE_SCHEMA.sql` (está en esta carpeta), copiá TODO el contenido y pegalo en el editor
5. Hacé clic en **Run**
6. Si aparece "Success" → ¡listo! Las tablas están creadas.

---

## PASO 2 — Instalar GitHub Desktop

1. Entrá a https://desktop.github.com
2. Descargá e instalá el programa
3. Abrilo y hacé clic en **Sign in to GitHub.com**
4. Ingresá con tu cuenta `eugenia-visual`

---

## PASO 3 — Subir el proyecto a GitHub

1. En GitHub Desktop, hacé clic en **File → Add Local Repository**
2. Navegá hasta la carpeta `eugenia-visual` (esta carpeta) y seleccionala
3. Si dice "repository not found", hacé clic en **Create a Repository**
   - Name: `eugenia-visual`
   - Dejá todo lo demás como está → **Create Repository**
4. Hacé clic en **Publish repository**
   - Keep this code private: podés dejarlo en ✓ (privado)
   - Hacé clic en **Publish Repository**

---

## PASO 4 — Conectar Vercel con GitHub

1. Entrá a https://vercel.com y abrí tu cuenta
2. Hacé clic en **Add New → Project**
3. Buscá el repositorio `eugenia-visual` y hacé clic en **Import**
4. En la sección **Environment Variables**, agregá estas dos variables:
   - Name: `VITE_SUPABASE_URL` / Value: `https://mibplzwhrdsbafvprbaf.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY` / Value: `sb_publishable_sJFVaAV9rBXZ2fudDN9k2g_ORGgcS-g`
5. Hacé clic en **Deploy**
6. Esperá 2-3 minutos → Vercel te da un link tipo `eugenia-visual.vercel.app`

---

## PASO 5 — Crear tu usuario en Supabase

1. Volvé a Supabase → menú **Authentication → Users**
2. Hacé clic en **Add User**
   - Email: `contacto.eugenia.visual@gmail.com`
   - Password: la contraseña que quieras usar para entrar a la app
3. **Send email invite**: no es necesario
4. Hacé clic en **Create User**

---

## ¡Listo!

Entrá al link de Vercel, usá tu email y contraseña, y ya estás dentro de la app.
