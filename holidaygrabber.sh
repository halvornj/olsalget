#!/bin/bash

#todo put this in a loop
for YEAR in {2025..2100}
do
    ret=$(curl https://webapi.no/api/v1/holidays/$YEAR | jq -r '.data' | sed -e 's/\(.*\)/\L\1/g' -e 's/æ/e/gI' -e 's/ø/o/gI' -e 's/å/a/gI' -e 's/t00:00:00/T00:00:00/g' -e 's/ //g' > data/$YEAR.json)
    echo "$YEAR.json written"
    sleep .5 #maybe remove, but i dont want to hammer the poor guys server
done
