#!/bin/bash
cd ~/Desktop/Tailwind/activity-log/techdeutschpro || exit 1
DAYS=7

echo -e "\n🟢 Git Commit Activity (last $DAYS days)\n"

for i in $(seq 0 $((DAYS - 1)))
do
  day=$(date -v-"$i"d +%Y-%m-%d)
  count=$(git log --since="$day 00:00" --until="$day 23:59" --pretty=oneline | wc -l)

  if [ "$count" -gt 0 ]; then
    echo -e "$day ✅ \033[0;32m$count commit(s)\033[0m"
  else
    echo -e "$day ❌ \033[0;31mNo commits\033[0m"
  fi
done
