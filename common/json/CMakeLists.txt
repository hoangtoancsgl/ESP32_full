set(app_src cJSON.c)
set(pri_reg )

idf_component_register(SRCS ${app_src}
                    INCLUDE_DIRS "."
                    REQUIRES ${pri_reg})
