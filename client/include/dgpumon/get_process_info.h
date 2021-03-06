/*
 *
 * Copyright (C) 2019 Edgar A. Margffoy-Tuay <andfoy@gmail.com>
 * nvtop - Copyright (C) 2017 Maxime Schmitt <maxime.schmitt91@gmail.com>
 *
 * This file is part of distributed-gpu-monitor.
 *
 * distributed-gpu-monitor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * distributed-gpu-monitor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with distributed-gpu-monitor.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#ifndef __GET_PROCESS_INFO_H_
#define __GET_PROCESS_INFO_H_

#include <stdlib.h>

void get_username_from_pid(pid_t pid, size_t size_buffer, char *buffer);

#endif // __GET_PROCESS_INFO_H_
