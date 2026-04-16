cmake_minimum_required (VERSION 3.22)
project(node_core_abi VERSION 1.0.0 LANGUAGES CXX C)

add_definitions(-DNAPI_VERSION=10)

include_directories(${CMAKE_JS_INC})

set(default_build_type "Release")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS ON)

option(CORE_ABI_NO_INT128 "disable use of __int128" OFF)
option(CORE_ABI_ONLY_LIBRARY "define and build the core-abi library" OFF)

if(NOT DEFINED SKIP_SUBMODULE_CHECK)
  execute_process(COMMAND git submodule status --recursive
                  COMMAND grep -c "^[+\-]"
                  WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
                  OUTPUT_VARIABLE submodule_status
                  OUTPUT_STRIP_TRAILING_WHITESPACE)
  if(submodule_status GREATER 0)
     message(FATAL_ERROR "git submodules are not up to date.
Please run the command 'git submodule update --init --recursive'.")
  endif()
endif()

find_package(Threads)
include(GNUInstallDirs)

add_library(core-abi STATIC core-abi/src/abi.cpp core-abi/src/crypto.cpp)
target_include_directories(core-abi PUBLIC core-abi/include core-abi/external/rapidjson/include)

if(CORE_ABI_NO_INT128)
target_compile_definitions(core-abi PUBLIC CORE_ABI_NO_INT128)
endif()

set_target_properties(core-abi PROPERTIES POSITION_INDEPENDENT_CODE ON)

add_library(${PROJECT_NAME} SHARED src/main.cpp core-abi/src/core_abi.cpp)
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" OUTPUT_NAME "core-abi" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB};core-abi;${CMAKE_THREAD_LIBS_INIT})
target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Wextra -Wno-unused-parameter)

execute_process(COMMAND node -p "require('node-addon-api').include" WORKING_DIRECTORY ${CMAKE_SOURCE_DIR} OUTPUT_VARIABLE NODE_ADDON_API_DIR)
string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR})
