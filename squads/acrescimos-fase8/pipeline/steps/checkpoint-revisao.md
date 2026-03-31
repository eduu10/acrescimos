# Checkpoint: Revisão Final e Deploy — Fase 8

## Checklist de entrega

- [ ] Migration `live_coverage` rodou no Neon sem erros
- [ ] Migration `transfer_alerts` rodou no Neon sem erros
- [ ] Cron `/api/cron/previews` registrado no `vercel.json`
- [ ] Cron `/api/cron/roundup` registrado no `vercel.json`
- [ ] Cron `/api/cron/live-poll` registrado no `vercel.json`
- [ ] Página `/ao-vivo/[id]/cobertura` renderiza sem erro
- [ ] Polling do client component funciona (30s interval)
- [ ] Admin `/admin/transfers` lista alertas detectados
- [ ] Build sem erros (`npm run build`)
- [ ] Deploy com `npx vercel --prod`

## Notas de deploy
- Sempre usar `npx vercel --prod` (git push não faz deploy automático neste projeto)
- Vercel Cron requer plano Pro para intervalos menores que 1 dia
- Para Hobby plan: usar 1x/dia (0 8 * * *)
