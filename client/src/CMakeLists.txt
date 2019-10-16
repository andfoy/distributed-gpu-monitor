configure_file(
  "${PROJECT_SOURCE_DIR}/include/dgpumon/version.h.in"
  "${PROJECT_BINARY_DIR}/include/dgpumon/version.h"
  IMMEDIATE @ONLY)

add_executable (dgpumon
  dgpumon.c
  get_process_info_linux.c
  extract_gpuinfo.c)

target_include_directories(dgpumon PRIVATE
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>
  $<BUILD_INTERFACE:${PROJECT_BINARY_DIR}/include>)

set_property(TARGET dgpumon PROPERTY C_STANDARD 11)

target_link_libraries(dgpumon
PRIVATE nvml ncurses czmq m)

install (TARGETS dgpumon
  RUNTIME DESTINATION bin)
