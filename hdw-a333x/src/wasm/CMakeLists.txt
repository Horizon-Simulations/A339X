# folder structure
set(OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../../../build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/panel)

# add compiler definitions
add_definitions(-DA32NX)

add_subdirectory(extra-backend-a32nx)

# FIXME: remove the if-clause as soon as all components are using CMake
if (WIN32)
    add_subdirectory(fadec_a330)
    add_subdirectory(fbw_a320)
endif ()