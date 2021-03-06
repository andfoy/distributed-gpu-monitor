cmake_minimum_required(VERSION 3.1)

#///////////////////////////////////////////////////////////////////#
#                              PROJECT                              #
#///////////////////////////////////////////////////////////////////#

set(DIST_GPU_MON_VERSION_MAJOR 0)
set(DIST_GPU_MON_VERSION_MINOR 2)
set(DIST_GPU_MON_VERSION_PATCH 0)

project(dgpumon
  LANGUAGES C)

# Default build type
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
  message(STATUS "No building type advertised, default to Release")
endif()

#///////////////////////////////////////////////////////////////////#
#                           DEPENDENCIES                            #
#///////////////////////////////////////////////////////////////////#

if(NVML_RETRIEVE_HEADER_ONLINE)
  file(DOWNLOAD "https://raw.githubusercontent.com/NVIDIA/nvidia-settings/master/src/nvml.h" ${PROJECT_BINARY_DIR}/include/nvml.h)
endif()

list(APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake/modules)

find_package(NVML REQUIRED)

add_library(nvml INTERFACE IMPORTED)
set_property(TARGET nvml PROPERTY
  INTERFACE_INCLUDE_DIRECTORIES ${NVML_INCLUDE_DIRS})
set_property(TARGET nvml PROPERTY
  INTERFACE_LINK_LIBRARIES ${NVML_LIBRARIES})

# set(CURSES_NEED_NCURSES TRUE)
# find_package(Curses REQUIRED)

# add_library(ncurses INTERFACE IMPORTED)
# set_property(TARGET ncurses PROPERTY
#   INTERFACE_INCLUDE_DIRECTORIES ${CURSES_INCLUDE_DIRS})
# set_property(TARGET ncurses PROPERTY
#   INTERFACE_LINK_LIBRARIES ${CURSES_LIBRARIES})


  ########################################################################
  # LIBZMQ dependency
  ########################################################################
  # find_package(libzmq REQUIRED)
  # IF (LIBZMQ_FOUND)
  #     add_library(libzmq INTERFACE IMPORTED)
  #     # include_directories(${LIBZMQ_INCLUDE_DIRS})
  #     # list(APPEND MORE_LIBRARIES ${LIBZMQ_LIBRARIES})
  #     set_property(TARGET libzmq PROPERTY
  #     INTERFACE_INCLUDE_DIRECTORIES ${LIBZMQ_INCLUDE_DIRS})
  #     set_property(TARGET libzmq PROPERTY
  #       INTERFACE_LINK_LIBRARIES ${LIBZMQ_LIBRARIES})
  # ELSE (LIBZMQ_FOUND)
  #     message( FATAL_ERROR "libzmq not found." )
  # ENDIF (LIBZMQ_FOUND)

  ########################################################################
  # CZMQ dependency
  ########################################################################
  find_package(czmq REQUIRED)
  IF (CZMQ_FOUND)
      add_library(czmq INTERFACE IMPORTED)
      set_property(TARGET czmq PROPERTY
        INTERFACE_INCLUDE_DIRECTORIES ${CZMQ_INCLUDE_DIRS})
      set_property(TARGET czmq PROPERTY
        INTERFACE_LINK_LIBRARIES ${CZMQ_LIBRARIES})
      # include_directories(${CZMQ_INCLUDE_DIRS})
      # list(APPEND MORE_LIBRARIES ${CZMQ_LIBRARIES})
  ELSE (CZMQ_FOUND)
      message( FATAL_ERROR "czmq not found." )
  ENDIF (CZMQ_FOUND)

########################################################################
# Msgpack dependency
########################################################################
# find_package(msgpack REQUIRED)
# find_package(Msgpack REQUIRED)
# add_library(Msgpack INTERFACE IMPORTED)
# set_property(TARGET Msgpack PROPERTY
# INTERFACE_INCLUDE_DIRECTORIES ${MSGPACK_INCLUDE_DIRS})
# set_property(TARGET Msgpack PROPERTY
# INTERFACE_LINK_LIBRARIES ${MSGPACK_LIBRARIES})
# IF (MSGPACK_FOUND)
#     add_library(msgpack INTERFACE IMPORTED)
#     set_property(TARGET msgpack PROPERTY
#     INTERFACE_INCLUDE_DIRECTORIES ${MSGPACK_INCLUDE_DIRS})
#     set_property(TARGET msgpack PROPERTY
#     INTERFACE_LINK_LIBRARIES ${MSGPACK_LIBRARIES})
#     # include_directories(${CZMQ_INCLUDE_DIRS})
#     # list(APPEND MORE_LIBRARIES ${CZMQ_LIBRARIES})
# ELSE (MSGPACK_FOUND)
#     message( FATAL_ERROR "msgpack not found." )
# ENDIF (MSGPACK_FOUND)


#///////////////////////////////////////////////////////////////////#
#                        COMPILATION OPTIONS                        #
#///////////////////////////////////////////////////////////////////#

include(cmake/compiler-flags.cmake)

set(CMAKE_C_FLAGS_RELEASE "-O3 -mtune=generic")
set(CMAKE_C_FLAGS_DEBUG
  "${COMPILER_AVALIABLE_WARNINGS} ${COMPILER_ADDRESS_SANITIZER_FLAG} ${COMPILER_UNDEFINED_SANITIZER_FLAG} -Og -g")
set(CMAKE_C_FLAGS_OPTIMIZED
  "${COMPILER_LTO_FLAG} ${COMPILER_MARCH_NATIVE} -O3")
set(CMAKE_C_FLAGS_RELWITHDEBINFO "${CMAKE_C_FLAGS_RELEASE} -g")

# Use full RPATH on build tree
set(CMAKE_SKIP_BUILD_RPATH FALSE)
# Do not build with install RPATH
set(CMAKE_BUILD_WITH_INSTALL_RPATH FALSE)
# Set the RPATH when install
set(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)
# Only set RPATH if the installation directory is not a system directory
LIST(FIND
  CMAKE_PLATFORM_IMPLICIT_LINK_DIRECTORIES "${CMAKE_INSTALL_PREFIX}/lib"
  isSystemDir)
if("${isSystemDir}" STREQUAL "-1")
  set(CMAKE_INSTALL_RPATH "${CMAKE_INSTALL_PREFIX}/lib")
else()
  set(CMAKE_INSTALL_RPATH "")
endif()

add_subdirectory(src)

#///////////////////////////////////////////////////////////////////#
#                             INSTALL                               #
#///////////////////////////////////////////////////////////////////#

configure_file(
  "${CMAKE_CURRENT_SOURCE_DIR}/manpage/dgpumon.in"
  "${CMAKE_CURRENT_BINARY_DIR}/manpage/dgpumon"
  IMMEDIATE @ONLY)
install(FILES
  "${CMAKE_CURRENT_BINARY_DIR}/manpage/dgpumon"
  DESTINATION share/man/man1/
  PERMISSIONS OWNER_READ OWNER_WRITE GROUP_READ WORLD_READ
  RENAME dgpumon.1)

configure_file(
  "${CMAKE_CURRENT_SOURCE_DIR}/cmake/cmake_uninstall.cmake.in"
  "${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake"
  IMMEDIATE @ONLY)
add_custom_target(uninstall
  COMMAND ${CMAKE_COMMAND} -P
  ${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake)
