# Núcleo BPO

Sistema de gestão financeira para BPO — multiempresa, lançamentos, conciliação,
contas a pagar/receber e emissão de notas/boletos (registro interno).

## Rodar localmente (opcional, exige Node.js instalado)
```
npm install
cp .env.example .env
npm run dev
```

## Publicar (GitHub + Vercel)

1. Crie um repositório novo no GitHub (pode ser privado) e suba esta pasta inteira.
2. Em vercel.com, clique em **"Add New" → "Project"** e importe esse repositório.
3. Antes de clicar em "Deploy", abra **"Environment Variables"** e adicione:
   - `VITE_SUPABASE_URL` → `https://ekswuvdljcxmjzasqncb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` → `sb_publishable_L6Rg4Vd-ncB8nGX9k-tGVw_bJNPTTvy`
4. Clique em **Deploy**. Em cerca de 1 minuto você recebe um link tipo `nucleo-bpo.vercel.app`.

Depois disso, qualquer usuário pode acessar esse link, criar uma conta (e-mail/senha)
e, no primeiro acesso, cadastrar a primeira empresa — as demais entram aos poucos,
pelo próprio sistema, sem precisar mexer no banco de dados diretamente.
