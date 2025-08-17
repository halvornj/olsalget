# v2

The main goal of version 2 of olsalget is to migrate to a database, reducing latency.  
Some optimizations will be made to the code as well, to potentially better adhere to proper standards.

## holidays

the holidays for the next 50 years are grabbed from `webapi.no/api/v1/holidays/YEAR`.  
The
they are then formatted with `sed -i -e 's/\(.*\)/\L\1/g' -e 's/æ/e/gI' -e 's/ø/o/gI' -e 's/å/a/gI' -e 's/t00:00:00/T00:00:00/g' -e 's/ //g'   data/YEAR.json`

## TODO

This branch is a work in progress, and should not be anywhere near deployed until these are implemented:

- make use of new backend (rewriting the js)
- cron the server-file, so it restarts at reboot.
-
