/*
 *
 * Copyright (C) 2017 Maxime Schmitt <maxime.schmitt91@gmail.com>
 *
 * This file is part of Nvtop.
 *
 * Nvtop is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Nvtop is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with nvtop.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <ncurses.h>
#include <getopt.h>
#include <string.h>
// #include <msgpack.h>

#include <locale.h>
#include <czmq.h>

#include "nvtop/interface.h"
#include "nvtop/version.h"

#define STOP_SIGNAL 0x1
#define RESIZE_SIGNAL 0x2

static volatile unsigned char signal_bits = 0;

static void exit_handler(int signum) {
  (void) signum;
  signal_bits |= STOP_SIGNAL;
}

static void resize_handler(int signum) {
  (void) signum;
  signal_bits |= RESIZE_SIGNAL;
}

static const char helpstring[] =
"Available options:\n"
"  -d --delay       : Select the refresh rate (1 == 0.1s)\n"
"  -v --version     : Print the version and exit\n"
"  -s --gpu-select  : Column separated list of GPU IDs to monitor\n"
"  -i --gpu-ignore  : Column separated list of GPU IDs to ignore\n"
"  -C --no-color    : No colors\n"
"  -h --help        : Print help and exit\n";

static const char versionString[] =
"nvtop version " NVTOP_VERSION_STRING;

static const struct option long_opts[] = {
  {
    .name = "delay",
    .has_arg = required_argument,
    .flag = NULL,
    .val = 'd'
  },
  {
    .name = "version",
    .has_arg = no_argument,
    .flag = NULL,
    .val = 'v'
  },
  {
    .name = "help",
    .has_arg = no_argument,
    .flag = NULL,
    .val = 'h'
  },
  {
    .name = "no-color",
    .has_arg = no_argument,
    .flag = NULL,
    .val = 'C'
  },
  {
    .name = "no-colour",
    .has_arg = no_argument,
    .flag = NULL,
    .val = 'C'
  },
  {
    .name = "gpu-select",
    .has_arg = required_argument,
    .flag = NULL,
    .val = 's'
  },
  {
    .name = "gpu-ignore",
    .has_arg = required_argument,
    .flag = NULL,
    .val = 'i'
  },
  {
    .name = "remote-server",
    .has_arg = required_argument,
    .flag = NULL,
    .val = 'r'
  },
  {0,0,0,0},
};

static const char opts[] = "hvd:r:s:i:C";

static size_t update_mask_value(const char *str, size_t entry_mask, bool addTo) {
  char *saveptr;
  char *option_copy = malloc((strlen(str) + 1) * sizeof(*option_copy));
  strcpy(option_copy, str);
  char *gpu_num = strtok_r(option_copy, ":", &saveptr);
  while (gpu_num != NULL) {
    char *endptr;
    unsigned num_used = strtoul(gpu_num, &endptr, 0);
    if (endptr == gpu_num) {
      fprintf(stderr,
          "Use GPU IDs (unsigned integer) to select GPU with option 's' or 'i'\n");
      exit(EXIT_FAILURE);
    }
    if (num_used >= CHAR_BIT * sizeof(entry_mask)) {
      fprintf(stderr, "Select GPU X with option 's' or 'i' where 0 <= X < %zu\n",
          CHAR_BIT * sizeof(entry_mask));
      exit(EXIT_FAILURE);
    }
    if (addTo)
      entry_mask |= 1 << num_used;
    else
      entry_mask &= ~(1 << num_used);
    gpu_num = strtok_r(NULL, ":", &saveptr);
  }
  free(option_copy);
  return entry_mask;
}

int main (int argc, char **argv) {
  (void) setlocale(LC_CTYPE, "");

  opterr = 0;
  int refresh_interval = 1000;
  char *selectedGPU = NULL;
  char *ignoredGPU = NULL;
  bool use_color_if_available = true;
  char *server_hostname = "localhost";
  while (true) {
    char optchar = getopt_long(argc, argv, opts, long_opts, NULL);
    if (optchar == -1)
      break;
    switch (optchar) {
      case 'd':
        {
          char *endptr = NULL;
          long int delay_val = strtol(optarg, &endptr, 0);
          if (endptr == optarg) {
            fprintf(stderr, "Error: The delay must be a positive value representing tenths of seconds\n");
            exit(EXIT_FAILURE);
          }
          if (delay_val < 0) {
            fprintf(stderr, "Error: A negative delay requires a time machine!\n");
            exit(EXIT_FAILURE);
          }
          refresh_interval = (int) delay_val * 100u;
        }
        break;
      case 'r':
        server_hostname = optarg;
        printf("%s\n", server_hostname);
        break;
      case 's':
        selectedGPU = optarg;
        break;
      case 'i':
        ignoredGPU = optarg;
        break;
      case 'v':
        printf("%s\n", versionString);
        exit(EXIT_SUCCESS);
      case 'h':
        printf("%s\n%s", versionString, helpstring);
        exit(EXIT_SUCCESS);
      case 'C':
        use_color_if_available = false;
        break;
      case ':':
      case '?':
        switch (optopt) {
          case 'd':
            fprintf(stderr, "Error: The delay option takes a positive value representing tenths of seconds\n");
            break;
          default:
            fprintf(stderr, "Unhandled error in getopt missing argument\n");
            exit(EXIT_FAILURE);
            break;
        }
        exit(EXIT_FAILURE);
    }
  }

  char server_endpoint[40];
  sprintf(server_endpoint, "tcp://%s:6587", server_hostname);
  zsock_t *push_sock = zsock_new_push(server_endpoint);

  char hostname[1024];
  gethostname(hostname, 1024);

  setenv("ESCDELAY", "10", 1);

  struct sigaction siga;
  siga.sa_flags = 0;
  sigemptyset(&siga.sa_mask);
  siga.sa_handler = exit_handler;

  if (sigaction(SIGINT, &siga, NULL) != 0) {
    perror("Impossible to set signal handler for SIGINT: ");
    exit(EXIT_FAILURE);
  }
  if (sigaction(SIGQUIT, &siga, NULL) != 0) {
    perror("Impossible to set signal handler for SIGQUIT: ");
    exit(EXIT_FAILURE);
  }
  siga.sa_handler = resize_handler;
  if (sigaction(SIGWINCH, &siga, NULL) != 0) {
    perror("Impossible to set signal handler for SIGQUIT: ");
    exit(EXIT_FAILURE);
  }

  size_t gpu_mask;
  if (selectedGPU != NULL) {
    gpu_mask = 0;
    gpu_mask = update_mask_value(selectedGPU, gpu_mask, true);
  } else {
    gpu_mask = UINT_MAX;
  }
  if (ignoredGPU != NULL) {
    gpu_mask = update_mask_value(ignoredGPU, gpu_mask, false);
  }

  if (!init_gpu_info_extraction())
    return EXIT_FAILURE;
  size_t num_devices;
  struct device_info *dev_infos;
  num_devices = initialize_device_info(&dev_infos, gpu_mask);
  if (num_devices == 0) {
    fprintf(stdout, "No GPU left to monitor.\n");
    free(dev_infos);
    return EXIT_SUCCESS;
  }
  size_t biggest_name = 0;
  for (size_t i = 0; i < num_devices; ++i) {
    size_t device_name_size = strlen(dev_infos->device_name);
    if (device_name_size > biggest_name) {
      biggest_name = device_name_size;
    }
  }
  struct nvtop_interface *interface =
    initialize_curses(num_devices, biggest_name, use_color_if_available);
  timeout(refresh_interval);

  while (!(signal_bits & STOP_SIGNAL)) {
    update_device_infos(num_devices, dev_infos);
    if (signal_bits & RESIZE_SIGNAL) {
      update_window_size_to_terminal_size(interface);
      signal_bits &= ~RESIZE_SIGNAL;
    }
    zmsg_t *msg = zmsg_new();
    char* device_num;
    char* free_memory_str;
    char* used_memory_str;
    char* total_memory_str;
    char* gpu_temp_str;
    char* gpu_temp_slowdown_str;
    char* gpu_temp_shutdown_str;
    char* fan_speed_str;
    char* gpu_util_rate_str;
    // zframe_t *frame = zframe_new ("Hello", 5);
    zmsg_pushstr(msg, hostname);
    for(int dev = 0; dev < num_devices; dev++) {
      // zmsg_addmem(msg, dev);
      zmsg_t *mem_msg = zmsg_new();
      zmsg_t *gpu_msg = zmsg_new();
      zmsg_t *temp_msg = zmsg_new();
      // GPU information
      asprintf(&device_num, "%d", dev);
      zmsg_addstr(gpu_msg, device_num);
      zmsg_addstr(gpu_msg,  dev_infos[dev].device_name);
      // Memory information
      asprintf (&used_memory_str, "%llu", dev_infos[dev].used_memory);
      zmsg_addstr(mem_msg, used_memory_str);
      asprintf (&free_memory_str, "%llu", dev_infos[dev].free_memory);
      zmsg_addstr(mem_msg, free_memory_str);
      asprintf (&total_memory_str, "%llu", dev_infos[dev].total_memory);
      zmsg_addstr(mem_msg, total_memory_str);
      // Temperature/Fan information
      asprintf (&gpu_temp_str, "%d", dev_infos[dev].gpu_temp);
      zmsg_addstr(temp_msg, gpu_temp_str);
      asprintf (&gpu_temp_slowdown_str, "%d", dev_infos[dev].gpu_temp_slowdown);
      zmsg_addstr(temp_msg, gpu_temp_slowdown_str);
      asprintf (&gpu_temp_shutdown_str, "%d", dev_infos[dev].gpu_temp_shutdown);
      zmsg_addstr(temp_msg, gpu_temp_shutdown_str);
      asprintf (&fan_speed_str, "%d", dev_infos[dev].fan_speed);
      zmsg_addstr(temp_msg, fan_speed_str);
      // Pack all messages
      zmsg_addmsg (msg, &gpu_msg);
      // GPU usage
      asprintf (&gpu_util_rate_str, "%d", dev_infos[dev].gpu_util_rate);
      zmsg_addstr(msg, gpu_util_rate_str);
      zmsg_addmsg (msg, &mem_msg);
      zmsg_addmsg (msg, &temp_msg);

      zmsg_t *procs_msg = zmsg_new();
      char* pid_str;
      char* used_memory_str;
      for(int proc = 0; proc < dev_infos[dev].num_compute_procs; proc++) {
        zmsg_t *proc_msg = zmsg_new();
        asprintf (&pid_str, "%d", dev_infos[dev].compute_procs[proc].pid);
        zmsg_addstr(proc_msg, pid_str);
        zmsg_addstr(proc_msg, dev_infos[dev].compute_procs[proc].process_name);
        zmsg_addstr(proc_msg, dev_infos[dev].compute_procs[proc].user_name);
        asprintf (&used_memory_str, "%llu", dev_infos[dev].compute_procs[proc].used_memory);
        zmsg_addstr(proc_msg, pid_str);
        zmsg_addmsg (procs_msg, &proc_msg);
      }
      zmsg_addmsg (msg, &procs_msg);
      // zmsg_addstr(msg, "END");
      // zstr_send (push_sock, hostname);
    }
    zmsg_send (&msg, push_sock);
    draw_gpu_info_ncurses(dev_infos, interface);

    int input_char = getch();
    switch (input_char) {
      case 27: // ESC
        {
          timeout(0);
          int in = getch();
          timeout(refresh_interval);
          if (in == ERR) { // ESC alone
            if (is_escape_for_quit(interface))
              signal_bits |= STOP_SIGNAL;
            else
              interface_key(27, interface);
          }
          // else ALT key
        }
        break;
      case KEY_F(3) :
        if (is_escape_for_quit(interface))
          signal_bits |= STOP_SIGNAL;
        break;
      case 'q':
        signal_bits |= STOP_SIGNAL;
        break;
      case KEY_F(1) :
      case KEY_F(2) :
      case '+':
      case '-':
          interface_key(input_char, interface);
        break;
      case KEY_UP:
      case KEY_DOWN:
      case KEY_ENTER:
      case '\n':
        interface_key(input_char, interface);
        break;
      case ERR:
      default:
        break;
    }
  }

  clean_ncurses(interface);
  clean_device_info(num_devices, dev_infos);
  shutdown_gpu_info_extraction();
  zsock_destroy (&push_sock);

  return EXIT_SUCCESS;
}