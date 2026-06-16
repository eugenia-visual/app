-- ============================================
-- EUGENIA.visual — Schema de base de datos
-- Ejecutar en Supabase > SQL Editor
-- ============================================

-- CLIENTES
create table clientes (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  instagram text,
  whatsapp text,
  contacto text,
  email text,
  color text default '#C8A99A',
  notas text,
  created_at timestamptz default now()
);

-- PIEZAS (publicaciones / contenido)
create table piezas (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  titulo text not null,
  tipo text default 'Reel', -- Reel, Carrusel, Historia, Placa, Otro
  red text default 'Instagram', -- Instagram, Facebook, Ambas
  fecha date,
  descripcion text,
  estado text default 'borrador', -- borrador, pendiente, aprobado, cambios
  comentarios jsonb default '[]',
  archivo_url text,
  created_at timestamptz default now()
);

-- IDEAS
create table ideas (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  texto text not null,
  link text,
  autor text default 'eugenia', -- eugenia o cliente
  created_at timestamptz default now()
);

-- RECIBOS
create table recibos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  fecha date,
  concepto text,
  items jsonb default '[]',
  total numeric,
  medio_pago text default 'Transferencia bancaria',
  alias text default 'eugenia.visual',
  titular text default 'Eugenia',
  created_at timestamptz default now()
);

-- ============================================
-- PERMISOS (Row Level Security)
-- Por ahora todo abierto para usuarios autenticados
-- ============================================

alter table clientes enable row level security;
alter table piezas enable row level security;
alter table ideas enable row level security;
alter table recibos enable row level security;

create policy "Acceso autenticado" on clientes for all using (auth.role() = 'authenticated');
create policy "Acceso autenticado" on piezas for all using (auth.role() = 'authenticated');
create policy "Acceso autenticado" on ideas for all using (auth.role() = 'authenticated');
create policy "Acceso autenticado" on recibos for all using (auth.role() = 'authenticated');
