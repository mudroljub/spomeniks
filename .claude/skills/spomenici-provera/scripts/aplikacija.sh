#!/usr/bin/env bash
# Otvara aplikaciju u Chrome-u bez prozora, na ekranu telefona, i snima je.
# bash .claude/skills/spomenici-provera/scripts/aplikacija.sh <snimak.png> ["JS izraz"] [čekanje ms]
# Okruženje: HASH=#<id> otvara spomenik, W=1440 H=900 daje računar (i dalje sa dodirom).
# Ispis: EVAL <vrednost izraza>; EXC znači grešku u aplikaciji. Server se gasi i kad snimak ne uspe.
set -u
koren="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$koren" || exit 1

# tudji server na istom portu se ne koristi i ne gasi
if curl -s -o /dev/null http://localhost:8765/; then
  echo "port 8765 je zauzet; skripta pokrece i gasi samo svoj server" >&2
  exit 1
fi
python -m http.server 8765 >/dev/null 2>&1 &
server=$!
# na Windowsu kill ne gasi uvek python koji je pokrenuo bash, pa se gasi i po Windows id-u bas tog procesa
winpid=$(cat "/proc/$server/winpid" 2>/dev/null)
ugasi() {
  kill "$server" 2>/dev/null
  if [ -n "$winpid" ]; then taskkill //PID "$winpid" //F >/dev/null 2>&1; fi
}
trap ugasi EXIT

for _ in $(seq 20); do
  curl -s -o /dev/null http://localhost:8765/ && break
  sleep 0.5
done
timeout 150 node alati/snimi.mjs "$@"
