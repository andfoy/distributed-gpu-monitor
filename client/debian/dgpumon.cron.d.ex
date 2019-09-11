#
# Regular cron jobs for the dgpumon package
#
0 4	* * *	root	[ -x /usr/bin/dgpumon_maintenance ] && /usr/bin/dgpumon_maintenance
