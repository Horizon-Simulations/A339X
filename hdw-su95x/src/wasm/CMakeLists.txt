# folder structure
set(OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../../../build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/panel)

# add compiler definitions
add_definitions(-DA32NX)

add_subdirectory(extra-backend-a32nx)

# FIXME: remove the if-clause as soon as all components are using CMake
if (WIN32)
    add_subdirectory(fadec_a320)
    add_subdirectory(fbw_a320)
endif ()